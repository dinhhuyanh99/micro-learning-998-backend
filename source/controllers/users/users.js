"use strict";

const mongoose = require("mongoose"),
    Users = mongoose.model("Users"),
    { TeacherSchema } = require("../../models/users/teachers"),
    { StudentSchema } = require("../../models/users/students"),
    { AdminSchema } = require("../../models/users/admin"),
    { SuperUserSchema } = require("../../models/users/superuser"),
    Keys = mongoose.model("Keys"),
    configParams = require('../../../config.json'),
    bcrypt = require("bcrypt");

function cryptPassword(password) {
    const salt = bcrypt.genSaltSync(10, "b");
    return bcrypt.hashSync(password, salt);
}

function comparePassword(plainPass, hashword) {
    return bcrypt.compareSync(plainPass, hashword);
}

exports.userLogin = function (req, res) {
    if (
        req.body.username == undefined ||
        req.body.username == "" ||
        req.body.password == undefined ||
        req.body.password == ""
    ) {
        res
            .status(400)
            .json({
                errorCode: 400,
                errorMessage: "Missing login details, please check again!",
            });
    } else {
        Users.findOne({ username: req.body.username }, function (err, doc) {
            if (err) {
                res.status(500).json({ errorCode: 500, errorMessage: err });
            } else {
                if (doc == null || doc == undefined) {
                    res
                        .status(500)
                        .json({
                            errorCode: 500,
                            errorMessage: "User doesn't exist in the system!",
                        });
                } else {
                    if (doc.accountStatus == -1) {
                        res
                            .status(403)
                            .json({
                                errorCode: 403,
                                errorMessage:
                                    "Sorry but your account is deactivated, please ask the admin to reactivate your account!",
                            });
                    } else if (doc.accountStatus == -2) {
                        res
                            .status(403)
                            .json({
                                errorCode: 403,
                                errorMessage:
                                    "Sorry but your account is banned, please ask the admin to unban your account!",
                            });
                    } else if (doc.accountStatus == 1) {
                        if (comparePassword(req.body.password, doc.password)) {
                            Keys.find({ userId: doc._id }, function (keyError, list) {
                                if (keyError) {
                                    res.status(500).json({ errorCode: 500, errorMessage: err });
                                } else {
                                    if (list.length == 0) {
                                        // If there is no API key for the user
                                        var newKey = new Keys({
                                            key: undefined,
                                            userId: doc._id,
                                        });
                                        var returnResult = {
                                            result:
                                                "Successfully logged in! An API Key has been created and is valid for 14 days.",
                                            apiKey: newKey.key,
                                            expiredOn: newKey.expiredOn,
                                            userDetails: {
                                                email: doc.email,
                                                username: doc.username,
                                                phoneNumber: doc.phoneNumber,
                                                firstName: doc.firstName,
                                                lastName: doc.lastName,
                                                dateOfBirth: new Date(doc.dateOfBirth),
                                                address: doc.address,
                                                countryRegion: doc.countryRegion,
                                                city: doc.city,
                                                streetProvince: doc.streetProvince,
                                                zipCode: doc.zipCode,
                                                gender: doc.gender,
                                                userActivities: doc.userActivities,
                                            },
                                        };
                                        if (doc.__t === "Teachers") {
                                            returnResult.userDetails.coursesTaught =
                                                doc.coursesTaught;
                                            returnResult.userDetails.flag = "t";
                                        } else if (doc.__t === "Students") {
                                            returnResult.userDetails.coursesLearnt =
                                                doc.coursesLearnt;
                                            returnResult.userDetails.flag = "s";
                                        } else if (doc.__t === "Admin") {
                                            console.log("Admin logged in at [" + new Date().toLocaleDateString() + "]. Admin username: [" + doc.username + "].");
                                            returnResult.userDetails.flag = "a";
                                        } else if (doc.__t === "SuperUser") {
                                            console.log("SuperUser logged in at [" + new Date().toLocaleDateString() + "]. SuperUser username: [" + doc.username + "].");
                                            returnResult.userDetails.flag = "su";
                                        }
                                        newKey
                                            .save()
                                            .then((saved) => {
                                                res.status(200).json(returnResult); Users.updateOne(
                                                    { _id: doc._id },
                                                    {
                                                        $push: {
                                                            userActivities: { activityDescription: "Logged in!" },
                                                        },
                                                    },
                                                    function (errorUpdatingUser, updatingResult) {
                                                        if (errorUpdatingUser) {
                                                            if (errorUpdatingUser.name == "CastError") {
                                                                res
                                                                    .status(500)
                                                                    .json({
                                                                        errorCode: 500,
                                                                        errorMessage: "Invalid user ID!",
                                                                    });
                                                            } else {
                                                                res
                                                                    .status(500)
                                                                    .json({
                                                                        errorCode: 500,
                                                                        errorMessage: errorUpdatingUser,
                                                                    });
                                                            }
                                                        }
                                                    }
                                                );
                                            })
                                            .catch((saving_err) =>
                                                res
                                                    .status(500)
                                                    .json({ errorCode: 500, errorMessage: saving_err })
                                            );
                                    } else {
                                        // If there exists a few
                                        var currentDate = new Date(Date.now());
                                        var currentExpiredOn;
                                        for (var iterator = 0; iterator < list.length; iterator++) {
                                            currentExpiredOn = new Date(list[iterator].expiredOn);
                                            if (currentDate.getTime() >= currentExpiredOn.getTime()) {
                                                // If the key expired, proceed to either check if the iterator is already at the last one
                                                if (iterator == list.length - 1) {
                                                    // If the iterator reached the last one, we will create a new one
                                                    var newKey = new Keys({
                                                        key: undefined,
                                                        userId: doc._id,
                                                    });
                                                    var returnResult = {
                                                        result:
                                                            "Successfully logged in! An API Key has been created and is valid for 14 days.",
                                                        apiKey: newKey.key,
                                                        expiredOn: newKey.expiredOn,
                                                        userDetails: {
                                                            email: doc.email,
                                                            username: doc.username,
                                                            phoneNumber: doc.phoneNumber,
                                                            firstName: doc.firstName,
                                                            lastName: doc.lastName,
                                                            dateOfBirth: new Date(doc.dateOfBirth),
                                                            address: doc.address,
                                                            countryRegion: doc.countryRegion,
                                                            city: doc.city,
                                                            streetProvince: doc.streetProvince,
                                                            zipCode: doc.zipCode,
                                                            gender: doc.gender,
                                                            userActivities: doc.userActivities,
                                                        },
                                                    };
                                                    if (doc.__t === "Teachers") {
                                                        returnResult.userDetails.coursesTaught =
                                                            doc.coursesTaught;
                                                        returnResult.userDetails.flag = "t";
                                                    } else if (doc.__t === "Students") {
                                                        returnResult.userDetails.coursesLearnt =
                                                            doc.coursesLearnt;
                                                        returnResult.userDetails.flag = "s";
                                                    } else if (doc.__t === "Admin") {
                                                        console.log("Admin logged in at [" + new Date().toLocaleDateString() + "]. Admin username: [" + doc.username + "].");
                                                        returnResult.userDetails.flag = "a";
                                                    } else if (doc.__t === "SuperUser") {
                                                        console.log("SuperUser logged in at [" + new Date().toLocaleDateString() + "]. SuperUser username: [" + doc.username + "].");
                                                        returnResult.userDetails.flag = "su";
                                                    }
                                                    newKey
                                                        .save()
                                                        .then((saved) => {
                                                            res.status(200).json(returnResult); Users.updateOne(
                                                                { _id: doc._id },
                                                                {
                                                                    $push: {
                                                                        userActivities: { activityDescription: "Logged in!" },
                                                                    },
                                                                },
                                                                function (errorUpdatingUser, updatingResult) {
                                                                    if (errorUpdatingUser) {
                                                                        if (errorUpdatingUser.name == "CastError") {
                                                                            res
                                                                                .status(500)
                                                                                .json({
                                                                                    errorCode: 500,
                                                                                    errorMessage: "Invalid user ID!",
                                                                                });
                                                                        } else {
                                                                            res
                                                                                .status(500)
                                                                                .json({
                                                                                    errorCode: 500,
                                                                                    errorMessage: errorUpdatingUser,
                                                                                });
                                                                        }
                                                                    }
                                                                }
                                                            );
                                                        })
                                                        .catch((saving_err) =>
                                                            res
                                                                .status(500)
                                                                .json({
                                                                    errorCode: 500,
                                                                    errorMessage: saving_err,
                                                                })
                                                        );
                                                } else {
                                                    continue;
                                                }
                                            } else {
                                                var daysLeft = new Date(currentExpiredOn - currentDate);
                                                daysLeft = daysLeft.getDate();
                                                var returnResult = {
                                                    result:
                                                        "Successfully logged in! Your API Key is valid for " +
                                                        (daysLeft - 1) +
                                                        " day(s).",
                                                    apiKey: list[iterator].key,
                                                    expiredOn: currentExpiredOn,
                                                    userDetails: {
                                                        email: doc.email,
                                                        username: doc.username,
                                                        phoneNumber: doc.phoneNumber,
                                                        firstName: doc.firstName,
                                                        lastName: doc.lastName,
                                                        dateOfBirth: new Date(doc.dateOfBirth),
                                                        address: doc.address,
                                                        countryRegion: doc.countryRegion,
                                                        city: doc.city,
                                                        streetProvince: doc.streetProvince,
                                                        zipCode: doc.zipCode,
                                                        gender: doc.gender,
                                                        userActivities: doc.userActivities,
                                                    },
                                                };
                                                if (doc.__t === "Teachers") {
                                                    returnResult.userDetails.coursesTaught =
                                                        doc.coursesTaught;
                                                    returnResult.userDetails.flag = "t";
                                                } else if (doc.__t === "Students") {
                                                    returnResult.userDetails.coursesLearnt =
                                                        doc.coursesLearnt;
                                                    returnResult.userDetails.flag = "s";
                                                } else if (doc.__t === "Admin") {
                                                    console.log("Admin logged in at [" + new Date().toLocaleDateString() + "]. Admin username: [" + doc.username + "].");
                                                    returnResult.userDetails.flag = "a";
                                                } else if (doc.__t === "SuperUser") {
                                                    console.log("SuperUser logged in at [" + new Date().toLocaleDateString() + "]. SuperUser username: [" + doc.username + "].");
                                                    returnResult.userDetails.flag = "su";
                                                }
                                                res.status(200).json(returnResult);
                                                break;
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.status(500).json({
                                errorCode: 500,
                                errorMessage:
                                    "Sorry but it seems like the password provided is wrong!",
                            });
                        }
                    } else {
                        res
                            .status(500)
                            .json({
                                errorCode: 500,
                                errorMessage:
                                    "Account status is invalid, please contact with admin!",
                            });
                    }
                }
            }
        });
    }
};

exports.userLogout = function (req, res) {
    if (req.header('APIKEY') == undefined || req.header('APIKEY') == "") {
        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Bad request made! Please insert the API key into the headers with Key is APIKEY and type is text/plain!" });
    } else {

        Keys.updateOne({ key: req.header('APIKEY') }, { expiredOn: new Date() },
            function (errorUpdatingKey, updatingResult) {
                if (errorUpdatingKey) {
                    res
                        .status(500)
                        .json({
                            errorCode: 500,
                            errorMessage: errorUpdatingKey,
                        });
                } else {
                    res.status(200).json({ 'result': 'Successfully sign out!' });
                }
            });
    }
};

exports.userSignup = function (req, res) {
    if (
        req.body.username == undefined ||
        req.body.username == "" ||
        req.body.email == undefined ||
        req.body.email == "" ||
        req.body.password == undefined ||
        req.body.password == "" ||
        req.body.phoneNumber == undefined ||
        req.body.firstName == undefined ||
        req.body.firstName == "" ||
        req.body.lastName == undefined ||
        req.body.lastName == "" ||
        req.body.dateOfBirth == undefined ||
        req.body.address == undefined ||
        req.body.countryRegion == undefined ||
        req.body.city == undefined ||
        req.body.streetProvince == undefined ||
        req.body.zipCode == undefined ||
        req.body.gender == undefined
    ) {
        res.status(400).json({
            errorCode: 400,
            errorMessage: "Please fill in all of the details required!",
        });
    } else {
        Users.find({ username: req.body.username }, function (error, usersList) {
            if (error) {
                res.status(500).json({ errorCode: 500, errorMessage: err });
            } else {
                if (usersList.length > 0) {
                    res.status(500).json({
                        errorCode: 500,
                        errorMessage:
                            "User with such username has already exists in the system, please sign up with a new username!",
                    });
                } else {
                    Users.find({ email: req.body.email }, function (err, docs) {
                        if (err) {
                            res.status(500).json({ errorCode: 500, errorMessage: err });
                        } else {
                            if (docs.length > 0) {
                                res.status(500).json({
                                    errorCode: 500,
                                    errorMessage:
                                        "User with such email has already exists in the system, please sign up with a new email!",
                                });
                            } else {
                                var newUser = null;
                                if (req.body.userType == undefined) {
                                    res.status(400).json({
                                        errorCode: 400,
                                        errorMessage:
                                            "Please select if you want to create an account as a Teacher or a Student!",
                                    });
                                } else if (req.body.userType == 1) {
                                    newUser = new TeacherSchema({
                                        email: req.body.email,
                                        username: req.body.username,
                                        password: cryptPassword(req.body.password),
                                        phoneNumber: req.body.phoneNumber,
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        dateOfBirth: new Date(req.body.dateOfBirth),
                                        address: req.body.address,
                                        countryRegion: req.body.countryRegion,
                                        city: req.body.city,
                                        streetProvince: req.body.streetProvince,
                                        zipCode: req.body.zipCode,
                                        gender: req.body.gender,
                                    });
                                } else if (req.body.userType == 2) {
                                    newUser = new StudentSchema({
                                        email: req.body.email,
                                        username: req.body.username,
                                        password: cryptPassword(req.body.password),
                                        phoneNumber: req.body.phoneNumber,
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        dateOfBirth: new Date(req.body.dateOfBirth),
                                        address: req.body.address,
                                        countryRegion: req.body.countryRegion,
                                        city: req.body.city,
                                        streetProvince: req.body.streetProvince,
                                        zipCode: req.body.zipCode,
                                        gender: req.body.gender,
                                    });
                                } else if (req.body.userType == 0) {
                                    if (configParams.secretAdminKey == undefined || configParams.secretAdminKey == "" || configParams.secretAdminKey == null) {
                                        res.status(500).json({ errorCode: 500, errorMessage: "Admin key is not configured! Contact admin to configure this on the backend." });
                                    } else {
                                        if (req.header('Admin-Key') != configParams.secretAdminKey) {
                                            res.status(500).json({ errorCode: 500, errorMessage: "Invalid Admin key! Contact Admin to create SuperUser account!" });
                                        } else {
                                            newUser = new SuperUserSchema({
                                                email: req.body.email,
                                                username: req.body.username,
                                                password: cryptPassword(req.body.password),
                                                phoneNumber: req.body.phoneNumber,
                                                firstName: req.body.firstName,
                                                lastName: req.body.lastName,
                                                dateOfBirth: req.body.dateOfBirth,
                                                address: req.body.address,
                                                countryRegion: req.body.countryRegion,
                                                city: req.body.city,
                                                streetProvince: req.body.streetProvince,
                                                zipCode: req.body.zipCode,
                                                gender: req.body.gender,
                                            });
                                        }
                                    }
                                } else if (req.body.userType == -1) {
                                    if (configParams.secretAdminKey == undefined || configParams.secretAdminKey == "" || configParams.secretAdminKey == null) {
                                        res.status(500).json({ errorCode: 500, errorMessage: "Admin key is not configured! Contact admin to configure this on the backend." });
                                    } else {
                                        if (req.header('Admin-Key') != configParams.secretAdminKey) {
                                            res.status(500).json({ errorCode: 500 });
                                        } else {
                                            newUser = new AdminSchema({
                                                email: req.body.email,
                                                username: req.body.username,
                                                password: cryptPassword(req.body.password),
                                                phoneNumber: req.body.phoneNumber,
                                                firstName: req.body.firstName,
                                                lastName: req.body.lastName,
                                                dateOfBirth: req.body.dateOfBirth,
                                                address: req.body.address,
                                                countryRegion: req.body.countryRegion,
                                                city: req.body.city,
                                                streetProvince: req.body.streetProvince,
                                                zipCode: req.body.zipCode,
                                                gender: req.body.gender,
                                            });
                                        }
                                    }
                                }
                                newUser
                                    .save()
                                    .then((saved) =>
                                        res.json({
                                            result:
                                                "Successfully created your account! You may now login to the system!",
                                        })
                                    )
                                    .catch((saving_err) =>
                                        res.status(500).json({ errorCode: 500, errorMessage: saving_err })
                                    );
                            }
                        }
                    });
                }
            }
        });
    }
};
