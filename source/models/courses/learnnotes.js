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
        required: "Please give a brief description for the note!"
    },
    belongToLearningResource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
        default: null
    },
    belongToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: "Please give an user ID for binding!"
    }
}, { timestamps: true });

module.exports = mongoose.model('LearningNotes', LearningNotesSchema);