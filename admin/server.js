var express = require('express');
var morgan = require('morgan');
//var csrf = require('csurf');
var bodyParser = require('body-parser');
//var methodOverride = require('method-override');
var compress = require('compression');
var session = require('express-session');

var app = express();
var server = require('http').Server(app);
//var swig = require('swig');
var mongodb = require('mongodb').MongoClient;
var multiparty = require('connect-multiparty'); // form multipart
//var toobusy = require('toobusy');
var mc = require('mc'); // memcached client

//var Cacher = require('cacher');
//var CacherMemcached = require('cacher-memcached');
//app.cacher = new Cacher(new CacherMemcached('host1:11211'/*app.mc*/));


var i18n = new require('i18n-2');
i18n.expressBind(app, {
    // setup some locales - other locales default to the first locale
    locales: ['fr', 'it', 'es', 'en', 'de']
});

app.disable('x-powered-by');

app.config = {
    dev: 1,
    cache_enabled: 0,
    path: "/var/www/",
    memcache_host: "127.0.0.1",
    ip: "195.154.104.29",
    url: "http://www.autour2vous.com:3000"
};

app.fs = require('fs');
app.xss = require('xss');
app.node_xss = require('node-xss').clean;
app.sha1 = require('sha1');
app.format = require('util').format;
app.BSON = require('mongodb').BSONPure;
app.io = require('socket.io')(server);
app.gm = require('gm').subClass({imageMagick: true});
app.multipart = multiparty();
app.nodemailer = require('nodemailer');
app.smtpTransport = require('nodemailer-smtp-transport');

app.Base64 = {_keyStr: "ABCDEFGHIJKLMN0PQRSTUVWXYZabcdefghijklmnopqrstuvwxyzO123456789+/=",encode: function (e) {if (e === null) {e = '';} else {e = e.toString();}var t = "";var n, r, i, s, o, u, a;var f = 0;e = app.Base64._utf8_encode(e);while (f < e.length) {n = e.charCodeAt(f++);r = e.charCodeAt(f++);i = e.charCodeAt(f++);s = n >> 2;o = (n & 3) << 4 | r >> 4;u = (r & 15) << 2 | i >> 6;a = i & 63;if (isNaN(r)) {u = a = 64;} else if (isNaN(i)) {a = 64;}t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);}return t;},decode: function (e) {if (e === null)return JSON.stringify(null);var t = "";var n, r, i;var s, o, u, a;var f = 0;e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");while (f < e.length) {s = this._keyStr.indexOf(e.charAt(f++));o = this._keyStr.indexOf(e.charAt(f++));u = this._keyStr.indexOf(e.charAt(f++));a = this._keyStr.indexOf(e.charAt(f++));n = s << 2 | o >> 4;r = (o & 15) << 4 | u >> 2;i = (u & 3) << 6 | a;t = t + String.fromCharCode(n);if (u != 64) {t = t + String.fromCharCode(r);}if (a != 64) {t = t + String.fromCharCode(i);}}t = app.Base64._utf8_decode(t);return t;},_utf8_encode: function (e) {e = e.replace(/\r\n/g, "\n");var t = "";for (var n = 0; n < e.length; n++) {var r = e.charCodeAt(n);if (r < 128) {t += String.fromCharCode(r)} else if (r > 127 && r < 2048) {t += String.fromCharCode(r >> 6 | 192);t += String.fromCharCode(r & 63 | 128);} else {t += String.fromCharCode(r >> 12 | 224);t += String.fromCharCode(r >> 6 & 63 | 128);t += String.fromCharCode(r & 63 | 128);}}return t;}, _utf8_decode: function (e) {var t = "";var n = 0;var r = c1 = c2 = 0;while (n < e.length) {r = e.charCodeAt(n);if (r < 128) {t += String.fromCharCode(r);n++;} else if (r > 191 && r < 224) {c2 = e.charCodeAt(n + 1);t += String.fromCharCode((r & 31) << 6 | c2 & 63);n += 2;} else {c2 = e.charCodeAt(n + 1);c3 = e.charCodeAt(n + 2);t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);n += 3;}}return t;}};

var adminRoutes = require('./route/admin');

//var httpsApp = express();

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

/*app.use(function(req, res, next) {
    if (toobusy()) {
        res.send(503, "nice2meet2 est victime de son succès. Merci de vous reconnecter d'ici quelques minutes.");
    } else {
        next();
    }
});*/
app.use('/static', express.static('/var/www/public')/*, {maxAge: 86400000}*/);
app.use('/photo', express.static('/var/www/picturesToValidate'));

//app.use('/static', express.static(__dirname + '/public'), {maxAge: 86400000});// set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                                         // log every request to the console
// create a write stream (in append mode)
var accessLogStream = app.fs.createWriteStream(__dirname + '/access_admin.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));                               // pull information from html in POST

//app.use(methodOverride());                                                      // simulate DELETE and PUT
app.use(session({secret: 'a2v-autour2vous-admin-a2v', cookie: {secure: true, maxAge: 86400000}}));
app.use(compress());

app.set('views', __dirname + '/view');
app.set('view engine', 'twig');
app.set("twig options", {strict_variables: false, cache: true});
app.set("view cache", true);

// gestion de la session
app.use(function(req, res, next) {
    app.i18n = req.i18n;      
    
    app.admin = require('./controller/admin');      
    app.prospect = require('./controller/prospect');
    app.client = require('./controller/client');
    //app.category = require('./controller/category');
    //app.criteria = require('./controller/criteria');
    //app.moderate = require('./controller/moderate');    
    //app.specialty = require('./controller/specialty');
    //app.type = require('./controller/type');
    
    app.transporter = app.nodemailer.createTransport(app.smtpTransport({
            host: 'localhost',
            port: 25,
            //auth: {user: 'matt',pass: 'test'},
            ignoreTLS: true,
            maxConnections: 5,
            maxMessages: 10
        }));
    
    req.i18n.setLocaleFromCookie();
    //res.removeHeader("X-Powered-By");           
    next();
});

adminRoutes(app);

app.use(function(req, res) {
    res.redirect('/404');
});

/*var server = tls.createServer(sslOptions,app).listen(443, function() {
 console.log('ssl');  
 });*/

// memcached connexion
app.mc = new mc.Client(app.config.memcache_host);
app.mc.connect(function() {
    console.log("Connecté à memcache");
    //app.cacher.cache('seconds', 30);
});

mongodb.connect('mongodb://127.0.0.1:27017/n2m2', function(err, _db) {
    if (err)
        return null;

    console.log("Connecté à MongoDb");
    app.db = _db;

    server.listen(3000, function() {
        console.dir("Server listening on port 3000");       
    });

    process.on('SIGINT', function() {
        app.mc.disconnect();

        server.close();
        // appelle .shutdown autorisant le process à se terminier normalement
        //toobusy.shutdown();
        process.exit();
    });
});