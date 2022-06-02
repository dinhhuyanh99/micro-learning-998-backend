'use strict';
const mongoose = require('mongoose'),
    LearningResourceBaseSchema = require('./learnres');
var LearningResQuizSchema = LearningResourceBaseSchema.discriminator('Quiz', new mongoose.Schema({
    multipleChoicesQuestions: {
        type: [{
            questionDescription: {
                type: String,
                required: "You need to enter the question!"
            },
            questionChoices: [{
                answerDescription: {
                    type: String,
                    required: "Please enter the answer to the quiz"
                },
                answerIndex: {
                    type: Number,
                    required: "Please give this answer an index!"
                }
            }],
            response: {
                type: Number,
                required: "Please give this question the correct answer index!"
            }
        }],
        default: []
    },
    checkboxQuestions: {
        type: [{
            questionDescription: {
                type: String,
                required: "You need to enter the question!"
            },
            questionChoices: [{
                answerDescription: {
                    type: String,
                    required: "Please enter the answer to the quiz"
                },
                answerIndex: {
                    type: Number,
                    required: "Please give this answer an index!"
                }
            }],
            response: {
                type: [Number], // An array of correct indices
                default: [],
                required: "Please give this question the correct answer indices!"
            }
        }],
        default: []
    },
    trueFalseQuestions: {
        type: [{
            questionDescription: {
                type: String,
                required: "You need to enter the question!"
            },
            response: {
                type: Boolean,
                required: "Please give this question the correct answer (Either true or false)!"
            }
        }],
        default: []
    },
    fillInTheBlankQuestions: {
        type: [{
            questionDescription: {
                type: String,
                required: "You need to enter the question that includes all the blank space indicated as _ (underscore)!"
            },
            response: {
                type: [String], // An array containing words
                required: "Please give this question the list of correct words to fill in the blank in the order that they supposed to go into the question! DO NOT SHUFFLE IT!"
            }
        }],
        default: []
    }

}));

module.exports = { LearningResQuizSchema };