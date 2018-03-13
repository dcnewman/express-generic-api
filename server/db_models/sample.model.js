'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;

import { sampleSchemaJSON } from '../schemas/sample.schema';

var SampleSchema = new Schema(sampleSchemaJSON, { collection: 'samples' });

module.exports = mongoose.model('Sample', SampleSchema);
