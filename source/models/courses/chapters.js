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
        if (err) {
            return next(err);
        } else {
            if (doc == null || doc == undefined) {
                return next("This course doesn't exist in the system!");
            } else {
                // Push the ID into Courses object
                Courses.updateOne({ _id: objectToSave.belongToCourse }, { $push: { hasChapters: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingChapter, updatingResult) {
                    if (errorUpdatingChapter) {
                        if (errorUpdatingChapter.name == "CastError") {
                            res
                                .status(500)
                                .json({
                                    errorCode: 500,
                                    errorMessage: "Invalid course ID!",
                                });
                        } else {
                            res
                                .status(500)
                                .json({
                                    errorCode: 500,
                                    errorMessage: errorUpdatingChapter,
                                });
                        }
                    } else { // If we already update this, we will update the nextChapter and previousChapter reference to the other found chapters
                        if(objectToSave.nextChapter != null){
                            mongoose.model('Chapters', ChapterSchema).updateOne({_id: objectToSave.nextChapter}, { previousChapter: objectToSave._id }, { upsert: true, safe: true}, function (errorUpdatingPreviousChap, updateResultPrev){
                                if (errorUpdatingPreviousChap) {
                                    if (errorUpdatingPreviousChap.name == "CastError") {
                                        res
                                            .status(500)
                                            .json({
                                                errorCode: 500,
                                                errorMessage: "Invalid next ID!",
                                            });
                                    } else {
                                        res
                                            .status(500)
                                            .json({
                                                errorCode: 500,
                                                errorMessage: errorUpdatingPreviousChap,
                                            });
                                    }
                                }
                            });
                        }
                        if (objectToSave.previousChapter != null) {
                            mongoose.model('Chapters', ChapterSchema).updateOne({ _id: objectToSave.previousChapter }, { nextChapter: objectToSave._id }, { upsert: true, safe: true }, function (errorUpdatingNextChap, updateResultNext) {
                                if (errorUpdatingNextChap) {
                                    if (errorUpdatingNextChap.name == "CastError") {
                                        res
                                            .status(500)
                                            .json({
                                                errorCode: 500,
                                                errorMessage: "Invalid previous ID!",
                                            });
                                    } else {
                                        res
                                            .status(500)
                                            .json({
                                                errorCode: 500,
                                                errorMessage: errorUpdatingNextChap,
                                            });
                                    }
                                }
                            });
                        }

                    }
                    return next();
                });
            }
        }
    });
});



// This will happen after saving, basically we will match the ID of the Chapter 
module.exports = mongoose.model('Chapters', ChapterSchema);