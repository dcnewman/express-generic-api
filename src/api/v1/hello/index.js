'use strict';

import { Router } from 'express';
import * as controller from './hello.controller';

var router = new Router();

router.get('/', controller.helloWorld);

module.exports = router;
