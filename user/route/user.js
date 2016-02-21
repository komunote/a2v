module.exports = function (app) {

    /*app.use(function(req, res, next){
        var schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();
        if (schema === 'https') {
            next();
        } else {
            res.redirect("https://www.autour2vous.com");
        }
    });*/
    /*app.all('/', function (req, res) {
        res.redirect("/");
    });*/

    app.get('/logged', function (req, res) {
        res.contentType('json');

        if (req.session.user) {
            res.send(true);
        } else {
            res.send(null);
        }
        res.end();
    });

    app.all('/', /*app.cacher.cache('days', 1),*/ function (req, res) {
        app.user.searchNearbyProspects(req, res, app, function(data){
            if (req.session.user) {
                res.render('view/index.html', {user: req.session.user});
            } else {
//console.log(data);
                res.render('view/index-home.html', {user: null, result: data});
                //res.render('home');
            }
        });
    });

    app.get('/404', function (req, res) {
        res.redirect("/");
        /*if (typeof (req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "404.twig", user: req.session.user});
        } else {
            res.render('masterpage_home.twig', {template: "404.twig"});
        }*/
    });

    app.route('/login')
            .post(function (req, res) {

                /*if ((app.config.url + "/login") === req.headers['referer'] ||
                        (app.config.url + "/") === req.headers['referer']) {*/
                if (!req.session.user){
                    app.user.login(req, res, app);
                } else {
                    res.redirect("/");
                }
            })
            .get(function (req, res) {
                res.redirect("/");
            });

    app.get('/logout', function (req, res) {
        req.session.user = undefined;
        res.redirect('/');
    });

    app.route('/subscribe')
            .get(function (req, res) {
                res.redirect('/');
            })
            .post(function (req, res) {

                if ((app.config.url + "/subscribe") === req.headers['referer'] ||
                        (app.config.url + "/") === req.headers['referer']) {

                    //var user = require('../controller/user');
                    app.user.insert(req, res, app);
                } else {
                    res.redirect('/');
                }
            });

    app.get('/subscribe-validation/:id([0-9a-f]{24})/:id_validation([0-9a-f]{40})/', function (req, res) {
        //var user = require('../controller/user');
        app.user.subscribeValidate(req, res, app, req.params.id, req.params.id_validation);
    });

    app.get('/subscribe-validation-success', function (req, res) {
        res.render("user/subscribe-validation-success.twig");
    });

    app.get('/subscribe-validation-failed', function (req, res) {
        res.render("user/subscribe-validation-failed.twig");
    });

    app.get('/update/form', function (req, res) {
        if (req.session.user) {
            app.user.getById(req, res, app, req.session.user._id, function (data) {
                if (data === null || data.user === null) {
                    res.contentType('json');
                    res.send(null);
                } else {
                    res.contentType('json');
                    res.send({
                        user: data.user,
                        __: data.__});
                        //user: app.Base64.encode(JSON.stringify(data.user)),
                        //__: app.Base64.encode(JSON.stringify(data.__))});

                }
            });
        } else {
            res.redirect('/');
        }
    });

    app.route('/search')
            .post(function (req, res) {
                if (req.session.user) {
                    app.user.search(req, res, app);
                } else {
                    res.redirect('/');
                }
            });

    app.post('/search-nearby', function (req, res) {

        if (req.session.user) {
            app.user.searchNearby(req, res, app);
        } else {
            res.redirect('/');
        }

    });


    app.post('/update', function (req, res) {

        if (req.session.user) {
            app.user.update(req, res, app);
        } else {
            res.redirect('/');
        }
    });

    app.get('/update/failed', function (req, res) {
        if (req.session.user) {
            app.user.getById(req, res, app, req.session.user._id, function (user) {
                if (user === null) {
                    res.redirect('/');
                } else {
                    res.render('masterpage.twig', {template: "user/update-form.twig",
                        user: user,
                        msg: {success: app.i18n.__("La mise à jour a échoué")}});
                    res.end();
                }
            });
        } else {
            res.redirect('/');
        }
    });

    app.get('/update/success', function (req, res) {
        if (req.session.user) {
            app.user.getById(req, res, app, req.session.user._id, function (user) {
                if (user === null) {
                    res.redirect('/');
                } else {
                    res.render('masterpage.twig', {template: "user/update-form.twig",
                        user: user,
                        msg: {success: app.i18n.__("Mise à jour réussie")}});
                    res.end();
                }
            });
        } else {
            res.redirect('/');
        }
    });

    /* ajax call */
    app.post('/update-location', function (req, res) {
        if (req.session.user) {
            app.user.updateLocation(req, res, app);
        }
    });

    /* ajax call */
    app.post('/check-nickname', function (req, res) {
        app.user.checkNickname(req, res, app, app.xss(req.body.nickname));
    });

    /* ajax call */
    app.post('/check-email', function (req, res) {
        app.user.checkEmail(req, res, app, app.xss(req.body.email));
    });

    /* ajax call */
    app.post('/resa-cancel', function (req, res) {
        if (req.session.user) {
            app.user.cancelReservation(req, res, app, function(result){
                res.send(result);
            });
        }
    });


    app.get('/getNearbyProspects', function (req, res) {
        //if (req.session.user) {
            app.user.searchNearbyProspects(req, res, app, function(data){
                res.send(data);
            });
        //} else {
            //res.send(null);
        //}
    });

    app.post('/generateQrCode', function (req, res) {
        if (req.session.user) {
            app.user.generateQrCode(req, res, app, function (data) {
                res.send(data);
            });
        } else {
            res.send(null);
        }
    });

    app.post('/generateReservation', function (req, res) {
        if (req.session.user) {
            app.user.generateReservation(req, res, app, function (data) {
                res.send(data);
            });
        } else {
            res.send(null);
        }
    });
};