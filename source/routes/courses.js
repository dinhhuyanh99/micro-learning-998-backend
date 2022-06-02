'use strict';

const express = require('express'),
    coursesControllers = require('../controllers/courses'),
    { Router } = express,
    coursesRouter = Router();
// For Courses
coursesRouter.post('/add', coursesControllers.addCourse);
coursesRouter.get('/all', coursesControllers.getAllCourses);
coursesRouter.get('/details', coursesControllers.getCourseDetails);
coursesRouter.put('/update', coursesControllers.updateCourseDetails);
// coursesRouter.put('/deleteDetails', coursesControllers.CourseDetails);

// For Chapters
coursesRouter.post('/chapters/add', coursesControllers.addChapter);
coursesRouter.get('/chapters/all', coursesControllers.getAllChapters);
coursesRouter.get('/chapters/details', coursesControllers.getChapterDetails);

// For LearnObj
coursesRouter.post('/chapters/learnobj/add', coursesControllers.addLearnObj);
coursesRouter.get('/chapters/learnobj/all', coursesControllers.getAllLearningObjects);
coursesRouter.get('/chapters/learnobj/details', coursesControllers.getLearningObjectDetails);

// For LearnRes
coursesRouter.post('/chapters/learnobj/learnres/add', coursesControllers.addLearnRes);
coursesRouter.get('/chapters/learnobj/learnres/all', coursesControllers.getAllLearningResource);
coursesRouter.get('/chapters/learnobj/learnres/details', coursesControllers.getLearningResourceDetails);
// For File


module.exports = coursesRouter;

