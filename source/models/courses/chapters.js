'use strict';
const mongoose = require('mongoose'),
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

module.exports = mongoose.model('Chapters', ChapterSchema);