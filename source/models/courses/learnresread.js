'use strict';
const mongoose = require('mongoose'),
    LearningResourceBaseSchema = require('./learnres');
var LearningResReadSchema = LearningResourceBaseSchema.discriminator('Reading', new mongoose.Schema({
    content: {
        type: String,
        required: "Please put in the content for the Reading section of the resource."
    }
}));

module.exports = { LearningResReadSchema };