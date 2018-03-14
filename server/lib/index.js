'use strict';

import config from '../config';
import _ from 'lodash';

// Handle a schema validation error by sending back a 422 (or other code)
//   Log the error to the console in development mode
export function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    if (config.env === 'development') {
      console.log(err);
    }
    return res.status(statusCode).json(err);
  };
}

// Handle an error from mongoose by sending back a 500 (or other code)
//   Log the error to the console in development mode
export function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    if (config.env === 'development') {
      console.log(err);
    }
    return res.status(statusCode).send(err);
  };
}

// Given an input string 'fld'
//   1. If fld is undefined, null, or empty use the default value, def
//   2. Determine if fld is a valid integer and if so parse it otherwise toss an exception
//   3. Ensure that the value resulting from 1 or 2 is >= min and <= max.  If need be use
//      min or max as the value.
//   4. Return the result
//
// This routine is primarily used to handle pagination values from a query.  To that end,
// we may want to reject "fld" strings longer than, say, 16 bytes as they are clearly bogus
// and may be part of a penetration attempt.
export function validateIntegerInput(fld, def, min, max) {
  let val = def;
  if (!_.isEmpty(fld)) {
    if (isNaN(fld)) {
      throw new Error('Invalid input');
    }
    val = parseInt(fld, 10);
  }
  if (min !== undefined && val < min) {
    val = min;
  }
  else if (max !== undefined && val > max) {
    val = max;
  }
  return val;
}
