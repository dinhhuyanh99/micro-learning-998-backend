"use strict";

const mongoose = require("mongoose"),
    Users = mongoose.model("Users"),
    Courses = mongoose.model("Courses"),
    ChapterSchema = require("../models/courses/chapters"),
    Chapters = mongoose.model("Chapters"),
    { TeacherSchema } = require("../models/users/teachers"),
    { StudentSchema } = require("../models/users/students"),
    { AdminSchema } = require("../models/users/admin"),
    { SuperUserSchema } = require("../models/users/superuser"),
    Keys = mongoose.model("Keys");

/**
 * This function will be in charge of adding the new course into the database
 * Send POST request with the following data inputs: (* as required, + as optional)
 * * courseName
 * * courseCode
 * * courseOverview
 * + courseDiscipline
 * + courseLevel
 * + listOfTeachers
 * + listOfStudents
 * + hasChapters
 * + startDate
 * + durationInWeeks
 * 
 * @param {*} req: request from user
 * @param {*} res: response from the backend
 */

exports.addCourse = function(req, res){
    const APIKEY = req.header('APIKEY');
    Keys.findOne({ key: APIKEY }).populate('userId').lean().then((success_callback) => {
        if (success_callback != null || success_callback != undefined) {
            var currentDate = new Date(Date.now());
            var expiredDate = new Date(success_callback.expiredOn);
            if ((currentDate.getTime()) >= (expiredDate.getTime())) {
                res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key is outdated. Please login and try again!" });
            } else {
                // We will then check if the user is a teacher/admin/superuser and not a student
                var uploaderDoc = success_callback.userId;
                if(uploaderDoc.__t === "Teachers" ||
                    uploaderDoc.__t === "Admin" ||
                    uploaderDoc.__t === "SuperUser"){
                    if (req.body.courseName == undefined || req.body.courseName == null || req.body.courseName == "" || 
                        req.body.courseCode == undefined || req.body.courseCode == null || req.body.courseCode == "" ||
                        req.body.courseOverview == undefined || req.body.courseOverview == null || req.body.courseOverview == "" ||
                        req.body.courseDiscipline == undefined || req.body.courseDiscipline == null ||
                        req.body.courseLevel == undefined || req.body.courseLevel == null ||
                        req.body.listOfTeachers == undefined || req.body.listOfTeachers == null ||
                        req.body.listOfStudents == undefined || req.body.listOfStudents == null ||
                        req.body.hasChapters == undefined || req.body.hasChapters == null ||
                        req.body.startDate == undefined || req.body.startDate == null ||
                        req.body.durationInWeeks == undefined || req.body.durationInWeeks == null){
                        res.json({ 'errorCode': 400, 'errorMessage': "Please fill in all of the details required! (courseName, courseCode, courseOverview required!)" });
                    } else {
                        // If the user has all fields required filled with data
                        var newCourseDetails = new Courses({
                            courseName: req.body.courseName,
                            courseCode: req.body.courseCode,
                            courseOverview: req.body.courseOverview,
                            courseDiscipline: req.body.courseDiscipline,
                            courseLevel: req.body.courseLevel,
                            // If empty, the one who posted will be uploaded, this will be in here to ensure there is at least 1 teacher assigned
                            listOfTeachers: (req.body.listOfTeachers == [] || req.body.listOfTeachers.length == 0 ? [uploaderDoc._id] : req.body.listOfTeachers),
                            listOfStudents: req.body.listOfStudents, // If empty should be an empty array
                            hasChapters: req.body.hasChapters, // If empty should be an empty array for the user to upload each chapter later on
                            startDate: (req.body.startDate == "" ? new Date() : new Date(req.body.startDate)), // make sure the user at least give today as the start date
                            durationInWeeks: req.body.durationInWeeks
                        });
                        newCourseDetails
                            .save()
                            .then((saved) =>{
                                res.status(200).json({
                                    result:
                                        "Successfully created a course! You may retrieve it now!",
                                });
                            })
                            .catch((saving_err) =>{
                                console.log(saving_err);
                                res.status(500).json({ errorCode: 500, errorMessage: saving_err });
                            });
                    }
                } else {
                    res.status(403).json({ 'errorCode': 401, 'errorMessage': "This action is unauthorized since you are a student!" });
                }
                
            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}

/**
 * This function will be in charge of returning the list of courses!
 * send a GET request to /courses/all
 * for teachers/admin/superuser, they can retrieve all courses regardless of the status
 * for students, they can only retrieve active courses
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllCourses = function(req, res){
    const APIKEY = req.header('APIKEY');
    Keys.findOne({ key: APIKEY }).populate('userId').lean().then((success_callback) => {
        if (success_callback != null || success_callback != undefined) {
            var currentDate = new Date(Date.now());
            var expiredDate = new Date(success_callback.expiredOn);
            if ((currentDate.getTime()) >= (expiredDate.getTime())) {
                res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key is outdated. Please login and try again!" });
            } else {
                var filterCourses = {}
                var uploaderDoc = success_callback.userId;
                if (req._parsedUrl.query == null || req._parsedUrl.query == undefined) {
                    // We will then check if the user is a teacher/admin/superuser and not a student
                    if (uploaderDoc.__t === "Teachers" ||
                        uploaderDoc.__t === "Admin" ||
                        uploaderDoc.__t === "SuperUser") {
                        filterCourses = { courseStatus: 1 };
                    } else {
                        filterCourses = { $or: [{ courseStatus: -1 }, { courseStatus: 0 }, { courseStatus: 1 }]};
                    }
                } else {
                    // If there is a query
                    // courseStatus query, only for teachers/admin/superuser
                    var filtersArray = [];
                    if (req.query.courseStatus != undefined && req.query.courseStatus != null && req.query.courseStatus != "") {
                        if (uploaderDoc.__t === "Teachers" ||
                            uploaderDoc.__t === "Admin" ||
                            uploaderDoc.__t === "SuperUser") {
                            if (req.query.courseStatus != -1 && req.query.courseStatus != 0 && req.query.courseStatus != 1) {
                                res.status(411).json({ 'errorCode': 411, 'errorMessage': "courseStatus query string must be -1 (deactivated), 0 (pending), or 1(active)!" });
                                return;
                            } else {
                                filtersArray.push({ courseStatus: req.query.courseStatus });
                            }
                        } else { // if it's a student, return error
                            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Students cannot query with courseStatus!" });
                            return;
                        }
                    }

                    // courseLevel query
                    if (req.query.courseLevel != undefined && req.query.courseLevel != null && req.query.courseLevel != "") {
                        var parsedCourseLevel = parseInt(req.query.courseLevel);
                        if (parsedCourseLevel < 0 || parsedCourseLevel > 5) {
                            res.status(411).json({ 'errorCode': 411, 'errorMessage': "courseLevel query string must be one number from 0 to 5!" });
                            return;
                        } else {
                            filtersArray.push({ courseLevel: parsedCourseLevel });
                        }
                    }

                    // durationInWeeks query
                    if (req.query.durationInWeeks != undefined && req.query.durationInWeeks != null && req.query.durationInWeeks != "") {
                        var parsedDuration = parseInt(req.query.durationInWeeks);
                        if (parsedDuration < 1) { // Min is 1 week
                            res.status(411).json({ 'errorCode': 411, 'errorMessage': "durationInWeeks query string must be greater than 1 week!" });
                            return;
                        } else {
                            filtersArray.push({ durationInWeeks: parsedDuration });
                        }
                    }
                    if(filtersArray.length > 0){
                        filterCourses = { $and: filtersArray };
                    }
                }
                Courses.find(filterCourses).lean()
                    .exec(function (errorFindingCourses, coursesList) {
                        if (errorFindingCourses) {
                            res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingCourses });
                        } else {
                            if (coursesList.length == 0) {
                                res.status(200).json({ 'results': "There are no courses in the database at the moment!" });
                            } else {
                                for(var i = 0; i < coursesList.length; i ++){
                                    delete (coursesList[i].listOfTeachers); // Remove this because this part is only for displaying in dashboard or something...
                                    delete (coursesList[i].listOfStudents); // Remove this because this part is only for displaying in dashboard or something...
                                }

                                res.status(200).json({ 'length': coursesList.length, 'results': coursesList });
                            }
                        }
                    });
            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}


/**
 * This function will be in charge of returning the list of one course based on the id that the
 * user passed into the url in the form of 
 * sending a GET request to /courses/details?
 * @param {*} req 
 * @param {*} res 
 */
exports.getCourseDetails = function (req, res) {
    const APIKEY = req.header('APIKEY');
    Keys.findOne({ key: APIKEY }).populate('userId').lean().then((success_callback) => {
        if (success_callback != null || success_callback != undefined) {
            var currentDate = new Date(Date.now());
            var expiredDate = new Date(success_callback.expiredOn);
            if ((currentDate.getTime()) >= (expiredDate.getTime())) {
                res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key is outdated. Please login and try again!" });
            } else {
                var uploaderDoc = success_callback.userId;
                if (req._parsedUrl.query == null || req._parsedUrl.query == undefined) {
                    // Return an error if the user didn't pass anything in
                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Request! This route is used for taking details of a course! /courses/details?courseId=<put your courseId here>" });
                } else {
                    // If there is a query for the ID
                    if (req.query.courseId != undefined && req.query.courseId != null && req.query.courseId != "") {
                        Courses.findOne({_id: req.query.courseId}).lean()
                            .populate("listOfTeachers")
                            .populate("listOfStudents")
                            .populate("hasChapters")
                            .exec(function (errorFindingCourse, course) {
                                if (errorFindingCourse) {
                                    if(errorFindingCourse.name == "CastError"){
                                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Course ID! Please give a valid course ID" });
                                    } else {
                                        res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingCourse });
                                    }
                                } else {
                                    if (course == null || course == undefined) {
                                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Cannot find this course ID! Please give a valid course ID!" });
                                    } else {
                                        // Remove all user's personal details , leaving just the first name, last name, email
                                        for (var i = 0; i < course.listOfTeachers.length; i++) {
                                            delete (course.listOfTeachers[i].coursesTaught);
                                            delete (course.listOfTeachers[i].username);
                                            delete (course.listOfTeachers[i].password);
                                            delete (course.listOfTeachers[i].phoneNumber);
                                            delete (course.listOfTeachers[i].dateOfBirth);
                                            delete (course.listOfTeachers[i].address);
                                            delete (course.listOfTeachers[i].countryRegion);
                                            delete (course.listOfTeachers[i].city);
                                            delete (course.listOfTeachers[i].streetProvince);
                                            delete (course.listOfTeachers[i].zipCode);
                                            delete (course.listOfTeachers[i].gender);
                                            delete (course.listOfTeachers[i].userActivities);
                                            delete (course.listOfTeachers[i].accountStatus);
                                            delete (course.listOfTeachers[i].createdAt);
                                            delete (course.listOfTeachers[i].updatedAt);
                                            delete (course.listOfTeachers[i].__v);
                                        }

                                        for (var i = 0; i < course.listOfStudents.length; i++) {
                                            delete (course.listOfStudents[i].coursesLearnt);
                                            delete (course.listOfStudents[i].username);
                                            delete (course.listOfStudents[i].password);
                                            delete (course.listOfStudents[i].phoneNumber);
                                            delete (course.listOfStudents[i].dateOfBirth);
                                            delete (course.listOfStudents[i].address);
                                            delete (course.listOfStudents[i].countryRegion);
                                            delete (course.listOfStudents[i].city);
                                            delete (course.listOfStudents[i].streetProvince);
                                            delete (course.listOfStudents[i].zipCode);
                                            delete (course.listOfStudents[i].gender);
                                            delete (course.listOfStudents[i].userActivities);
                                            delete (course.listOfStudents[i].accountStatus);
                                            delete (course.listOfStudents[i].createdAt);
                                            delete (course.listOfStudents[i].updatedAt);
                                            delete (course.listOfStudents[i].__v);
                                        }
                                        res.status(200).json({ "result": course });
                                    }
                                }
                            });       
                    } else {
                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "courseId query string must be the ID of the course you want to get!" });
                    }

                }
            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}

/**
 * This function is specifically for adding chapter to current existing course from the teacher/admin/superuser perspective
 * the path is /courses/chapters/addChapter with POST request
 * The body of the request will be as follows (* is required, + is optional)
 * {
    * "chapterName": 
    * "belongToCourse": "6284ba94ae3178f2901ae5b5",
    + "nextChapter": null, // Only use null if you don't want to link it with any chapter next
    + "previousChapter": null // Only use null if you don't want to link it with any chapter previously
}
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.addChapter = function (req, res) {
    const APIKEY = req.header('APIKEY');
    Keys.findOne({ key: APIKEY }).populate('userId').lean().then((success_callback) => {
        if (success_callback != null || success_callback != undefined) {
            var currentDate = new Date(Date.now());
            var expiredDate = new Date(success_callback.expiredOn);
            if ((currentDate.getTime()) >= (expiredDate.getTime())) {
                res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key is outdated. Please login and try again!" });
            } else {
                // We will then check if the user is a teacher/admin/superuser and not a student
                var uploaderDoc = success_callback.userId;
                if (uploaderDoc.__t === "Teachers" ||
                    uploaderDoc.__t === "Admin" ||
                    uploaderDoc.__t === "SuperUser") {
                    if (req.body.chapterName == undefined || req.body.chapterName == null || req.body.chapterName == "" ||
                        req.body.belongToCourse == undefined || req.body.belongToCourse == null || req.body.belongToCourse == "" ||
                        req.body.nextChapter === undefined ||
                        req.body.previousChapter === undefined) {
                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Please fill in all of the details required! (chapterName, belongToCourse(the ID of the course this chapter belongs to) required!)" });
                    } else {
                        Courses.findOne({ _id: req.body.belongToCourse }, function (errorFindingCourse, courseObject) { // Check if the course actually exists, if not, we will not create the chapter
                            if (errorFindingCourse) {
                                if (errorFindingCourse.name == "CastError") {
                                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Course ID! Please give a valid course ID to bind this chapter with!" });
                                    return;
                                } else {
                                    res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingCourse });
                                    return;
                                }
                            } else {
                                if (courseObject == null || courseObject == undefined) {
                                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Course ID! Cannot find the assigned course ID!" });
                                    return;
                                } else {
                                    // If the course exists, we can then proceed to check the nextChapter and previousChapter references
                                    // Next chapter
                                    if (req.body.nextChapter != null) {
                                        Chapters.findOne({ _id: req.body.nextChapter }, function (errorFindingNextChapter, nextChapterObj) {
                                            if (errorFindingNextChapter) {
                                                if (errorFindingNextChapter.name == "CastError") {
                                                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid next chapter ID to bind this chapter with!" });
                                                    return;
                                                } else {
                                                    res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingNextChapter });
                                                    return;
                                                }
                                            } else {
                                                if (nextChapterObj == null || nextChapterObj == undefined) {
                                                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid next chapter ID to bind this chapter with!" });
                                                    return;
                                                }
                                            }

                                        });
                                    }
                                    // Previous Chapter
                                    if (req.body.previousChapter != null) {
                                        Chapters.findOne({ _id: req.body.previousChapter }, function (errorFindingPreviousChapter, previousChapterObj) {
                                            if (errorFindingPreviousChapter) {
                                                if (errorFindingPreviousChapter.name == "CastError") {
                                                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid previous chapter ID to bind this chapter with!" });
                                                    return;
                                                } else {
                                                    res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingPreviousChapter });
                                                    return;
                                                }
                                            } else {
                                                if (previousChapterObj == null || previousChapterObj == undefined) {
                                                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid previous chapter ID to bind this chapter with!" });
                                                    return;
                                                }
                                            }

                                        });
                                    }
                                    // If everything is ok, create the new object then save it
                                    // If the user has all fields required filled with data
                                    var newChapter = new Chapters({
                                        chapterName: req.body.chapterName,
                                        belongToCourse: req.body.belongToCourse,
                                        nextChapter: req.body.nextChapter,
                                        previousChapter: req.body.previousChapter
                                    });
                                    newChapter
                                        .save()
                                        .then((saved) => {
                                            res.status(200).json({
                                                result:
                                                    "Successfully created a chapter for the course [" + courseObject._id + "] " + courseObject.courseName + " !",
                                            });
                                        })
                                        .catch((saving_err) => {
                                            res.status(500).json({ errorCode: 500, errorMessage: saving_err });
                                        });
                                }
                            }

                        });

                    }
                } else {
                    res.status(403).json({ 'errorCode': 401, 'errorMessage': "This action is unauthorized since you are a student!" });
                }

            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}

exports.getAllChapters = function (req, res) { // Anyone who is logged in will be able to get all chapters for a single course.
    const APIKEY = req.header('APIKEY');
    Keys.findOne({ key: APIKEY }).populate('userId').lean().then((success_callback) => {
        if (success_callback != null || success_callback != undefined) {
            var currentDate = new Date(Date.now());
            var expiredDate = new Date(success_callback.expiredOn);
            if ((currentDate.getTime()) >= (expiredDate.getTime())) {
                res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key is outdated. Please login and try again!" });
            } else {
                var uploaderDoc = success_callback.userId;
                if (req._parsedUrl.query == null || req._parsedUrl.query == undefined) { // if we don't find any query for the specific course id
                    res.status(400).json({'errorCode': 400, 'errorMessage': "Cannot get chapters without the query that has course ID, please add ?courseId=<your course ID>!"});
                    return;
                } else {
                    // If there is a query
                    // courseId query
                    if (req.query.courseId != undefined && req.query.courseId != null && req.query.courseId != "") {
                        Chapters.find({ belongToCourse: req.query.courseId }).lean()
                            .exec(function (errorFindingChapters, chaptersList) {
                                if (errorFindingChapters) {
                                    res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingChapters });
                                } else {
                                    if (chaptersList.length == 0) {
                                        res.status(200).json({ 'results': "There are no chapters for that course in the database at the moment!" });
                                    } else {
                                        res.status(200).json({ 'length': chaptersList.length, 'results': chaptersList });
                                    }
                                }
                            });   
                    }
                }
            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}