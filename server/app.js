/**
 *  Instantiate the 'app'; i.e., get the HTTP server up and running!
 */

'use strict';

import mongoose from 'mongoose';
import express from 'express';
import http from 'http';
import _ from 'lodash';
import config from './config';
import logger from './lib/logger';

// Connect to MongoDB
//   We do this early on for purposes of promptly bailing out if there's
//   an issue with db connectivity.  Do this before we establish error
//   handlers as part of the Express.js configuration.

if (config.mongo.debug) {
  // Debug logging please
  mongoose.set('debug', true);
}

mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  // Got an error?  Bail.  BAIL HARD.
  logger.log(logger.ERR, `MongoDB connection error: ${err}`);
  console.error(`MongoDB connection error: ${err}`);
  throw new Error(`Unable to connect to MongoDB; connection error "${err}"`);
});

// Indicate what our runtime "environment" is (e.g., "production", "development", "test")
//   Note: index.js should already have ensured that NODE_ENV exists, but just in case
var env = process.env.NODE_ENV || 'development';

// Different logging levels for different modes
//   But the LOG_LEVEL environment variable always trumps
if (env === 'production') logger.logLevel(process.env.LOG_LEVEL || logger.INFO);
else if (env === 'test') logger.logLevel(process.env.LOG_LEVEL || logger.EMERG); // suppress logging for testing
else logger.logLevel(process.env.LOG_LEVEL || logger.DEBUG);

// Create the Express.js app (finally)
const app = express();
const server = http.createServer(app);
app.set('env', env);

// Configure express.js
require('./express').default(app);

// Establish our routes/endpoints
require('./routes').default(app);

// Start the server running.  We provide this as a function so we
//  can push it to the end of the event loop with setImmediate().
setImmediate(() => {
  server.listen(config.port, config.ip, function() {

    logger.log(logger.NOTICE, `Express server listening on ${config.ip ? config.ip : ''}:${config.port} in ${app.get('env')} mode`);

    // Now that we're bound and listening, fall back to non-root UID and GIDs
    // SECURE code will bind to a non-privileged TCP port and thus not require
    // this server to run as root or otherwise privileged.   DO NOT use privileged
    // TCP ports.  BUT if you must, then be sure to supply in config.perms ("permissions")
    // the UID and GID of a non-privileged account to then do a one-way UID change to

    if (!_.isEmpty(config.perms)) {
      logger.log(logger.DEBUG, `Changing uid:gid to ${config.perms.uid}:${config.perms.gid}`);
      try {
        process.setgroups([config.perms.gid]);
        process.setgid(config.perms.gid);
        process.setuid(config.perms.uid);
        logger.log(logger.NOTICE, `Changed uid:gid to ${config.perms.uid}:${config.perms.gid}`);
      }
      catch (err) {
        throw new Error(`Unable to change uid and gid; ${err}`);
      }
    }
    else {
      logger.log(logger.NOTICE, 'Leaving uid and gid unchanged');
    }
  });
});

module.exports = app;
