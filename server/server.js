/**
 *  Our main code: nothing much really happens here leaving it mostly up to app.js
 */

'use strict';

// Force NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// For Mocha testing, we actually need to export this.
// Otherwise, we could just do "require('./app');" and all would be fine.
module.exports = require('./app');
