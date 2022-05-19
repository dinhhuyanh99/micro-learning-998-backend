'use strict';
const mongoose = require('mongoose'),
    UserBaseSchema = require('../users'),
    CourseSchema = require('../courses');

var SuperUserSchema = UserBaseSchema.discriminator('SuperUser', new mongoose.Schema({
    coursesLearnt: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
        default: []
    },
    coursesTaught: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
        default: []
    }
}));

module.exports = { SuperUserSchema };