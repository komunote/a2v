exports.login = function (req, res, app) {

    // status 1 = autorisation totale
    // status 2 = autorisations France entière
    // status 3 = autorisations régionales
    if ("admin" === app.xss(req.body.login) && "09110911" === app.xss(req.body.password)) {        
        req.session.admin = {status: 1};        
        req.session.admin.login= app.xss(req.body.login);
        req.session.admin.coordinates = [parseFloat(2.322936), parseFloat(48.8300612)];
        res.render('admin/masterpage_admin.twig', {template: "admin/client/search-form.twig", admin: req.session.admin, url:app.config.url});
        
    }else if ("anthony" === app.xss(req.body.login) && "19811985" === app.xss(req.body.password)) {        
        req.session.admin = {status: 2};
        req.session.admin.login= app.xss(req.body.login);        
        req.session.admin.coordinates = [parseFloat(2.322936), parseFloat(48.8300612)];        
        //req.session.admin.coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
        res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", admin: req.session.admin, url:app.config.url});
    }/*else if ("eric.meou" === app.xss(req.body.login) && "rognonas" === app.xss(req.body.password)) {        
        req.session.admin = {status: 3};
        req.session.admin.login= app.xss(req.body.login);        
        req.session.admin.coordinates = [parseFloat(5.4165286), parseFloat(43.5323028)];        
        res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", admin: req.session.admin, url:app.config.url});
            
    }*/ else {

        console.dir('login ko');
        req.session.admin = undefined;
        res.redirect('/admin/login');
    }

};

exports.getUserCount = function (req, res, app, callback) {

    var collection = app.db.collection('user');

    collection.count(function (err, count) {
        if (err) {
            console.log(err);
            callback(-1);
        } else {
            callback(count);
        }
    });
};

exports.getUserCountValidated = function (req, res, app, callback) {

    var collection = app.db.collection('user');

    collection.count({validated: true}, function (err, count) {
        if (err) {
            console.log(err);
            callback(-1);
        } else {
            callback(count);
        }
    });
};