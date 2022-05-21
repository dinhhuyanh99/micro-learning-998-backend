'use strict';

const express = require('express'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    Users = require('./source/models/users'),
    Courses = require('./source/models/courses'),
    Chapters = require('./source/models/courses/chapters'),
    Teachers = require('./source/models/users/teachers'),
    Students = require('./source/models/users/students'),
    Keys = require('./source/models/APIKeys'),
    rootRouter = require('./source/routes/routes'),
    {EOL} = require('os');
var configParams = null;

// Get an instance of express running
const mainApi = express();
// Setup the port
const envPort = process.env.PORT || 8080;
const envHost = process.env.HOST || '127.0.0.1';

function isEmpty(obj) {
    if(obj == undefined || obj == null){
        return false;
    }
    for(var prop in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}


// Check for the config file first!
try {
    configParams = require('./config.json');
} catch (ex) {
    console.error('X Cannot find the configurations! Please ensure config.json is in the same folder as the server.js file and restart the application!');
    process.exit();
}

// Allowing the main api to accept urlencoded content and json content
console.debug('-> Allowing the main api to accept urlencoded content and json content . . .');
mainApi.use(bodyParser.urlencoded({extended: true}));
mainApi.use(bodyParser.json());

// Force the main API to accept cross-origin requests
console.debug('-> Force the main API to accept cross-origin requests');
mainApi.use(cors());

// Establish connection to mongodb db on the atlas cluster
try {
    console.debug('-> Establish connection to mongodb db on the atlas cluster . . .');
	mongoose.Promise = global.Promise;
    if(isEmpty(configParams)){
        console.error('X Cannot find the configurations! Please ensure config.json is in the same folder as the server.js file and is not empty!');
        process.exit();
    } else {
        // console.debug('mongodb+srv://' + encodeURIComponent(configParams.dbUsername) + ':' + encodeURIComponent(configParams.dbPassword) + '@' + configParams.dbUrl + '/' + configParams.defaultDatabase + '?retryWrites=true&w=majority');
        mongoose.connect('mongodb+srv://' + encodeURIComponent(configParams.dbUsername) + ':' + encodeURIComponent(configParams.dbPassword) + '@' + configParams.dbUrl + '/' + configParams.defaultDatabase + '?retryWrites=true&w=majority')
        .then(res => console.debug("Connected to DB" + '@' + configParams.dbUrl + ". Default DB is " + configParams.defaultDatabase))
        .catch(err => {console.error("We are having issues with connecting to DB..."); console.error(err);});
    }
} catch(exception){
	console.log(exception);
}

// Let the main API connect to the router to route the users to the correct controllers
console.debug('-> Let the main API connect to the router to route the users to the correct controllers');
mainApi.use('/', rootRouter);


// Make the main API listen to either MLS_PORT in environment variable or default to 8080
mainApi.listen(envPort, envHost, function(){
    console.log('Currently listening all requests on PORT ' + envPort);
    console.log('Currently listening all requests on HOST ' + envHost);
});

