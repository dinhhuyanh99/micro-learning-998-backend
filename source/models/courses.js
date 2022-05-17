'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CourseSchema = new Schema({
    courseName: {
        type: String,
        required: "Please enter the name for the course!"
    },
    courseCode: {
        type: String,
        required: "Please enter the code for the course!"
    },
    courseOverview: {
        type: String,
        required: "Please enter the overview for the course!"
    },
    courseDiscipline: {
        type: String,
        default: null
    },
    courseLevel: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5] // This will help denote the level of difficulty of a course
    },
    courseStatus: {
        type: Number,
        enum: [-1, 0, 1], // Deactivated, Pending, Active
        default: 1,
        validate: {
            validator: function (courseStatusInput) {
                return /^-{0,1}[1-2]$/g.test(courseStatusInput);
            },
            message: courseStatusOutput => `${courseStatusOutput.value} is not a valid course status value.`
        }
    },
    listOfTeachers: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Users' }],
		default: []
    },
    listOfStudents: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Users' }],
		default: []
    },
    hasChapters: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapters' }],
        default: []
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    durationInWeeks: { // Smallest duration must be 1 week!
        type: Number,
        default: 1
    },
    endDate: { // When end date is reached, we will deactivate the site and hide it for teacher and students.
        type: Date,
        default: null
    }
}, {timestamps: true});

CourseSchema.pre('save', function () { // Before saving, calculate the end date of the course
    var expiredOnDate = new Date(this.startDate);
    if(this.durationInWeeks < 1 || this.durationInWeeks == undefined || this.durationInWeeks == null || this.durationInWeeks == NaN || this.durationInWeeks == ""){
        this.durationInWeeks = 1; // Smallest duration must be 1 week!
    }
    expiredOnDate.setDate(new Date(this.startDate).getDate() + durationInWeeks * 7);
    this.endDate = expiredOnDate;
});

module.exports = mongoose.model('Courses', CourseSchema);