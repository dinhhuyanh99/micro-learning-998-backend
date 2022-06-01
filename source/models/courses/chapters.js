'use strict';

const mongoose = require('mongoose'),
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
                Courses.updateOne({ _id: objectToSave.belongToCourse }, { $push: { hasChapters: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingChapter) {
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
                    }
                });
            }
        }
    });
});

module.exports = mongoose.model('Chapters', ChapterSchema);