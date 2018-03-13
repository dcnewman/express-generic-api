/**
 *  Configuration settings
 */
'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

// Do not use const as _.merge() mutates its first argument
var all = {
  env: process.env.NODE_ENV || 'development',

  /**
   *  TCP port to bind to
   *  This is the port appearing in, e.g., https://<host>:port/
   *  Avoid using a privileged port (port < 1024).
   */
  port: process.env.PORT || 9000,

  /**
   *  IP address to bind to (e.g., IP address the server listens on)
   *  Use '0.0.0.0' to listen on all available interfaces (aka, INADDR_ANY)
   */
  ip: process.env.IP || '0.0.0.0',

  // Redirect all HTTP requests to HTTPS?
  force_https: false,

  /**
   *  If we're behind a proxy and trust it and want req.ip
   *  to carry the HTTP request's X-Forwarded-For: header
   *  line, then enable trust_proxy
   *
   *  AWS ELB -- Safe to use; true
   *  nginx   -- Safe to use; true (barring insane configuration)
   */
  trust_proxy: true,

  /**
   *  Compress HTTP responses larger than this threshhold
   *  https://github.com/expressjs/compression
   *  (values formatted as per https://www.npmjs.com/package/bytes)
   */
  compression: '5kb',

  /**
   *  For body-parser, limits the maximum HTTP request body size
   *  which will be parsed and stored into req.
   *  https://github.com/expressjs/body-parser
   *  (values formatted as per https://www.npmjs.com/package/bytes)
   */
  max_urlencoded: '100kb',
  max_json: '100kb',

  /**
   *  Mongo db info
   */
  mongo: {
    debug: process.env.MONGODB_DEBUG || false,
    options: {
      autoIndex: process.env.MONGODB_AUTO_INDEX || false,
      promiseLibrary: Promise, // same as require('bluebird')
      w: 'safe' // write concern
    }
  },

  /**
   *  DO NOT BIND TO privileged TCP PORTS!!! (Generally, ports < 1024)
   *  But if you have to, then establish a non-privileged account which
   *  is NOT in the system group.  And then set it's UID and GID below.
   *
   *  Use instead, e.g., docker's ability to do port forwarding: if the
   *  inbound service must be on 80 or 443, then have docker forward those
   *  to, e.g., 8080.
   */
  // perms: {
  //   uid: xxx, // UID of a non-priv'd account; used when port is a priv'd TCP port
  //   gid: xxx, // GID of a non-priv'd account; used when port is a priv'd TCP port
  // },
};

module.exports = _.merge(
  all,
  require(`./${process.env.NODE_ENV}.js`) || {}
);
