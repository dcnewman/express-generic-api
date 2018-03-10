/**
 *  Instantiate the 'app' -- instantiate the HTTP server
 */

'use strict';

import express from 'express';
import http from 'http';
import _ from 'lodash';
import config from './config';
import logger from './lib/logger';

const app = express();
const server = http.createServer(app);

// Indicate what or runtime "environment" is (e.g., "production", "development", "test")
//   Note: index.js should already have ensured that NODE_ENV exists, but just in case
app.set('env', process.env.NODE_ENV || 'development');

// Configure express.js
require('./express').default(app);

// Establish our routes/endpoints
require('./routes').default(app);

// Start the server running.  We provide this as a function so we
// can push it to the end of the event loop with setImmediate().
function startServer() {
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
}

// Start the app running
setImmediate(startServer);

module.exports = app;
