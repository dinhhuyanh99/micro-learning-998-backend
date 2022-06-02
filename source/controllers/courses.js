"use strict";

const mongoose = require("mongoose"),
    Users = mongoose.model("Users"),
    Courses = mongoose.model("Courses"),
    ChapterSchema = require("../models/courses/chapters"),
    Chapters = mongoose.model("Chapters"),
    LearnObjSchema = require("../models/courses/learnobj"),
    LearnObj = mongoose.model("LearnObj"),
    { TeacherSchema } = require("../models/users/teachers"),
    { StudentSchema } = require("../models/users/students"),
    { AdminSchema } = require("../models/users/admin"),
    { SuperUserSchema } = require("../models/users/superuser"),
    Keys = mongoose.model("Keys");

/** TESTED
 * This function will be in charge of adding the new course into the database
 * Send POST request with the following data inputs: (* as required, + as optional)
 * * courseName
 * * courseCode
 * * courseOverview
 * + courseDiscipline
 * + courseLevel
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
                            teacherRef: uploaderDoc._id,// This will be the id of the uploader immediately
                            listOfStudents: [], // Always an empty array since the course needs to be created first then the student can all join later...
                            hasChapters: [], // Always be empty, the teacher will have to add each chapter later...
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
                                res.status(500).json({ errorCode: 500, errorMessage: saving_err.toString() });
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

/** TESTED
 * This function will be in charge of returning the list of courses!
 * send a GET request to /courses/all
 * for teachers/admin/superuser, they can retrieve all courses regardless of the status
 * for students, they can only retrieve active courses
 * /courses/all?courseStatus=[-1,0,1]&courseLevel=[0,1,2,3,4,5]&durationInWeeks=[1,...]&withChapters=true
 * 
 * 
 * another check is that if the user want to retrieve the chapters details as well, you have to pass in
 * 
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
                        uploaderDoc.__t === "SuperUser") { // If the user that sent the command over is a teacher/admin/superuser, find all courses
                        filterCourses = { $or: [{ courseStatus: -1 }, { courseStatus: 0 }, { courseStatus: 1 }] };
                    } else {
                        filterCourses = { courseStatus: 1 }; // Student can only view courses that are active
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
                if (req.query.withChapters == "true"){
                    Courses.find(filterCourses).lean()
                        .populate("hasChapters")
                        .exec(function (errorFindingCourses, coursesList) {
                            if (errorFindingCourses) {
                                res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingCourses });
                            } else {
                                if (coursesList.length == 0) {
                                    res.status(200).json({ 'length': coursesList.length, 'results': "There are no courses in the database at the moment!" });
                                } else {
                                    for (var i = 0; i < coursesList.length; i++) {
                                        delete (coursesList[i].listOfStudents); // Remove this because this part is only for displaying in dashboard or something...
                                    }

                                    res.status(200).json({ 'length': coursesList.length, 'results': coursesList });
                                }
                            }
                        });
                } else {
                    Courses.find(filterCourses).lean()
                        .exec(function (errorFindingCourses, coursesList) {
                            if (errorFindingCourses) {
                                res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingCourses });
                            } else {
                                if (coursesList.length == 0) {
                                    res.status(200).json({ 'length': coursesList.length, 'results': "There are no courses in the database at the moment!" });
                                } else {
                                    for (var i = 0; i < coursesList.length; i++) {
                                        delete (coursesList[i].listOfStudents); // Remove this because this part is only for displaying in dashboard or something...
                                    }

                                    res.status(200).json({ 'length': coursesList.length, 'results': coursesList });
                                }
                            }
                        });
                }
                
            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}

/**
 * This function will be in charge of returning the list of one course based on the id that the
 * user passed into the url in the form of 
 * sending a GET request to /courses/details?courseId=<insert course Id>
 * 
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
                            .populate("teacherRef")
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
                                        delete (course.teacherRef.coursesTaught);
                                        delete (course.teacherRef.username);
                                        delete (course.teacherRef.password);
                                        delete (course.teacherRef.phoneNumber);
                                        delete (course.teacherRef.dateOfBirth);
                                        delete (course.teacherRef.address);
                                        delete (course.teacherRef.countryRegion);
                                        delete (course.teacherRef.city);
                                        delete (course.teacherRef.streetProvince);
                                        delete (course.teacherRef.zipCode);
                                        delete (course.teacherRef.gender);
                                        delete (course.teacherRef.userActivities);
                                        delete (course.teacherRef.accountStatus);
                                        delete (course.teacherRef.createdAt);
                                        delete (course.teacherRef.updatedAt);
                                        delete (course.teacherRef.__v);
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
 * This function will be in charge of returning the list of one course based on the id that the
 * user passed into the url in the form of 
 * sending a put request to /courses/update?courseId=<insert course Id>
 * For this part, we only allow the user to change the following details
 * courseName // Must not be null/undefined/empty
 * courseCode // Must not be null/undefined/empty
 * courseOverview // Must not be null/undefined/empty
 * courseDiscipline // Must not be null/undefined/empty
 * courseLevel // must be 0 1 2 3 4 or 5
 * courseStatus // must be -1 0 or 1
 * hasChapters [you can only reorder the chapters with this link, if you want to modify/delete the chapter, use the link for each chapter...]
 * durationInWeeks
 * 
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.updateCourseDetails = function (req, res) {
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
                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Request! This route is used for taking details of a course! /courses/update?courseId=<put your courseId here>" });
                } else {
                    // If there is a query for the ID
                    if (req.query.courseId != undefined && req.query.courseId != null && req.query.courseId != "") {
                        if(req.body.courseName == undefined || req.body.courseName ==  null || req.body.courseName == "" ||
                        req.body.courseCode == undefined || req.body.courseCode ==  null || req.body.courseCode == "" ||
                        req.body.courseOverview == undefined || req.body.courseOverview ==  null || req.body.courseOverview == "" ||
                        req.body.courseDiscipline == undefined || req.body.courseDiscipline ==  null || req.body.courseDiscipline == "" ||
                        req.body.courseLevel == undefined || req.body.courseLevel ==  null || req.body.courseLevel == "" ||
                        req.body.courseStatus == undefined || req.body.courseStatus ==  null || req.body.courseStatus == "" ||
                        req.body.hasChapters == undefined || req.body.hasChapters ==  null ||
                        req.body.teacherRef == undefined || req.body.teacherRef == null || req.body.teacherRef == "" ||
                        req.body.durationInWeeks == undefined || req.body.durationInWeeks ==  null || req.body.durationInWeeks == ""){
                            // If the update details are invalid, we will return the error immediately
                            res.status(400).json({ 'errorCode': 400, 'errorMessage': "You have to fill in all new details or leave the old detail as is without modifying them..." });
                        } else {
                            // If we have a valid body, we will then need to check if the uploader is a students or not
                            if (uploaderDoc.__t === "Students") {
                                // For a student, we will reject the request!
                                res.status(400).json({ 'errorCode': 400, 'errorMessage': "You cannot update the details of the course if you are a student" });
                            } else { // If the uploader is not a student, we will check and see if they are a teacher and if the ID matches with one from course
                                if (uploaderDoc.__t === "Teachers") {
                                    if (req.body.teacherRef != uploaderDoc._id) { // Check the ID of the one being sent in and the API of the one who submitted
                                        return res.status(400).json({ 'errorCode': 400, 'errorMessage': "You cannot update the details of the course if you are not the original teacher!" });
                                    }
                                }
                                // So if they are teacher (that has a matching ID)/admin/superuser, we will query for the course ID
                                Courses.findOne({_id: req.query.courseId}).lean()
                                .exec(function(errorFindingCourse, resultCourse){
                                    if (errorFindingCourse) {
                                        if (errorFindingCourse.name == "CastError") {
                                            return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Course ID! Please give a valid course ID" });
                                        } else {
                                            return res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingCourse });
                                        }
                                    } else {
                                        if (resultCourse == null || resultCourse == undefined) {
                                            return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Cannot find this course ID! Please give a valid course ID!" });
                                        } else {
                                            // If we have a course, we will then check each element within the result course and see if they are different from the one we posted and only update the necessary details
                                            // We assign the course details we found into a new variable
                                            var updatedDetails = req.body;
                                            // Begin checking
                                            // If it isn't matching, we will leave the details in the updatedDetails object
                                            // If it is matching, we will remove the details in the updatedDetails object
                                            if(req.body.courseName === resultCourse.courseName){
                                                delete(updatedDetails.courseName);
                                            }

                                            if (req.body.courseCode === resultCourse.courseCode) {
                                                delete (updatedDetails.courseCode);
                                            }

                                            if (req.body.courseOverview === resultCourse.courseOverview) {
                                                delete (updatedDetails.courseOverview);
                                            }

                                            if (req.body.courseDiscipline === resultCourse.courseDiscipline) {
                                                delete (updatedDetails.courseDiscipline);
                                            }

                                            if (req.body.courseLevel === resultCourse.courseLevel) {
                                                delete (updatedDetails.courseLevel);
                                            } else {
                                                // If it's different, we need to check if the new courseLevel is valid (0, 1, 2, 3, 4, 5) only
                                                if (req.body.courseLevel != 0 &&
                                                    req.body.courseLevel != 1 &&
                                                    req.body.courseLevel != 2 &&
                                                    req.body.courseLevel != 3 &&
                                                    req.body.courseLevel != 4 &&
                                                    req.body.courseLevel != 5) {
                                                        // We will set it back to the old value...
                                                        updatedDetails.courseLevel = resultCourse.courseLevel;
                                                    }

                                            }

                                            if (req.body.courseStatus === resultCourse.courseStatus) {
                                                delete (updatedDetails.courseStatus);
                                            } else {
                                                // If it's different, we need to check if the new courseStatus is valid (-1, 0, 1) only
                                                if (req.body.courseStatus != 0 &&
                                                    req.body.courseStatus != 1 &&
                                                    req.body.courseStatus != -1) {
                                                    // We will set it back to the old value...
                                                    updatedDetails.courseStatus = resultCourse.courseStatus;
                                                }
                                            }

                                            if (req.body.durationInWeeks === resultCourse.durationInWeeks) {
                                                delete (updatedDetails.durationInWeeks);
                                            } else {
                                                if (req.body.durationInWeeks == undefined || req.body.durationInWeeks == null || req.body.durationInWeeks == ""){
                                                    // invalid value will make it turned back to the original value
                                                    updatedDetails.durationInWeeks = resultCourse.durationInWeeks;
                                                } else {
                                                    // If it's a valid value
                                                    if(req.body.durationInWeeks < 1){
                                                        // invalid value will make it turned back to the original value
                                                        updatedDetails.durationInWeeks = resultCourse.durationInWeeks;
                                                    }
                                                }
                                            }
                                            // For the array containing chapters, we support reordering of the Ids
                                            // We will loop through the list of ids, see if they are still in order, if there is one that is out of order, we will replace the array immediately with the new one...
                                            if(req.body.hasChapters.length != 0 && resultCourse.hasChapters.length == 0){ // If the body sent more details out of no where??
                                                // return error
                                                return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Do not send the list of chapters details if the original doesn't have any..." });
                                            } else if (req.body.hasChapters.length == 0 && resultCourse.hasChapters.length != 0) { // If the body sent fewer details than the original,
                                                return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Do not delete the references of chapters from here, delete each chapter one by one!" });
                                            } else if (req.body.hasChapters.length != 0 && resultCourse.hasChapters.length != 0) { // If the length of both is different
                                                if (req.body.hasChapters.length == resultCourse.hasChapters.length){ // If they are of the same length
                                                    var isTheSame = true;
                                                    // loop through and check if they are the same on both array
                                                    for(var i = 0; i < resultCourse.hasChapters.length; i++){
                                                        if(req.body.hasChapters[i] != resultCourse.hasChapters[i]){
                                                            // set isTheSame to false
                                                            isTheSame = false;
                                                            break;
                                                        }
                                                    }
                                                    if(isTheSame){
                                                        delete (updatedDetails.hasChapters);        
                                                    } else {
                                                        // If the one on updated sight is different, we will use the new one to replace the old one immediately.
                                                    }

                                                } else {
                                                    // If they are of different length...
                                                    return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Do not delete or add the references of chapters from here, delete or add each chapter one by one!" });
                                                }
                                            } else {
                                                // If both are empty, then we would just ignore it by removing it from updatedDetails
                                                delete(updatedDetails.hasChapters);
                                            }
                                            return res.status(200).json(updatedDetails);
                                        }
                                    }
                                });

                            }
                        }
                        
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
    * "belongToCourse": "6284ba94ae3178f2901ae5b5"
 * }
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
                        req.body.belongToCourse == undefined || req.body.belongToCourse == null || req.body.belongToCourse == ""){
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
                                   // If everything is ok, create the new object then save it
                                    // If the user has all fields required filled with data
                                    var newChapter = new Chapters({
                                        chapterName: req.body.chapterName,
                                        belongToCourse: req.body.belongToCourse
                                    });
                                    newChapter
                                        .save()
                                        .then((saved) => {
                                            //We add one to the uploader activities too.
                                            // If it's alright, we will update the coursesTaught list for the particular Teachers
                                            Users.updateOne({ _id: uploaderDoc._id, __t: uploaderDoc.__t }, { $push: { userActivities: { activityDescription: "Added a chapter with the name " + req.body.chapterName + " with ID: [" + newChapter._id + "]." } } }, { upsert: true, safe: true }, function (errorUpdatingUser, updatingResult) {
                                                if (errorUpdatingUser) {
                                                    if (errorUpdatingUser.name == "CastError") {
                                                        res
                                                            .status(500)
                                                            .json({
                                                                errorCode: 500,
                                                                errorMessage: "Invalid user ID!",
                                                            });
                                                        return next();
                                                    } else {
                                                        res
                                                            .status(500)
                                                            .json({
                                                                errorCode: 500,
                                                                errorMessage: errorUpdatingUser,
                                                            });
                                                        return next();
                                                    }
                                                }
                                            });
                                            res.status(200).json({
                                                result:
                                                    "Successfully created a chapter for the course [" + courseObject._id + "] " + courseObject.courseName + " !",
                                            });
                                        })
                                        .catch((saving_err) => {
                                            res.status(500).json({ errorCode: 500, errorMessage: saving_err.toString() });
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

/**
 * This function is specifically for getting all chapters of a current course
 * the path is /courses/chapters/all with GET request with courseId in the query part of the url
 * like /courses/chapters/all?courseId=<course id>
 * 
 *
 * @param {*} req 
 * @param {*} res 
 */
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
                            .populate("learningObjects")
                            .exec(function (errorFindingChapters, chaptersList) {
                                if (errorFindingChapters) {
                                    res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingChapters });
                                } else {
                                    if (chaptersList.length == 0) {
                                        res.status(200).json({ 'results': "There are no chapters for that course in the database at the moment!" });
                                    } else {
                                        if(uploaderDoc.__t === "Students"){ // if it's the student, remove all createdAt, updatedAt, __v
                                            for(var i = 0; i < chaptersList.length; i++){
                                                delete(chaptersList[i].createdAt);
                                                delete(chaptersList[i].updatedAt);
                                                delete(chaptersList[i].__v);
                                            }
                                        }
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

/**
 * This function will be in charge of returning a chapter based on the id that the
 * user passed into the url in the form of 
 * sending a GET request to /courses/chapters/details?chapterId=<insert chapter Id>
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getChapterDetails = function (req, res) {
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
                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Request! This route is used for taking details of a course! /courses/chapters/details?chapterId=<put your chapterId here>" });
                } else {
                    // If there is a query for the ID
                    if (req.query.chapterId != undefined && req.query.chapterId != null && req.query.chapterId != "") {
                        Chapters.findOne({ _id: req.query.chapterId }).lean()
                            .populate("learningObjects")
                            .exec(function (errorFindingChapter, chapter) {
                                if (errorFindingChapter) {
                                    if (errorFindingChapter.name == "CastError") {
                                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid chapter ID" });
                                    } else {
                                        res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingChapter });
                                    }
                                } else {
                                    if (chapter == null || chapter == undefined) {
                                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Cannot find this Chapter ID! Please give a valid chapter ID!" });
                                    } else {
                                        
                                        res.status(200).json({ "result": chapter });
                                    }
                                }
                            });
                    } else {
                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "chapterId query string must be the ID of the chapter you want to get!" });
                    }

                }
            }
        } else {
            res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}

/**
 * This function is specifically for adding new learning objectives to a chapter
 * 
 * The path is /courses/chapters/learnobj/add
 * The required details are:
 * title
 * belongToChapter : null if we have hasParentLearnObj
 * hasParentLearnObj: null if we have belongToChapter
 * description
 *
 * @param {*} req 
 * @param {*} res 
 */
exports.addLearnObj = function (req, res){
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
                    if (req.body.title == undefined || req.body.title == null || req.body.title == "" ||
                        req.body.belongToChapter === undefined ||
                        req.body.hasParentLearnObj === undefined ||
                        req.body.description == undefined || req.body.description == null || req.body.description == "") {
                        res.status(400).json({ 'errorCode': 400, 'errorMessage': "Please fill in all of the details required! (title, belongToChapter(the ID of the chapter this learning objective belongs to) OR hasParentLearnObj, description required!)" });
                    } else {
                        var isOkToSave = false;
                        // We will check value for belongToChapter and hasParentLearnObj
                        if(req.body.belongToChapter != null && req.body.hasParentLearnObj != null){// We cannot have both, we can only have either, we return an error
                            return res.status(400).json({'errorCode': 400, 'errorMessage': "Please only put in either the chapter the learning object belongs to, or the parent learning object."});
                        } else if (req.body.belongToChapter != null && req.body.hasParentLearnObj == null) {
                            // If we add the belongToChapter, we will try to find if that chapter exists
                            Chapters.findOne({ _id: req.body.belongToChapter }, function (errorFindingChapter, chapterObject) { // Check if the course actually exists, if not, we will not create the chapter
                                if (errorFindingChapter) {
                                    if (errorFindingChapter.name == "CastError") {
                                        return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid Chapter ID to bind this learning object with!" });
                                    } else {
                                        return res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingChapter });
                                    }
                                } else {
                                    if (chapterObject == null || chapterObject == undefined) {
                                        return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid Chapter ID! Please give a valid Chapter ID to bind this learning object with!" });
                                    } else {
                                        isOkToSave = true;
                                    }
                                }
                            });
                        } else if (req.body.belongToChapter == null && req.body.hasParentLearnObj != null) {
                            // If we add the hasParentLearnObj, we will try to find if that learnObj exists
                            // If we add the belongToChapter, we will try to find if that chapter exists
                            LearnObj.findOne({ _id: req.body.hasParentLearnObj }, function (errorFindingLearnObj, learningObject) { // Check if the course actually exists, if not, we will not create the chapter
                                if (errorFindingLearnObj) {
                                    if (errorFindingLearnObj.name == "CastError") {
                                        return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid LearnObj ID! Please give a valid LearnObj ID to bind this learning object with!" });
                                    } else {
                                        return res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingLearnObj });
                                    }
                                } else {
                                    if (learningObject == null || learningObject == undefined) {
                                        return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Invalid LearnObj ID! Please give a valid LearnObj ID to bind this learning object with!" });
                                    } else {
                                        isOkToSave = true;
                                    }
                                }
                            });
                        } else {
                            // if both are null, return error, 
                            return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Please only put in at least the chapter the learning object belongs to, OR the parent learning object." });
                        }
                        if(isOkToSave){     
                            // If everything is alright, we should be able to create a new object to add
                            var newLearnObj = new LearnObj({
                                title: req.body.title,
                                belongToChapter: req.body.belongToChapter,
                                description: req.body.description,
                                hasLearningResource: [],
                                hasParentLearnObj: req.body.hasParentLearnObj,
                                hasChildrenLearnObj: []
                            });
                            newLearnObj
                                .save()
                                .then((saved) => {
                                    Users.updateOne({ _id: uploaderDoc._id, __t: uploaderDoc.__t }, { $push: { userActivities: { activityDescription: "Added a learning object with the name " + req.body.title + " with ID: [" + newLearnObj._id + "]." } } }, { upsert: true, safe: true }, function (errorUpdatingUser, updatingResult) {
                                        if (errorUpdatingUser) {
                                            if (errorUpdatingUser.name == "CastError") {
                                                res
                                                    .status(500)
                                                    .json({
                                                        errorCode: 500,
                                                        errorMessage: "Invalid user ID!",
                                                    });
                                                return next();
                                            } else {
                                                res
                                                    .status(500)
                                                    .json({
                                                        errorCode: 500,
                                                        errorMessage: errorUpdatingUser,
                                                    });
                                                return next();
                                            }
                                        }
                                    });
                                    return res.status(200).json({
                                        result:
                                            "Successfully created a learning object with name \"" + newLearnObj.title + "\" with ID: " + newLearnObj._id + "!",
                                    });
                                })
                                .catch((saving_err) => {
                                    return res.status(500).json({ errorCode: 500, errorMessage: saving_err.toString() });
                                });
                        }
                    }
                } else {
                    return res.status(403).json({ 'errorCode': 401, 'errorMessage': "This action is unauthorized since you are a student!" });
                }

            }
        } else {
            return res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}

/**
 * This function is specifically for getting all chapters of a current course
 * the path is /courses/chapters/all with GET request with courseId in the query part of the url
 * like /courses/chapters/learnobj/all?chapterId=? OR /courses/chapters/learnobj/all?learnobjId=?
 * 
 *
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllLearningObjects = function (req, res) { // Anyone who is logged in will be able to get all learning objects for a single chapter.
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
                    res.status(400).json({ 'errorCode': 400, 'errorMessage': "Cannot get chapters without the query that has course ID, please add ?courseId=<your course ID>!" });
                    return;
                } else {
                    // If there is a query
                    // chapter query // Get all learning object for a chapter.
                    if (req.query.chapterId != undefined && req.query.chapterId != null && req.query.chapterId != "") {
                        LearnObj.find({ belongToChapter: req.query.chapterId }).lean()
                            .populate("hasLearningResource")
                            .populate("hasChildrenLearnObj")
                            .exec(function (errorFindingLearnObj, learnObjList) {
                                if (errorFindingLearnObj) {
                                    res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingLearnObj.message });
                                } else {
                                    if (learnObjList.length == 0) {
                                        res.status(200).json({ 'results': "There are no learningObjects for that chapter in the database at the moment!" });
                                    } else {
                                        res.status(200).json({ 'length': learnObjList.length, 'results': learnObjList });
                                    }
                                }
                            });
                    } else {
                        // if we can't find chapterId, but we have learnobjId instead, we can also return the value
                        if (req.query.learnobjId != undefined && req.query.learnobjId != null && req.query.learnobjId != "") {
                            LearnObj.find({ hasParentLearnObj: req.query.learnobjId }).lean()
                                .populate("hasLearningResource")
                                .populate("hasChildrenLearnObj")
                                .exec(function (errorFindingLearnObj, learnObjList) {
                                    if (errorFindingLearnObj) {
                                        res.status(500).json({ 'errorCode': 500, 'errorMessage': errorFindingLearnObj.message });
                                    } else {
                                        if (learnObjList.length == 0) {
                                            res.status(200).json({ 'results': "There are no learningObjects for that learning object as parent in the database at the moment!" });
                                        } else {
                                            res.status(200).json({ 'length': learnObjList.length, 'results': learnObjList });
                                        }
                                    }
                                });
                        } else {
                            // If we can't find any query, we will return an error
                            return res.status(400).json({ 'errorCode': 400, 'errorMessage': "Cannot find learning objects. You must send the GET request to " });                            
                        }
                    }
                }
            }
        } else {
            return res.status(401).json({ 'errorCode': 401, 'errorMessage': "Unauthorized access! API Key not found in the server, please login and try again!" });
        }
    });
}