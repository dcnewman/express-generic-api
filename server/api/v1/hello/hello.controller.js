'use strict';

export function helloWorld(req, res) {
  return res.status(200).json({msg: 'Hello World!'});
}
