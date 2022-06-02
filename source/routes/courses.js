'use strict';

const express = require('express'),
    coursesControllers = require('../controllers/courses'),
    { Router } = express,
    coursesRouter = Router();
// For Courses
coursesRouter.post('/add', coursesControllers.addCourse);
coursesRouter.get('/all', coursesControllers.getAllCourses);
coursesRouter.get('/details', coursesControllers.getCourseDetails);
coursesRouter.put('/update', coursesControllers.updateCourseDetails); // We can only update 
// coursesRouter.put('/deleteDetails', coursesControllers.CourseDetails);

// For Chapters
coursesRouter.post('/chapters/add', coursesControllers.addChapter);
coursesRouter.get('/chapters/all', coursesControllers.getAllChapters);
coursesRouter.get('/chapters/details', coursesControllers.getChapterDetails);

// For LearnObj
coursesRouter.post('/chapters/learnobj/add', coursesControllers.addLearnObj);
coursesRouter.get('/chapters/learnobj/all', coursesControllers.getAllLearningObjects);

// For LearnRes

// For File


module.exports = coursesRouter;

