'use strict';
const mongoose = require('mongoose'),
    UserBaseSchema = require('../users'),
    CourseSchema = require('../courses');

var TeacherSchema = UserBaseSchema.discriminator('Teachers', new mongoose.Schema({
    coursesTaught: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
		default: []
    }
}));

module.exports = {TeacherSchema};