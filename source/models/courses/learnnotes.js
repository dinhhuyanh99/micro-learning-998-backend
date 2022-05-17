'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LearningNotesSchema = new Schema({
    title: {
        type: String,
        required: "Please give this learning resource a meaningful title!"
    },
    description: {
        type: String,
        required: "Please give a brief description of the learning objective!"
    },
    belongToLearningResource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource'
    },
    belongToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { timestamps: true });

module.exports = mongoose.model('LearningNotes', LearningNotesSchema);