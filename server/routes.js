/**
 *  Main application routes
 *
 *  /info  -- health monitoring
 *  /api/v1/ -- Controllers live in api/v1/ subdirectory tree
 */

'use strict';

import errorHandler from 'errorhandler';
import logger from './lib/logger';
import errors from './components/errors';

export default function(app) {

  let env = app.get('env');

  /**
   *  Using swagger?
   */
  // if (env === 'development') {
  //   app.use('/swagger', require('./swagger')(app.get('swaggerPath'));
  // }

  /**
   *  /info -- health monitoring endpoint
   */
  app.route('/info')
    .get((req, res) => {
      return res.status(200).json({date: (new Date()).toISOString()});
    });

  /**
   *  All other endpoints
   */
  app.use('/api/v1/hello', require('./api/v1/hello'));

  /**
   *  The 404 black hole
   */
  app.route('/*')
    .get(errors[404]);

  if (env === 'development' || env === 'test') {
    /**
     *  Absolutely, positively NOT FOR PRODUCTION
     *  Will send back in the HTTP response full stack traces.
     */
    app.use(errorHandler()); // Error handler - has to be last
  }
  else {
    /**
     *  Exception handlers
     */
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      if (err.name === 'UnauthorizedError') {
        logger.log(logger.INFO, `Invalid or missing authentication token from ${req.ip}`);
        return res.status(401).json({errors: [ { message: 'Not authorized'} ] });
      }
      else if (err.name === 'Error' && err.message === 'CSRF token missing') {
        logger.log(logger.INFO, `Missing CSRF token from ${req.ip}`);
        return res.status(401).json({errors: [ { message: 'Missing CSRF token' } ]});
      }
      else if (err.message === 'jwt expired') {
        logger.log(logger.INFO, 'Expired jwt token');
        return res.status(401).json({errors: [ { message: 'Not authorized' } ]});
      }
      else {
        logger.log(logger.INFO, `Error triggered by ${req.ip}; ${err.name}: ${err.message}`);
        return res.status(500).json({errors: [ { message: 'Server error' } ]});
      }
    });
  }
}
