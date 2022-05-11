'use strict';
const mongoose = require('mongoose'),
    UserBaseSchema = require('../users');

var SuperUserSchema = UserBaseSchema.discriminator('SuperUser', new mongoose.Schema({}));

module.exports = { SuperUserSchema };