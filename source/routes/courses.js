'use strict';

const express = require('express'),
    coursesControllers = require('../controllers/courses'),
    { Router } = express,
    coursesRouter = Router();
// For Courses
coursesRouter.post('/addCourse', coursesControllers.addCourse);
coursesRouter.get('/all', coursesControllers.getAllCourses);
coursesRouter.get('/details', coursesControllers.getCourseDetails);
// coursesRouter.put('/updateDetails', coursesControllers.CourseDetails);
// coursesRouter.put('/deleteDetails', coursesControllers.CourseDetails);

// For Chapters
coursesRouter.post('/chapters/addChapter', coursesControllers.addChapter);
coursesRouter.get('/chapters/all', coursesControllers.getAllChapters);
// coursesRouter.get('/chapters/getChapterDetails', coursesControllers.getChapterDetails);

// For LearnObj

// For LearnRes

// For File


module.exports = coursesRouter;

