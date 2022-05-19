'use strict';
const mongoose = require('mongoose'),
    learnObj = require('./learnobj'),
    CourseSchema = require('../courses'),
    Courses = mongoose.model("Courses"),
    Schema = mongoose.Schema;

var ChapterSchema = new Schema({
    chapterName: {
        type: String,
        required: "Please enter the name for the chapter!"
    },
    belongToCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses',
        required: "A Chapter must belong to an existing course!"
    },
    nextChapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapters',
        default: null
    },
    previousChapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapters',
        default: null
    },
    learningObjects: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'LearnObj'}],
        default: []
    }
}, { timestamps: true });


ChapterSchema.pre('save', function (next) { // Before saving, calculate the end date of the course
    var objectToSave = this;
    Courses.findOne({ _id: objectToSave.belongToCourse }, function (err, doc) {
        console.log(doc);
        if (err) {
            return next(err);
        } else {
            if (doc == null || doc == undefined) {
                return next("This course doesn't exist in the system!");
            } else {
                Courses.updateOne({ _id: objectToSave.belongToCourse }, { $push: { hasChapters: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingChapter, updatingResult) {
                    if (errorUpdatingChapter) {
                        if (errorUpdatingChapter.name == "CastError") {
                            res
                                .status(500)
                                .json({
                                    errorCode: 500,
                                    errorMessage: "Invalid user ID!",
                                });
                        } else {
                            res
                                .status(500)
                                .json({
                                    errorCode: 500,
                                    errorMessage: errorUpdatingChapter,
                                });
                        }
                    }
                    return next();
                });
            }
        }
        return next();
    });
});
module.exports = mongoose.model('Chapters', ChapterSchema);