'use strict';
exports.addPaymentDetails = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}

exports.removePaymentDetails = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}

exports.showPaymentDetails = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}