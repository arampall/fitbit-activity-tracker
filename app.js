
var express=require('express');
var bodyParser=require('body-parser');
var FitbitClient = require('fitbit-client-oauth2');
var https = require('https');

var app=express();
var storage = require('node-persist');
storage.initSync();
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var server=app.listen(80,function(){
    console.log('Port is: '+ server.address().port)});
app.set('views','./views');
app.set('view engine', 'ejs');
app.use('/views',express.static(__dirname + '/views'));
var client = new FitbitClient("227WZ4", "b229e3d51fb80d295ab6090e9e16ceaf");
var redirect_uri = 'http://54.244.196.130/fitbit/callback/';
var scope =  'activity heartrate profile settings';

app.get('/auth/fitbit', function(req, res, next) {
    var authorization_uri = client.getAuthorizationUrl(redirect_uri, scope);
    res.redirect(authorization_uri);
});

app.get('/', function(req, res){
    res.render('authenticate.ejs');
})

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
    res.render('data.ejs');
    var options_profile = {
        host:'api.fitbit.com',
        path:'/1/user/-/profile.json',
        headers:{
            'Authorization':'Bearer '+storage.getItemSync('auth_token')
        }
    }

    var options_steps = {
        host:'api.fitbit.com',
        path:'/1/user/-/activities/steps/date/today/3m.json',
        headers:{
            'Authorization':'Bearer '+storage.getItemSync('auth_token')
        }
    }

    var options_heartrate = {
        host:'api.fitbit.com',
        path:'/1/user/-/activities/heart/date/today/1d.json',
        headers:{
            'Authorization':'Bearer '+storage.getItemSync('auth_token')
        }
    }

    https.get(options_profile, function(res){
        res.setEncoding('utf8');
        res.on('data', function (profile_info) {

            https.get(options_steps, function(res){
                res.setEncoding('utf8');
                res.on('data', function (steps_data) {

                    https.get(options_heartrate, function(res){
                        res.setEncoding('utf8');
                        res.on('data', function (heart_data) {
                            total_data = {};
                            total_data['profile'] = profile_info;
                            total_data['steps'] = steps_data;
                            total_data['heart'] = heart_data;
                            console.log('BODY: ' + total_data);
                        });
                    })

                });
            })
	    
        });
    })
});
