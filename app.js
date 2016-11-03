
var express=require('express');
var bodyParser=require('body-parser');
var connection=require('./connection');
var FitbitClient = require('fitbit-client-oauth2');
var https = require('https');
var randtoken = require('rand-token');
var request = require('request');
var session = require('express-session');
var app=express();
var storage = require('node-persist');
storage.initSync();
connection.init();
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
});
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var server=app.listen(80,function(){
    console.log('Port is: '+ server.address().port)});
app.set('views','./views');
app.set('view engine', 'ejs');
app.use('/node_modules',express.static(__dirname + '/node_modules'));
app.use('/views',express.static(__dirname + '/views'));
var client = new FitbitClient("227WZ4", "b229e3d51fb80d295ab6090e9e16ceaf");
var redirect_uri = 'http://54.244.196.130/fitbit/callback/';
var scope =  'activity heartrate profile settings';

app.get('/auth/fitbit', function(req, res, next) {
    var authorization_uri = client.getAuthorizationUrl(redirect_uri, scope);
    res.redirect(authorization_uri);
});

app.get('/', function(req, res){
    var sess = req.session;
    if(!sess.userID){
        res.render('authenticate.ejs');
    }
    else{
        res.render('data.ejs');
    }

})

app.get('/fitbit/callback/', function(req, res, next) {
    var sess = req.session;
    var code = req.query.code;
    client.getToken(code, redirect_uri)
        .then(function(token) {
            var userid = randtoken.generate(6);
            sess.userID = userid;
            storage.setItemSync(sess.userID,token['token']['access_token']);
	    console.log(storage.getItemSync(sess.userID));
            res.redirect(302, '/home');

        })
        .catch(function(err) {
            res.send(500, err);

        });

});

app.get('/home', function(req, res){
    var sess = req.session;
    var token = randtoken.generate(6);
    res.render('data.ejs');
});

app.get('/getStepData', function(req, res){
    request({
        url:'https://api.fitbit.com/1/user/-/activities/steps/date/today/1w.json',
        headers :{
            'Authorization': 'Bearer '+storage.getItemSync('auth_token')
        }
    },function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
            res.send(body);
        }

        else if(error && response.statusCode == 401){
            var tokens = storage.getItemSync('auth_token');
            client.refreshAccessToken(tokens)
                .then(function(new_token) {
                    storage.setItemSync('auth_token',token['token']['access_token']);
                    request({
                        url:'https://api.fitbit.com/1/user/-/activities/steps/date/today/1w.json',
                        headers :{
                            'Authorization': 'Bearer '+storage.getItemSync('auth_token')
                        }
                    },function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body) // Show the HTML for the Google homepage.
                            res.send(body);
                        }

                    })
                    // save new_token data to db
                    // then do more stuff here.

                }).catch(function(err) {
                console.log('error refreshing user token', err);
            });
        }
    })
});

app.get('/getHeartData', function(req, res){
    request({
	url:'https://api.fitbit.com/1/user/-/activities/heart/date/today/1m.json',
	headers :{
		'Authorization': 'Bearer '+storage.getItemSync('auth_token')
	    }
	},function (error, response, body) {
		if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
		    res.send(body);
  	    }

  	    else if(error && response.statusCode == 401){
  	        var tokens = storage.getItemSync('auth_token');
            client.refreshAccessToken(tokens)
                .then(function(new_token) {
                    storage.setItemSync('auth_token',token['token']['access_token']);
                    request({
                        url:'https://api.fitbit.com/1/user/-/activities/heart/date/today/1m.json',
                        headers :{
                            'Authorization': 'Bearer '+storage.getItemSync('auth_token')
                        }
                    },function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body) // Show the HTML for the Google homepage.
                            res.send(body);
                        }

                    })
                    // save new_token data to db
                    // then do more stuff here.

                }).catch(function(err) {
                console.log('error refreshing user token', err);
            });
        }
    })

});

app.get('/getUserData',function(req, res){
    request({
        url:'https://api.fitbit.com/1/user/-/profile.json',
        headers :{
            'Authorization': 'Bearer '+storage.getItemSync('auth_token')
        }
    },function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
            res.send(body);
        }

        else if(error && response.statusCode == 401){
            var tokens = storage.getItemSync('auth_token');
            client.refreshAccessToken(tokens)
                .then(function(new_token) {
                    storage.setItemSync('auth_token',token['token']['access_token']);
                    request({
                        url:'https://api.fitbit.com/1/user/-/profile.json',
                        headers :{
                            'Authorization': 'Bearer '+storage.getItemSync('auth_token')
                        }
                    },function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body) // Show the HTML for the Google homepage.
                            res.send(body);
                        }

                    })
                    // save new_token data to db
                    // then do more stuff here.

                }).catch(function(err) {
                console.log('error refreshing user token', err);
            });
        }
    })
});

app.get('/logout', function(req, res){
	console.log("in logout");
	var base = "227WZ4:b229e3d51fb80d295ab6090e9e16ceaf";
	request({
        url:'https://api.fitbit.com/oauth2/revoke',
	method:'POST',
        headers :{
                'Authorization': 'Basic '+'MjI3V1o0OmIyMjllM2Q1MWZiODBkMjk1YWI2MDkwZTllMTZjZWFm'
            },
	form: {
            token: storage.getItemSync('auth_token')
    	}
        },function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body) // Show the HTML for the Google homepage.
                    res.render(authenticate.ejs);
		}
		else{
		    console.log(response);
		}
    })
});

