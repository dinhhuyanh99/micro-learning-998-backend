'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LearningResourceSchema = new Schema({
    title: {
        type: String,
        required: "Please give this learning resource a meaningful title!"
    },
    description: {
        type: String,
        required: "Please give a brief description of the learning objective!"
    },
    resourceType: {
        type: String,
        enum: ["Video", "Reading", "Quiz"],
        required: "Please give the type of the "
    },
    hasNotes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningNotes'
    },
    belongToLearnObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearnObj'
    },
    previousLearnRes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
        default: null
    },
    nextLearnRes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
        default: null
    },
    visible: {
        type: Boolean,
        default: true
    },
    containFiles: {
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Files',
            default: null
        }],
        default: []
    }
}, { timestamps: true });

var LearningResVidSchema = LearningResourceSchema.discriminator('Video', new mongoose.Schema({
    hasTranscripts: {
        type: [{
            videoTimestamp: {
                type: Number
            },
            content: {
                type: String
            }
        }],
        default:[]
    },
    videoUrl: {
        type: String,
        required: "Please put in the link towards the video here!"
    }
}));

var LearningResReadSchema = LearningResourceSchema.discriminator('Reading', new mongoose.Schema({
    content: {
        type: String,
        required: "Please put in the content for the Reading section of the resource."
    }
}));

var LearningResQuizSchema = LearningResourceSchema.discriminator('Quiz', new mongoose.Schema({
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

module.exports = mongoose.model('LearningResource', LearningResourceSchema);