// Load express module and initialising the object
var express = require('express');
var app = express();
var router = express.Router();

// Load request module
var request = require('request');

// environment variables. Setting the environment as development, which will be used to fetch the development config values.
process.env.NODE_ENV = 'development';

// Load request module
var lodash = require('lodash');

// loading config values
const config = require('../config/config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = lodash.merge(defaultConfig, environmentConfig);

// as a best practice all global variables should be referenced via global syntax and their names should always begin with g
global.gConfig = finalConfig;


// this function routes the HTTP GET Requests to the provide URL path which is being specified with the specified access token and access keys
//define the route for "/"
app.get("/", function (request, response){
     //show this file when the "/" is requested
console.log("Dir Name " +__dirname);
     response.sendFile(__dirname+"/views/index.html");
 });





module.exports = router;
