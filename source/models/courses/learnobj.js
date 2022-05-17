'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LearnObjSchema = new Schema({
    title: {
        type: String,
        required: "Please enter the name for the chapter!"
    },
    belongToChapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapters',
        required: "A learning objective must belong to an existing chapter!"
    },
    description: {
        type: String,
        required: "Please give a brief description of the learning objective!"
    },
    previousLearnObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearnObj',
        default: null
    },
    nextLearnObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearnObj',
        default: null
    },
    hasLearningResource: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningResource' }],
        default: []
    },
    hasParentLearnObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearnObj',
        default: null
    },
    hasChildrenLearnObj: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearnObj' }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('LearnObj', LearnObjSchema);