'use strict';
const mongoose = require('mongoose'),
    UserBaseSchema = require('../users'),
    CourseSchema = require('../courses');

var StudentSchema = UserBaseSchema.discriminator('Students', new mongoose.Schema({
    coursesLearnt: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
		default: []
    }
}));

module.exports = {StudentSchema};