'use strict';
const express = require('express'),
    usersControllers = require('../controllers/users'),
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
userRouter.delete('/admin/deleteUser', usersControllers.deleteUserAdmin);

module.exports = userRouter;

