var express = require('express'),
        morgan = require('morgan'),
//var csrf = require('csurf');
        bodyParser = require('body-parser'),
//var methodOverride = require('method-override');
        compress = require('compression'),
        session = require('express-session'),
        ClusterStore = require('strong-cluster-connect-store')(session);

var app = express(),
        https = require('https'),
        server;

var swig = require('swig');
var mongodb = require('mongodb').MongoClient;
var multiparty = require('connect-multiparty'); // form multipart

//var multiparty = require('connect-multiparty'); // form multipart
//var toobusy = require('toobusy'),
//var Ddos = require('ddos'),
//        ddos = new Ddos({
//            maxcount: 120, burst: 20,
//            limit: 80, maxexpiry: 120, checkinterval: 1,
//            error: "Trop d'accès simultanés. Merci de patienter 2 min avant de vous reconnecter."});
var mc = require('mc'); // memcached client

var i18n = new require('i18n-2'),
        cluster = require('express-cluster'),
        numCPUs = require('os').cpus().length;
//console.dir("nombre de CPU : " + numCPUs);

i18n.expressBind(app, {
    // setup some locales - other locales default to the first locale
    locales: ['fr', 'it', 'es', 'en', 'de']
});

//app.disable('x-powered-by');

app.config = {
    dev: 1,
    cache_enabled: 0,
    path: "/var/www/",
    memcache_host: "127.0.0.1",
    ip: "127.0.0.1",
    url: "https://www.autour2vous.com"
};

//app._ = require('underscore'); // underscore
app.fs = require('fs');
app.xss = require('xss');
app.node_xss = require('node-xss').clean;
app.sha1 = require('sha1');
app.format = require('util').format;
app.BSON = require('mongodb').BSONPure;
//app.gm = require('gm').subClass({imageMagick: true});
//app.multipart = multiparty();
app.multipart = multiparty({maxFilesSize: '3MB'});
//app.nodemailer = require('nodemailer');
//app.smtpTransport = require('nodemailer-smtp-transport');
app.qrCode = require('qrcode-npm');

app.secureOptions = {
    //key: app.fs.readFileSync('/var/www/a2v/key.pem'),
    //cert: app.fs.readFileSync('/var/www/a2v/cert.pem')
    key: app.fs.readFileSync('/var/www/certificat/a2v.key'),
    cert: app.fs.readFileSync('/var/www/certificat/www_autour2vous_com.crt'),
    ca: [
        app.fs.readFileSync('/var/www/certificat/AddTrustExternalCARoot.crt'),
        app.fs.readFileSync('/var/www/certificat/COMODORSAAddTrustCA.crt'),
        app.fs.readFileSync('/var/www/certificat/COMODORSADomainValidationSecureServerCA.crt')
    ],
    ciphers: 'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    honorCipherOrder: true
    /*,requestCert: true   */
};

var userRoutes = require('./user/route/user');//,
        /*adminRoutes = require('./admin/route/admin'),
        clientRoutes = require('./client/route/client'),
        restaurantRoutes = require('./client/route/restaurant'),
        pubRoutes = require('./client/route/pub'),
        hotelRoutes = require('./client/route/hotel');*/

//var httpsApp = express();

app.use(function (req, res, next) {
    //var  ex= req.headers['referer'].plit();
    /*console.dir(req.headers['host']);
     var hosts=[
     'nice2meet2.com', 'www.nice2meet2.com',
     'nice2meet2.fr', 'www.nice2meet2.fr',
     'nice2meet2.eu', 'www.nice2meet2.eu',
     'nice2meet2.net', 'www.nice2meet2.net',
     'n2m2.eu', 'www.n2m2.eu'
     ];
     if (hosts.indexOf(req.headers['host'])){
     //res.redirect('http://www.n2m2.fr');
     return res.send({'Location': 'http://www.n2m2.com'}, 301) ;
     //res.end();
     }*/

    /*res.header("Access-Control-Allow-Origin", "n2m2.fr");
     //res.header("Access-Control-Allow-Origin", "nice2meet2.com");
     res.header('Access-Control-Allow-Methods', 'GET,POST');
     res.header("Access-Control-Allow-Headers", "X-Requested-With");*/

    res.header("Access-Control-Allow-Origin", "autour2vous.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.setHeader('X-Powered-By', 'Apache');

    next();
});

app.enable('trust proxy');

/*app.use(function (req, res, next) {
 if (toobusy()) {
 res.send(503, "autour2vous est victime de son succès. Merci de vous reconnecter d'ici quelques minutes.");
 } else {
 next();
 }
 });*/

 // deactivate ddos
//app.use(ddos.express);
app.use('/js', express.static(__dirname+'/js'));
app.use('/view', express.static(__dirname+'/view'));

app.use('/static', express.static('/var/www/public')/*, {maxAge: 86400000}*/);
//app.use('/photo', express.static(__dirname + '/picturesToValidate'));


app.use(morgan('dev'));     // log every request to the console
// create a write stream (in append mode)
var accessLogStream = app.fs.createWriteStream(__dirname + '/access_ssl.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json({limit: '3mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '3mb', extended: true}));  // pull information from html in POST

//app.use(methodOverride());                                                      // simulate DELETE and PUT
app.use(session({store: new ClusterStore(), secret: 'a2v-autour2vous-ssl-a2v', cookie: {secure: true, httpOnly: true, maxAge: 86400000 * 7}})); // 7 jours
app.use(compress());

app.set('views', __dirname);
/*app.set('view engine', 'twig');
app.set("twig options", {strict_variables: true, cache: false});
app.set("view cache", false);*/


 // view engine setup
 // utilisation du moteur de swig pour les .html
 app.engine('html', swig.renderFile);
 // utiliser le moteur de template pour les .html
 app.set('view engine', 'html');
 // view cache
 app.set('view cache', true); // désactivation du cache express
 swig.setDefaults({ cache: false }); // désactivation du cache swig

// gestion de la session
app.use(function (req, res, next) {
    app.i18n = req.i18n;
    app.user = require('./user/controller/user');

    /*app.admin = require('./admin/controller/admin');
    app.prospect = require('./admin/controller/prospect');
    app.admin_client = require('./admin/controller/client');

    app.client = require('./client/controller/client');
    app.restaurant = require('./client/controller/restaurant');
    app.pub = require('./client/controller/pub');
    app.hotel = require('./client/controller/hotel');

    app.transporter = app.nodemailer.createTransport(app.smtpTransport({
        host: 'localhost',
        port: 25,
        //auth: {user: 'matt',pass: 'test'},
        ignoreTLS: true,
        maxConnections: 5,
        maxMessages: 10
    }));*/

    req.i18n.setLocaleFromCookie();
    app.__ = {};

    next();
});

userRoutes(app);
/*adminRoutes(app);
clientRoutes(app);
restaurantRoutes(app);
pubRoutes(app);
hotelRoutes(app);*/

//app.engine('.html', require('twig'));

// memcached connexion
app.mc = new mc.Client(app.config.memcache_host);
app.mc.connect(function () {
    console.log("Connecté à memcache");
    //app.cacher.cache('seconds', 30);
});

mongodb.connect('mongodb://127.0.0.1:27017/n2m2', function (err, _db) {
    if (err)
        return null;

    console.log("Connecté à MongoDb");
    app.db = _db;
});

/*process.on('SIGINT', function () {
    app.mc.disconnect();
    // appelle .shutdown autorisant le process à se terminier normalement
    //toobusy.shutdown();
    process.exit();
});*/


cluster(function (worker) {

    app.worker = worker;

    https.createServer(app.secureOptions, app)
            .listen(443, null, null, function (req, res) {
                console.log('https is enabled on port 443');
            });

    return server = app.listen(0xbeef);

}, {count: 1});
