'use strict';

exports.userLogin = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}

exports.userLogout = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}

exports.userSignup = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}