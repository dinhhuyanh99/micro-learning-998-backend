'use strict';
const mongoose = require('mongoose'),
    UserBaseSchema = require('../users'),
    CourseSchema = require('../courses');

var AdminSchema = UserBaseSchema.discriminator('Admin', new mongoose.Schema({
    coursesLearnt: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
        default: []
    },
    coursesTaught: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
        default: []
    }
}));

module.exports = { AdminSchema };