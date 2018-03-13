'use strict';

var gulp = require('gulp');
var lazypipe = require('lazypipe');
var plugins = require('gulp-load-plugins')();
var rename = require('gulp-rename');
var runSequence = require('run-sequence');

const srcPath = './src';
const buildPath = './build';

const paths = {
  src: `${srcPath}/**/!(*.spec).js`,
  build: `${buildPath}/`,
  test: {
    unit: `${srcPath}/**/*.spec.js`
  }
};

let transpileServer = lazypipe()
  .pipe(plugins.sourcemaps.init)
  .pipe(plugins.babel, {
    plugins: [
      'transform-class-properties',
      'transform-runtime'
    ]
  })
  .pipe(plugins.sourcemaps.write, '.');

let lintServerScripts = lazypipe()
  .pipe(plugins.eslint, 'src/.eslintrc')
  .pipe(plugins.eslint.format);

let lintTestScripts = lazypipe()
  .pipe(plugins.eslint, {
    configFile: `${srcPath}/.eslintrc`,
    envs: ['node', 'mocha']
  })
  .pipe(plugins.eslint.format);

gulp.task('lint:server', function () {
  return gulp.src([ paths.src, `!${srcPath}/test/*`])
    .pipe(lintServerScripts());
});

gulp.task('env:test', () => {
  plugins.env({vars: {NODE_ENV: 'test'}});
});

gulp.task('transpile:server', function () {
  return gulp.src(paths.src)
    .pipe(transpileServer())
    .pipe(gulp.dest(`${paths.build}`));
});

gulp.task('lint:scripts:test', () => {
  return gulp.src(paths.test.unit)
    .pipe(lintTestScripts());
});

gulp.task('copy:docker', () => {
  return gulp.src('./Dockerfile')
    .pipe(gulp.dest(`${paths.build}`));
});

gulp.task('copy:package.json', () => {
  return gulp.src('./package.json.docker')
    .pipe(rename('package.json'))
    .pipe(gulp.dest(`${paths.build}`));
});

let mocha = lazypipe()
  .pipe(plugins.mocha, {
    reporter: 'spec',
    timeout: 5000,
    require: [
      './mocha.conf'
    ]
  });

gulp.task('mocha:unit', () => {
  return gulp.src(paths.test.unit)
    .pipe(mocha());
});

gulp.task('test', cb => {
  runSequence(
    'env:test',
    'mocha:unit',
    cb);
});

gulp.task('default', ['lint:server', 'transpile:server', 'copy:docker', 'copy:package.json']);
