/**
 *  Express.js configuration
 *  We here configure express and the assorted pieces of middleware
 *  we intend to use.
 *
 *  Ordering of some/much of the middleware is important (e.g., compression
 *  middleware before establishing handling of static files).
 */

'use strict';

import logger from './lib/logger';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import config from './config';

// Stuff we might use
// import express from 'express';
// import path from 'path';
// import lusca from 'lusca';
// import passport from 'passport';
// import session from 'express-session';
// import mongoose from 'mongoose';
// import URL from 'url';
// import moment from 'moment';
// import favicon from 'serve-favicon';
// import cookieParser from 'cookie-parser';
// import stripAnsi from 'strip-ansi';

// Using mongo as our session store?
// import connectMongo from 'connect-mongo';
// var MongoStore = connectMongo(session);

// Using browser-sync for development?
// var browserSync = require('browser-sync').create();

export default function(app) {

  let env = app.get('env');

  /**
   *  Force https by redirecting http:// to https:// ?
   *  Primarily for production, but let's have a config variable for it
   */
  if (config.force_https) {
    app.use((req, res, next) => {
      if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
        // Defaults to 302; use 301 if preferred
        return res.redirect('https://' + req.get('Host') + req.url);
      }
      else {
        next();
        return null;  // necessary in some instances to prevent broken promises
      }
    });
  }

  /**
   *  If we're behind a proxy AND trust it AND want req.ip
   *  to carry the HTTP request's X-Forwarded-For: header
   *  line, then enable 'trust proxy'
   */
  if (config.trust_proxy) {
    app.enable('trust proxy');
  }

  /**
   *  Use swagger for API docs
   *  https://swagger.io/
   */
  // if (env === 'development' || env === 'test') {
  //    app.set('swaggerPath', path.join(config.root, 'swagger'));
  // }

  /**
   *  Enable compression: must be set before any static files we
   *  might serve out; otherwise, they won't be compressed.
   *  https://github.com/expressjs/compression
   */
  app.use(compression({threshold: config.compression || '5kb'}));

  /**
   *  Are we serving content to web browsers?
   *
   *  let appPath = path.join(config.root, 'client');
   *  app.set('appPath', appPath);
   *
   * Favicon?
   *
   *  app.use(favicon(path.join(appPath, 'favicon.ico');
   *
   *  Are there some files we want to set some HTTP caching on?  We can put
   *  them in the 'specials' array below.
   *
   * let specials = [ `${appPath}/app.`, `${appPath}/polyfills.`, `${appPath}/vendor.` ];
   *
   * app.use(express.static(app.get('appPath'), { setHeaders: (res, urlPath, stat) => {
   *
   *     Tell browsers to cache these specials for at least 30 days.
   *
   *     for (let i = 0; i < specials.length; i++) {
   *       if (urlPath.startsWith(specials[i])) {
   *          res.header('Cache-control', 'public, max-age=2592000');
   *          res.header('Last-modified', moment(stat.mtime).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]'));
   *          break;
   *       }
   *     }
   * } }));
   *
   *  More possible candy if we're servicing web browsers
   *
   *  app.engine('html', require('ejs').renderFile);
   *  app.set('view engine', 'html');
   */

  /**
   *  Morgan logging library
   *  https://github.com/expressjs/morgan
   */
  if (env === 'prooduction') {
    app.use(morgan('combined', { stream: logger.stream }));
  }
  else if (env !== 'test') {
    // Morgan's development format
    app.use(morgan('dev', { stream: logger.stream }));
  }

  /**
   *  Construct req.body by parsing the HTTP body
   *  https://github.com/expressjs/body-parser
   */
  app.use(bodyParser.urlencoded({ extended: false, limit: config.max_urlencoded || '100kb' }));
  app.use(bodyParser.json({ limit: config.max_json || '100kb' }));

  /**
   *  support X-HTTP-Method-Override
   *  https://github.com/expressjs/method-override
   *  method-override MUST be used before any CSURF (e.g., lusca)
   */
  app.use(methodOverride());

  /**
   *  Cookie handling
   *  https://github.com/expressjs/cookie-parser
   */
  // app.use(cookieParser(config.cookie_secret));

  /**
   *  Passport.js
   *  http://www.passportjs.org/
   */
  // app.use(passport.initialize());

  /**
   * Persist sessions with MongoStore / sequelizeStore
   * We need to enable sessions for passport-twitter because it's an
   * oauth 1.0 strategy, and Lusca depends on sessions
   *
   * Need to tease the mongo db name out of the mongo db URI
   *
   * let db;
   * if (config.mongo.uri) {
   *   try {
   *     let url = URL.parse(config.mongo.uri);
   *     db = url.pathname.substr(1 + url.pathname.lastIndexOf('/'));
   *   }
   *   catch (err) {
   *     db = config.mongo.db;
   *   }
   * }
   * else {
   *   db = config.mongo.db;
   * }
   *
   * Now set up our session store
   *
   * app.use(session({
   *   secret: config.session.secret,
   *   saveUninitialized: false,
   *   resave: false,
   *   store: new MongoStore({
   *     ttl: config.session.db_ttl,
   *     touchAfter: config.session.db_touch,
   *     mongooseConnection: mongoose.connection,
   *     db
   *   })
   * }));
   */

  /**
   * Lusca - express server security (from PayPal)
   * https://github.com/krakenjs/lusca
   *
   * Must come after method-override
   *
   * if (env !== 'test' && !config.sauce && !config.nocsrf) {
   *   app.use(lusca({
   *     csrf: {
   *       angular: true,
   *       // Do not apply CSRF to our RESTful API used by third parties
   *       whitelist_re: /^\/api\/v\d\//
   *     },
   *     xframe: 'SAMEORIGIN',
   *     hsts: {
   *       maxAge: 31536000, //1 year, in seconds
   *       includeSubDomains: true,
   *       preload: true
   *     },
   *     xssProtection: true
   *   }));
   * }
   */

  /**
   * Run Browsersync and use middleware for Hot Module Replacement
   *
   * if (env === 'development') {
   *   const webpackDevMiddleware = require('webpack-dev-middleware');
   *   const webpack = require('webpack');
   *   const makeWebpackConfig = require('../../webpack.make');
   *   const webpackConfig = makeWebpackConfig({ DEV: true });
   *   const compiler = webpack(webpackConfig);
   *
   *   browserSync.init({
   *     open: false,
   *     logFileChanges: false,
   *     proxy: `localhost:${config.port}`,
   *     ws: true,
   *     middleware: [
   *       webpackDevMiddleware(compiler, {
   *         noInfo: false,
   *         stats: {
   *           colors: true,
   *           timings: true,
   *           chunks: false
   *         }
   *       })
   *     ],
   *     port: config.browserSyncPort,
   *     plugins: ['bs-fullscreen-message']
   *   });
   *
   *  Reload all devices when bundle is complete
   *  or send a fullscreen error message to the browser instead
   *
   *   compiler.plugin('done', function (stats) {
   *     logger.log(logger.NOTICE, 'webpack done hook');
   *     if (stats.hasErrors() || stats.hasWarnings()) {
   *       return browserSync.sockets.emit('fullscreen:message', {
   *         title: 'Webpack Error:',
   *         body: stripAnsi(stats.toString()),
   *         timeout: 100000
   *       });
   *     }
   *     browserSync.reload();
   *   });
   * }
   */
}
