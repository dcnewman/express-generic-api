/**
 *  Development mode configuration settings
 */

'use strict';

import secrets from './secrets';

module.exports = {
  mongo: {
    uri: process.env.MONGO_URI || secrets.mongo_uri || 'mongodb://localhost:27017'
  }
};
