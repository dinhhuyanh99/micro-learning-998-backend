'use strict';

const users = require('./users');

const mongoose = require('mongoose'),
    Users = mongoose.model("Users"),
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
        enum: [0, 1, 2, 3, 4, 5], // This will help denote the level of difficulty of a course
        default: 0
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
    teacherRef: { // Changed to 1 teacher 1 course only
        type: mongoose.Schema.Types.ObjectId, ref: 'Users' 
    },
    listOfStudents: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Users' }],
		default: []
    },
    hasChapters: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapters' }],
        default: []
    },
    durationInWeeks: { // Smallest duration must be 1 week!
        type: Number,
        default: 1
    }
}, {timestamps: true});

CourseSchema.pre('save', function (next, done) { // Set the duration back to 1 if it's smaller or undefined/null
    var objectToSave = this;
    if(this.durationInWeeks < 1 || this.durationInWeeks == undefined || this.durationInWeeks == null || this.durationInWeeks == NaN || this.durationInWeeks == ""){
        this.durationInWeeks = 1; // Smallest duration must be 1 week!
    }
    // We will also check if the teacher is available then update the teacher's list to reflect the course they are teaching
    if (objectToSave.teacherRef == undefined || objectToSave.teacherRef == null || objectToSave.teacherRef == ""){ // if it's empty, which never happened, but we will still put this here
        res
            .status(500)
            .json({
                errorCode: 500,
                errorMessage: "Sorry but teacher reference cannot be null",
            });
        return next();
    } else {
        Users.findOne({ _id: objectToSave.teacherRef }, function (err, doc) {
            if (err) {
                return next(err);
            } else {
                if (doc == null || doc == undefined) {
                    return next("This teacher " + objectToSave.teacherRef + " doesn't exist in the system!");
                } else { //  If the teacher actually exists
                    // Check __t for the type
                    if (doc.__t != "Teachers" &&
                        doc.__t != "Admin" &&
                        doc.__t != "SuperUser") {
                        return next("The user that is assigned to this must be a teacher or of higher levels in the system");
                    }
                    // If it's alright, we will update the coursesTaught list for the particular Teachers
                    Users.updateOne({ _id: doc._id, __t: doc.__t }, { $push: { coursesTaught: objectToSave._id, userActivities: { activityDescription: "Added a course with the name " + objectToSave.courseName + " with ID: [" + objectToSave._id + "]." } } }, { upsert: true, safe: true }, function (errorUpdatingUser, updatingResult) {
                        if (errorUpdatingUser) {
                            if (errorUpdatingUser.name == "CastError") {
                                res
                                    .status(500)
                                    .json({
                                        errorCode: 500,
                                        errorMessage: "Invalid user ID!",
                                    });
                                return next();
                            } else {
                                res
                                    .status(500)
                                    .json({
                                        errorCode: 500,
                                        errorMessage: errorUpdatingUser,
                                    });
                                return next();
                            }
                        }
                    });
                }
            }
        });    
    }
    // We don't need to check for student since they have to enrol themselves later...
    return next();
});

module.exports = mongoose.model('Courses', CourseSchema);