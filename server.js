'use strict';

const express = require('express'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    rootRouter = require('./source/routes/routes');

// Get an instance of express running
const mainApi = express();
// Setup the port
const envPort = process.env.MLS_PORT || 8080;

// Allowing the main api to accept urlencoded content and json content
mainApi.use(bodyParser.urlencoded({extended: true}));
mainApi.use(bodyParser.json());

// Force the main API to accept cross-origin requests
mainApi.use(cors());

// Let the main API connect to the router to route the users to the correct controllers
mainApi.use('/', rootRouter);

// Make the main API listen to either MLS_PORT in environment variable or default to 8080
mainApi.listen(envPort);

console.log('Currently listening all requests on PORT ' + envPort);