// Load express module and initialising the object
var express = require('express');
var app = express();
var router = express.Router();

var OAuth = require('OAuth');



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
var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  global.gConfig.oauth_twitterKey,
  global.gConfig.oauth_twitterSecret,
  '1.0A',
  null,
  'HMAC-SHA1'
);



// this function routes the HTTP GET Requests to the provide URL path which is being specified with the specified access token and access keys
app.get(global.gConfig.app_uri, function(req, res) {
  // Reading the tweet id passed in the request URL
	var tweet_id = req.params['id'];
       oauth.get(
  global.gConfig.url_twitter + tweet_id + '&tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld',
    global.gConfig.oauth_token,
  global.gConfig.oauth_secret,
  function (error, data, response){
    if (error) console.error(error);
    data = JSON.parse(data);
    // console.log(JSON.stringify(data, 0, 2));
    // console.log(response.body);
   console.log(JSON.stringify(data, 0, 2));
   		res.end(JSON.stringify(data, 0, 2));


}); 
	
});

// setting the application to listen on port configured in the config file
var server = app.listen(global.gConfig.node_port, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Fetch Tweet Details app listening at %s", port)

})


module.exports = router;
