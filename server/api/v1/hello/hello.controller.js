'use strict';

import Sample from '../../../db_models/sample.model';
import * as lib from '../../../lib';

export function helloWorld(req, res) {
  return Sample.create({name: 'Dan', name_s: 'dan'})
    .then(() => {
      return res.status(200).json({msg: 'Hello World!'});
    })
    .catch(lib.validationError(res));
}
