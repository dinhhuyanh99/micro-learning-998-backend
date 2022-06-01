'use strict';

const mongoose = require('mongoose'),
    Chapters = mongoose.model("Chapters"),
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

LearnObjSchema.pre('save', function(next){
    var objectToSave = this;
    Chapters.findOne({ _id: objectToSave.belongToChapter }, function (err, doc) {
        if (err) {
            return next(err);
        } else {
            if (doc == null || doc == undefined) {
                return next("This chapter doesn't exist in the system!");
            } else {
                // Push the ID into Chapters object
                Chapters.updateOne({ _id: objectToSave.belongToChapter }, { $push: { learningObjects: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingChapter, updatingResult) {
                    if (errorUpdatingChapter) {
                        if (errorUpdatingChapter.name == "CastError") {
                            res
                                .status(500)
                                .json({
                                    errorCode: 500,
                                    errorMessage: "Invalid chapters ID!",
                                });
                        } else {
                            res
                                .status(500)
                                .json({
                                    errorCode: 500,
                                    errorMessage: errorUpdatingChapter,
                                });
                        }
                    }
                    return next();
                });
            }
        }
    });
});

module.exports = mongoose.model('LearnObj', LearnObjSchema);