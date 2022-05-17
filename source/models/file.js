'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileSchema = new Schema({
    fileUri: {
        type: String,
        required: "Please give this file the uri to the content!"
    },
    fileType: {
        type: String,
        required: "Please give the file "
    }
}, { timestamps: true });

module.exports = mongoose.model('LearningNotes', LearningNotesSchema);