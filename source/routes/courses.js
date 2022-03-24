'use strict';
const express = require('express'),
    coursesControllers = require('../controllers/courses'),
    { Router } = express,
    coursesRouter = Router();

coursesRouter.get('/all', coursesControllers.getAllCourses);
coursesRouter.get('/details', coursesControllers.getCourseDetails);

module.exports = coursesRouter;

