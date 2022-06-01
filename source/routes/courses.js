'use strict';

const express = require('express'),
    coursesControllers = require('../controllers/courses'),
    { Router } = express,
    coursesRouter = Router();
// For Courses
coursesRouter.post('/add', coursesControllers.addCourse);
coursesRouter.get('/all', coursesControllers.getAllCourses);
coursesRouter.get('/details', coursesControllers.getCourseDetails);
coursesRouter.put('/updateDetails', coursesControllers.updateCourseDetails); // We can only update 
// coursesRouter.put('/deleteDetails', coursesControllers.CourseDetails);

// For Chapters
coursesRouter.post('/chapters/add', coursesControllers.addChapter);
coursesRouter.get('/chapters/all', coursesControllers.getAllChapters);
// coursesRouter.get('/chapters/getChapterDetails', coursesControllers.getChapterDetails);

// For LearnObj
coursesRouter.post('/learnObj/addLearnObj', coursesControllers.addLearnObj);

// For LearnRes

// For File


module.exports = coursesRouter;

