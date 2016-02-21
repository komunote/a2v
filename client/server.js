var express = require('express');
var morgan = require('morgan');
var app = express();
var http = require('http');//.Server(app);

app.disable('x-powered-by');

app.config = {
    dev: 1,
    cache_enabled: 0,
    path: "/var/www/",
    memcache_host: "127.0.0.1",
    ip: "62.210.251.98",
    url: "http://www.autour2vous.com/cmient"
};

//app._ = require('underscore'); // underscore
app.fs = require('fs');


app.use(function (req, res, next) { 
    res.header("Access-Control-Allow-Origin", "autour2vous.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(morgan('dev'));     // log every request to the console
// create a write stream (in append mode)
var accessLogStream = app.fs.createWriteStream(__dirname + '/access_client_old.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

app.use(function (req, res) {    
    res.redirect("https://www.autour2vous.com"+req.url);
});

http.createServer(app).listen(4000);