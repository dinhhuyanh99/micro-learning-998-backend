exports.getAllCourses = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}

exports.getCourseDetails = function(req, res){
    res.status(200).json({
        'response': 'Hello, welcome to path ' + req.originalUrl
    });
}