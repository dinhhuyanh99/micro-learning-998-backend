'use strict';
const mongoose = require('mongoose'),
    LearningObjects = mongoose.model("LearnObj"),
    Schema = mongoose.Schema;

var LearningResourceSchema = new Schema({
    title: {
        type: String,
        required: "Please give this learning resource a meaningful title!"
    },
    description: {
        type: String,
        required: "Please give a brief description of the learning resource!"
    },
    belongToLearnObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearnObj',
        required: "Please give a learning objective!"
    },
    visible: {
        type: Boolean,
        default: true
    },
    containFiles: {
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'Files'}],
        default: []
    }
}, { timestamps: true });

LearningResourceSchema.pre('save', function (next) {
    var objectToSave = this;
    if (objectToSave.belongToLearnObj != null) {
        LearningObjects.findOne({ _id: objectToSave.belongToLearnObj }, function (err, doc) {
            if (err) {
                return next(err);
            } else {
                if (doc == null || doc == undefined) {
                    return next("This learning object doesn't exist in the system!");
                } else {
                    // Push the ID into Courses object
                    LearningObjects.updateOne({ _id: objectToSave.belongToLearnObj }, { $push: { hasLearningResource: objectToSave._id } }, { upsert: true, safe: true }, function (errorUpdatingLearnObj) {
                        if (errorUpdatingLearnObj) {
                            if (errorUpdatingLearnObj.name == "CastError") {
                                res
                                    .status(500)
                                    .json({
                                        errorCode: 500,
                                        errorMessage: "Invalid learn obj ID!",
                                    });
                            } else {
                                res
                                    .status(500)
                                    .json({
                                        errorCode: 500,
                                        errorMessage: errorUpdatingLearnObj,
                                    });
                            }
                        }
                    });
                }
            }
        });
        return next();
    } else {
        // If it's null, we will return an error as it must belong to a course 
        return res.status(400).json({ errorCode: 400, errorMessage: "Sorry but we cannot add this resource! A resource must belong to a learning object!" });
    }
});
module.exports = mongoose.model('LearningResource', LearningResourceSchema);