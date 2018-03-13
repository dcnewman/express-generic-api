'use strict';

import fs from 'fs';
import gulp from 'gulp';
import lazypipe from 'lazypipe';
import rename from 'gulp-rename';
import runSequence from 'run-sequence';
import nodemon from 'gulp-nodemon';
import mongoose from 'mongoose';
import {spawn} from 'child_process';

var plugins = require('gulp-load-plugins')();

const serverPath = './server';
const buildPath = './build';
const paths = {
  server: `${serverPath}/**/!(*.spec).js`,
  build: `${buildPath}/`,
  test: {
    unit: `${serverPath}/**/*.spec.js`
  }
};

// Ensure mongod is up
function checkDbReady(cb) {
  let config = require(`./${serverPath}/config`);
  let db;
  try {
    mongoose.connect(config.mongo.uri);
    db = mongoose.connection;
    db.on('error', () => cb(false));
    db.once('open', () => {
      db.close();
      cb(true);
    });
  }
  catch (err) {
    if (db) db.close();
    cb(false);
  }
}

// Start mongod running
function whenMongoReady(cb) {
  let dbReady = false;
  let dbReadyInterval = setInterval(() =>
      checkDbReady(ready => {
        if (!ready || dbReady) {
          return;
        }
        clearInterval(dbReadyInterval);
        dbReady = true;
        cb();
      }),
    1000);
}

// Transpile the server sources
let transpileServer = lazypipe()
  .pipe(plugins.sourcemaps.init)
  .pipe(plugins.babel, {
    plugins: [
      'transform-class-properties',
      'transform-runtime'
    ]
  })
  .pipe(plugins.sourcemaps.write, '.');

gulp.task('transpile:server', () => {
  return gulp.src(paths.server)
    .pipe(transpileServer())
    .pipe(gulp.dest(`${paths.build}`));
});


// Lint the server sources
let lintServer = lazypipe()
  .pipe(plugins.eslint, `${serverPath}/.eslintrc`)
  .pipe(plugins.eslint.format);

gulp.task('lint:server', () => {
  return gulp.src([paths.server, `!${serverPath}/test/*`])
    .pipe(lintServer());
});

// Lint the test scripts
let lintTests = lazypipe()
  .pipe(plugins.eslint, {
    configFile: `${serverPath}/.eslintrc`,
    envs: ['node', 'mocha']
  })
  .pipe(plugins.eslint.format);

gulp.task('lint:scripts:test', () => {
  return gulp.src(paths.test.unit)
    .pipe(lintTests());
});

// Build environment for tests
gulp.task('env:test', () => {
  plugins.env({vars: {NODE_ENV: 'test'}});
});

// Build environment for development
gulp.task('env:dev', () => {
  plugins.env({vars: {NODE_ENV: 'development'}});
});

// Docker-related files: copy to the build directory
gulp.task('copy:docker', () => {
  return gulp.src('./Dockerfile')
    .pipe(gulp.dest(`${paths.build}`));
});

gulp.task('copy:package.json', () => {
  return gulp.src('./package.json.docker')
    .pipe(rename('package.json'))
    .pipe(gulp.dest(`${paths.build}`));
});


// Mocha for the test environment
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

// Run the test suite
gulp.task('test', cb => {
  runSequence(
    'env:test',
    'mocha:unit',
    cb);
});

// Run development build with a running Mongo DB
function onServerLog(log) {
  console.log(plugins.util.colors.white('[') +
    plugins.util.colors.yellow('nodemon') +
    plugins.util.colors.white('] ') +
    log.message);
}

gulp.task('start:server', () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  let config = require(`./${serverPath}/config`);
  let mongoLocal = config.mongo.uri.startsWith('mongodb://localhost') ||
    config.mongo.uri.startsWith('mongodb://127.0.0.1') ||
    config.mongo.uri.indexOf('@localhost:') > 0 ||
    config.mongo.uri.indexOf('@127.0.0.1:') > 0;
  let opts = {
    script: `${buildPath}/server.js`,
    watch: `${serverPath}`,
    tasks: ['transpile:server', 'lint:server']
  };

  // Launch mongod --dbpath ./db
  if (mongoLocal && !(process.env.MONGODB_URI || process.env.MONGODB_URL)) {
    // Ensure that ./db/ exists
    if (!fs.existsSync('.db')) {
      fs.mkdirSync('.db');
    }
    console.log('Launching mongodb');
    let child = spawn('mongod', ['--config', './mongod.conf', '--dbpath', '.db']);
    child.stderr.on('data', function (data) {
      console.log('mongodb error: ' + data);
    });

    // Once mongod is running and can be connected to, start node
    whenMongoReady(() => {
      nodemon(opts).on('log', onServerLog);
    });
  }
  else
    nodemon(opts).on('log', onServerLog);
});

gulp.task('serve', cb => {
  runSequence(
    ['lint:server', 'transpile:server'],
    'start:server',
    cb
  );
});

// Normal build: lint, transpile, prepare for Docker
gulp.task('default', ['lint:server', 'transpile:server', 'copy:docker', 'copy:package.json']);
