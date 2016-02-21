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
    url: "http://www.autour2vous.com:4000"
};

app.fs = require('fs');
app.xss = require('xss');
app.node_xss = require('node-xss').clean;
app.sha1 = require('sha1');
app.format = require('util').format;
app.BSON = require('mongodb').BSONPure;
app.gm = require('gm').subClass({imageMagick: true});
app.multipart = multiparty();
app.nodemailer = require('nodemailer');
app.smtpTransport = require('nodemailer-smtp-transport');

app.Base64 = {_keyStr: "ABCDEFGHIJKLMN0PQRSTUVWXYZabcdefghijklmnopqrstuvwxyzO123456789+/=",encode: function (e) {if (e === null) {e = '';} else {e = e.toString();}var t = "";var n, r, i, s, o, u, a;var f = 0;e = app.Base64._utf8_encode(e);while (f < e.length) {n = e.charCodeAt(f++);r = e.charCodeAt(f++);i = e.charCodeAt(f++);s = n >> 2;o = (n & 3) << 4 | r >> 4;u = (r & 15) << 2 | i >> 6;a = i & 63;if (isNaN(r)) {u = a = 64;} else if (isNaN(i)) {a = 64;}t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);}return t;},decode: function (e) {if (e === null)return JSON.stringify(null);var t = "";var n, r, i;var s, o, u, a;var f = 0;e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");while (f < e.length) {s = this._keyStr.indexOf(e.charAt(f++));o = this._keyStr.indexOf(e.charAt(f++));u = this._keyStr.indexOf(e.charAt(f++));a = this._keyStr.indexOf(e.charAt(f++));n = s << 2 | o >> 4;r = (o & 15) << 4 | u >> 2;i = (u & 3) << 6 | a;t = t + String.fromCharCode(n);if (u != 64) {t = t + String.fromCharCode(r);}if (a != 64) {t = t + String.fromCharCode(i);}}t = app.Base64._utf8_decode(t);return t;},_utf8_encode: function (e) {e = e.replace(/\r\n/g, "\n");var t = "";for (var n = 0; n < e.length; n++) {var r = e.charCodeAt(n);if (r < 128) {t += String.fromCharCode(r)} else if (r > 127 && r < 2048) {t += String.fromCharCode(r >> 6 | 192);t += String.fromCharCode(r & 63 | 128);} else {t += String.fromCharCode(r >> 12 | 224);t += String.fromCharCode(r >> 6 & 63 | 128);t += String.fromCharCode(r & 63 | 128);}}return t;}, _utf8_decode: function (e) {var t = "";var n = 0;var r = c1 = c2 = 0;while (n < e.length) {r = e.charCodeAt(n);if (r < 128) {t += String.fromCharCode(r);n++;} else if (r > 191 && r < 224) {c2 = e.charCodeAt(n + 1);t += String.fromCharCode((r & 31) << 6 | c2 & 63);n += 2;} else {c2 = e.charCodeAt(n + 1);c3 = e.charCodeAt(n + 2);t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);n += 3;}}return t;}};

var clientRoutes = require('./route/client');
var restaurantRoutes = require('./route/restaurant');
var pubRoutes = require('./route/pub');
var hotelRoutes = require('./route/hotel');

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
//app.use('/photo', express.static('/var/www/picturesToValidate'));

//app.use('/static', express.static(__dirname + '/public'), {maxAge: 86400000});// set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                                         // log every request to the console
// create a write stream (in append mode)
var accessLogStream = app.fs.createWriteStream(__dirname + '/access_client.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json({limit: '4mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '4mb', extended: true}));// pull information from html in POST
//
//app.use(methodOverride());                                                      // simulate DELETE and PUT
app.use(session({secret: 'a2v-autour2vous-client-a2v', cookie: {secure: false, maxAge: 86400000*30}})); // 30 jours
app.use(compress());

app.set('views', __dirname + '/view');

app.set('view engine', 'twig');
app.set("twig options", {strict_variables: false, cache: true});
app.set("view cache", true);

// gestion de la session
app.use(function(req, res, next) {
    app.i18n = req.i18n;
        
    app.client = require('./controller/client');          
    app.restaurant = require('./controller/restaurant');
    app.pub = require('./controller/pub');
    app.hotel = require('./controller/hotel');
        
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
    app.__= {};
    
    app.__.categories = {
    1: "Restaurant",
    2: "Pub/Café",
    3: "Hôtel"
};

app.__.reductions = {
    0: app.i18n.__("aucune"),
    1: app.i18n.__("-10% sur la note"),
    2: app.i18n.__("-15% sur la note"),
    3: app.i18n.__("-20% sur la note"),
    4: app.i18n.__("-25% sur la note"),
    5: app.i18n.__("-30% sur la note"),
    6: app.i18n.__("-35% sur la note"),
    7: app.i18n.__("-40% sur la note"),
    8: app.i18n.__("-45% sur la note"),
    9: app.i18n.__("-50% sur la note"),
    30: app.i18n.__("1 boisson offerte"),
    31: app.i18n.__("2 boissons offertes"),
    32: app.i18n.__("Vin offert"),
    33: app.i18n.__("Champagne offert")
};


app.__.conditions = {
    0: app.i18n.__("aucune condition"),
    1: app.i18n.__("toute la carte sauf menus"),
    10: app.i18n.__("note à partir de 30 €"),
    11: app.i18n.__("note à partir de 40 €"),
    12: app.i18n.__("note à partir de 50 €"),
    13: app.i18n.__("note à partir de 60 €"),
    14: app.i18n.__("note à partir de 80 €"),
    15: app.i18n.__("note à partir de 100 €"),
    16: app.i18n.__("note à partir de 120 €"),
    17: app.i18n.__("note à partir de 150 €"),
    18: app.i18n.__("note à partir de 200 €"),
    20: app.i18n.__("le midi"),
    21: app.i18n.__("le soir"),
    22: app.i18n.__("jusqu'à 19h00"),
    23: app.i18n.__("jusqu'à 19h30"),
    24: app.i18n.__("jusqu'à 20h00"),
    25: app.i18n.__("jusqu'à 20h30"),
    26: app.i18n.__("jusqu'à 21h00"),
    30: app.i18n.__("pour 1 boisson achetée"),
    31: app.i18n.__("pour 2 boissons achetées"),
    32: app.i18n.__("pour 3 boissons achetées"),
    33: app.i18n.__("pour 4 boissons achetées")
};

app.__.reasons = {
    0: app.i18n.__("Nous sommes complets"),
    1: app.i18n.__("Merci de choisir une heure différente (supérieure)"),
    2: app.i18n.__("Merci de choisir une heure différente (inférieure)"),
    3: app.i18n.__("Le nombre de personnes est trop important (2 max)"),
    4: app.i18n.__("Le nombre de personnes est trop important (4 max)"),
    5: app.i18n.__("Le nombre de personnes est trop important (6 max)"),
    6: app.i18n.__("Le nombre de personnes est trop important (8 max)"),
    7: app.i18n.__("Le nombre de personnes est trop important (10 max)"),
    8: app.i18n.__("Le nombre de personnes est trop important (15 max)"),
    9: app.i18n.__("Le nombre de personnes est trop important (20 max)")
};
    next();
});

clientRoutes(app);
restaurantRoutes(app);
pubRoutes(app);
hotelRoutes(app);

app.use(function(req, res) {
    res.redirect('/client/404');
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

    server.listen(4000, function() {
        console.dir("Server listening on port 4000");
    });

    process.on('SIGINT', function() {
        app.mc.disconnect();

        server.close();
        // appelle .shutdown autorisant le process à se terminier normalement
        //toobusy.shutdown();
        process.exit(); 
    });
});