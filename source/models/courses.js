'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CourseSchema = new Schema({
    name: {
        type: String
    },
    listOfTeachers: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Users' }],
		default: []
    },
    listOfStudents: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Users' }],
		default: []
    }
}, {timestamps: true});

module.exports = mongoose.model('Courses', CourseSchema);