'use strict';
// Import router and controllers
const express = require('express'),
    userRouter = require('./users'),
    coursesRouter = require('./courses'),
    paymentsRouter = require('./payments'),
    { Router } = express,
    rootRouter = Router();

// Declare all root paths
rootRouter.use('/users', userRouter);
rootRouter.use('/courses', coursesRouter);
rootRouter.use('/payments', paymentsRouter);
rootRouter.use(function(req, res, next) {
    if (!req.route){
        res.status(404).json({
            'response': 'Invalid path!'
        });
    }
    next();
});

// Export module
module.exports = rootRouter;