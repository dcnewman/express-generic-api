'use strict';

// eslint-disable-next-line no-unused-vars
export function helloWorld(req, res, next) {
  return res.status(200).json({msg: 'Hello World!'});
}
