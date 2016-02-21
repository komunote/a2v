var express = require('express');
var morgan = require('morgan');
var app = express();
var http = require('http');//.Server(app);

var Ddos = require('ddos'),
        ddos = new Ddos({
            maxcount: 120, burst: 20,
            limit: 80, maxexpiry: 120, checkinterval: 1,
            error: "Trop d'accès simultanés. Merci de patienter 2 min avant de vous reconnecter."});

//app.disable('x-powered-by');

app.config = {
    dev: 1,
    cache_enabled: 0,
    path: "/var/www/",
    memcache_host: "127.0.0.1",
    ip: "62.210.251.98",
    url: "http://www.autour2vous.com"
};

//app._ = require('underscore'); // underscore
app.fs = require('fs');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "autour2vous.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('X-Powered-By', 'Apache');
    next();
});

// ddos deactivated
//app.use(ddos.express);

app.use('/static', express.static('/var/www/public')/*, {maxAge: 86400000}*/);

app.use(morgan('dev'));     // log every request to the console
// create a write stream (in append mode)
var accessLogStream = app.fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

app.use(function (req, res) {
    res.writeHead(301, {"Location": "https://www.autour2vous.com"});
    res.end();
});

http.createServer(app).listen(80);                    