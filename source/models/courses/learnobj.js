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
        default: null // This can be null, and we need to check this first 
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

    // We will try to find if the current object has the belongToChapter attribute, if there is one, we will add it to the chapters list as well
    if(objectToSave.belongToChapter != null){
        Chapters.findOne({ _id: objectToSave.belongToChapter }, function (err, doc) {
            if (err) {
                return next(err);
            } else {
                if (doc == null || doc == undefined) {
                    return next("This chapter doesn't exist in the system!");
                } else {
                    // Push the ID into Chapters object
                    Chapters.updateOne({ _id: objectToSave.belongToChapter }, { $push: { learningObjects: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingChapter) {
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
                                        errorMessage: errorUpdatingChapter.message,
                                    });
                            }
                        }
                        return next();
                    });
                }
            }
        });
    } else {
        // if this is null, the only other case is that this learning object is going to have a parent as another learning object.
        // we will need to check if that's null as well
        if(objectToSave.hasParentLearnObj != null){// if it's not null, we will add the children learning object to the parent's list
            mongoose.model('LearnObj', LearnObjSchema).findOne({ _id: objectToSave.hasParentLearnObj }, function (err, doc) {
                if (err) {
                    return next(err);
                } else {
                    if (doc == null || doc == undefined) {
                        return next("This learning object doesn't exist in the system!");
                    } else {
                        // Push the ID into hasChildrenLearnObj list of the parents
                        // Find the parent then push
                        mongoose.model('LearnObj', LearnObjSchema).updateOne({ _id: objectToSave.hasParentLearnObj }, { $push: { hasChildrenLearnObj: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingParentLearnObj) {
                            if (errorUpdatingParentLearnObj) {
                                if (errorUpdatingChapter.name == "CastError") {
                                    res
                                        .status(500)
                                        .json({
                                            errorCode: 500,
                                            errorMessage: "Invalid Learning Object ID!",
                                        });
                                } else {
                                    res
                                        .status(500)
                                        .json({
                                            errorCode: 500,
                                            errorMessage: errorUpdatingParentLearnObj.message,
                                        });
                                }
                            }
                            return next();
                        });
                    }
                }
            });
        } else {
            // If both are null, we will return an error as a learning object must belong to a chapter or a parent learning objects
            return res.status(400).json({errorCode: 400, errorMessage: "Sorry but we cannot add this learning object! A learning object must belong to either a chapter OR a parent learning object!"});
        }
    }
});

module.exports = mongoose.model('LearnObj', LearnObjSchema);