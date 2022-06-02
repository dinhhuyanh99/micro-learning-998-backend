'use strict';
const mongoose = require('mongoose'),
    LearningResourceBaseSchema = require('./learnres');
var LearningResVidSchema = LearningResourceBaseSchema.discriminator('Video', new mongoose.Schema({
    hasTranscripts: {
        type: [{
            videoTimestamp: {
                type: Number
            },
            content: {
                type: String
            }
        }],
        default: []
    },
    videoUrl: {
        type: String,
        required: "Please put in the link towards the video here!"
    }
}));
module.exports = { LearningResVidSchema };