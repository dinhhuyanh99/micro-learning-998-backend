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
        required: "Please give the file type in this part to indicate what type of file it is (should be the matching the extension type)"
    },
    originalUploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model('Files', FileSchema);