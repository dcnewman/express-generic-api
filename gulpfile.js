'use strinct';

var gulp = require('gulp');
var lazypipe = require('lazypipe');
var plugins = require('gulp-load-plugins')();
var rename = require('gulp-rename');

const paths = {
    src: './src/**/*.js',
    build: './build/'
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

gulp.task('lint:server', function() {
  return gulp.src(paths.src)
    .pipe(lintServerScripts());
});

gulp.task('transpile:server', function() {
  return gulp.src(paths.src)
    .pipe(transpileServer())
    .pipe(gulp.dest(`${paths.build}`));
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

gulp.task('default', ['lint:server', 'transpile:server', 'copy:docker', 'copy:package.json']);

