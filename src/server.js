/**
 *  Our main code: nothing much really happens here leaving it mostly up to app.js
 */

'use strict';

// Force NODE_ENV if not set
// eslint-disable-next-line no-unused-vars
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/*
if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-register');
}
*/

// Export the application
module.exports = require('./app');
