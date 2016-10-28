
var express=require('express');
var bodyParser=require('body-parser');
var FitbitClient = require('fitbit-client-oauth2');
var https = require('https');
//var connection=require('./connection');
//var routes=require('./routes');
var app=express();
var storage = require('node-persist');
storage.initSync();
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
        next();
        });
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        //connection.init();
        //routes.configure(app);
        var server=app.listen(80,function(){
        console.log('Port is: '+ server.address().port)});
        var client = new FitbitClient("227WZ4", "b229e3d51fb80d295ab6090e9e16ceaf");
    var redirect_uri = 'http://54.244.196.130/fitbit/callback/';
    var scope =  'activity nutrition profile settings sleep social weight';

    app.get('/auth/fitbit', function(req, res, next) {

        var authorization_uri = client.getAuthorizationUrl(redirect_uri, scope);

        res.redirect(authorization_uri);
    });
    
    app.get('/fitbit/callback/', function(req, res, next) {

        var code = req.query.code;
        console.log(code);
        client.getToken(code, redirect_uri)
            .then(function(token) {
		console.log(token['token']['access_token']);
		storage.setItemSync('auth_token',token['token']['access_token']);
		console.log(storage.getItemSync('auth_token'));
                res.redirect(302, '/home');

            })
            .catch(function(err) {
                res.send(500, err);

            });

    });

    app.get('/home',function(req, res){
    	console.log("in home");
	res.send('<p>Home</p>');
	var options = {
		host:'api.fitbit.com',
		path:'/1/user/-/profile.json',
		headers:{
			'Authorization':'Bearer '+storage.getItemSync('auth_token')
		}
	}

	https.get(options, function(res){
		res.setEncoding('utf8');
  		res.on('data', function (chunk) {
    		console.log('BODY: ' + chunk);
  	});
		console.log(res.statusCode);
	})
    });
