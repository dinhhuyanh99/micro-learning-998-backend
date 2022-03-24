'use strict';
const express = require('express'),
    usersControllers = require('../controllers/users/users'),
    { Router } = express,
    userRouter = Router();

userRouter.post('/login', usersControllers.userLogin);
userRouter.post('/logout', usersControllers.userLogout);
userRouter.post('/signup', usersControllers.userSignup);

module.exports = userRouter;

