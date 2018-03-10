/**
 *  Error responses
 */

'use strict';

module.exports[404] = function pageNotFound(req, res) {
  return res.status(404).json({error: 'These are not the droids you are looking for'});
};
