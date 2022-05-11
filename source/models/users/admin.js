'use strict';
const mongoose = require('mongoose'),
    UserBaseSchema = require('../users');

var AdminSchema = UserBaseSchema.discriminator('Admin', new mongoose.Schema({}));

module.exports = { AdminSchema };