'use strict';
const express = require('express'),
    usersControllers = require('../controllers/users/users'),
    { Router } = express,
    userRouter = Router();

userRouter.post('/login', usersControllers.userLogin);
userRouter.post('/logout', usersControllers.userLogout);
userRouter.post('/signup', usersControllers.userSignup);
userRouter.get('/getUserDetails', usersControllers.getUserDetails);
userRouter.put('/updateUserDetails', usersControllers.updateUserDetails);

// Admin/SuperUser Stuffs
userRouter.get('/admin/getUsersDetails', usersControllers.getUsersAdmin);
userRouter.put('/admin/updateUserStatusAdmin', usersControllers.updateUserStatusAdmin);
userRouter.delete('/admin/updateUserStatusAdmin', usersControllers.updateUserStatusAdmin);

module.exports = userRouter;

