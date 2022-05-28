'use strict';

const mongoose = require('mongoose'),
    Chapters = mongoose.model("Chapters"),
    Schema = mongoose.Schema;

var ProgressMonitorSchema = new Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: "Please give a ID of a student!"
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses',
        required: "Please give a course ID that this student is doing!"
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    chaptersProgress: {
        type: [{
            chapterId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chapters'
            },
            isCompleted: {
                type: Boolean,
                default: false
            },
            startDate: {
                type: Date,
                default: null
            },
            endDate: {
                type: Date,
                default: null
            },
            learningObjectsProgress: {
                type: [{
                    learningObjectId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'LearnObj'
                    },
                    isCompleted: {
                        type: Boolean,
                        default: false
                    },
                    startDate: {
                        type: Date,
                        default: null
                    },
                    endDate: {
                        type: Date,
                        default: null
                    },
                    learningResourcesProgress: {
                        type: [{
                            learningResourceId: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'LearningResource'
                            },
                            isCompleted: {
                                type: Boolean,
                                default: false
                            },
                            startDate: {
                                type: Date,
                                default: null
                            },
                            endDate: {
                                type: Date,
                                default: null
                            },
                            quizParticularMarkings: {
                                type: {
                                    multipleChoicesQuestions: {
                                        type: [Boolean] // This will help us keep track of what question they got right/wrong (true/false respectively)
                                    },
                                    checkboxQuestions: {
                                        type: [Boolean] // This will help us keep track of what question they got right/wrong (true/false respectively)
                                    },
                                    trueFalseQuestions: {
                                        type: [Boolean] // This will help us keep track of what question they got right/wrong (true/false respectively)
                                    },
                                    fillInTheBlankQuestions: {
                                        type: [Boolean] // This will help us keep track of what question they got right/wrong (true/false respectively)
                                    },
                                },
                                default: null
                            },
                            totalMarkForLearningResource: { // Calculate the total amoung of true from the above and get our score for quiz.
                                type: Number,
                                default: 0 // If it's not quiz, we will just put 100 for Video and Reading when they marked those as complete
                            }
                        }],
                        default: []
                    }
                }],
                default: []
            }
        }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('ProgMon', ProgressMonitorSchema);