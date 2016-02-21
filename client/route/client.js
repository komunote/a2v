module.exports = function (app) {

    /*app.get('/', function (req, res) {
        if (req.session.client) {
            res.render('masterpage_client.twig', {template: "index.twig", client: req.session.client});
        } else {
            res.redirect('/client');
        }
    });*/

    app.get('/client', function (req, res) {
        if (req.session.client) {
            if (req.session.client.to_subscribe) {
                res.redirect('/client/subscribe');
            } else {
                res.render('client/masterpage_client.twig', {template: "client/index.twig", client: req.session.client, url:app.config.url});
            }
        } else {
            res.render('client/masterpage_home_client.twig');//, {template: "login-form.twig"});
        }
    });

    app.get('/client/404', function (req, res) {
        if (req.session.client) {
            res.render('client/masterpage_client.twig', {template: "client/404.twig", client: req.session.client, url:app.config.url});
        } else {
            res.redirect('/client');
        }
    });

    app.get('/home', function (req, res) {
        res.redirect('/client');
    });

    app.post('/client/login', function (req, res) {
        if (req.session.client) {
            res.redirect('/client');
        } else {
            app.client.login(req, res, app, "client", function (data) {
                //res.send(data);
                if (data) {
                    res.redirect('/client');
                } else {
                    app.client.login(req, res, app, "prospect", function (data) {
                        if (!data) {
                            res.redirect('/client');
                        } else {
                            req.session.client.to_subscribe = 1;
                            console.log("not registered");
                            res.redirect('/client/subscribe');
                        }
                    });
                }
            });
        }
    });

    app.get('/client/subscribe', function (req, res) {
        if (req.session.client && req.session.client.to_subscribe) {            
            res.render('client/masterpage_client.twig', {template: "client/subscribe/form.twig", client: req.session.client, url:app.config.url});            
        } else {
            res.redirect('/client');
        }
    });

    app.get('/client/subscription/:email/:password', function (req, res) {
        if (!req.params.email || !req.params.password) {
            console.log("subscription : empty email/password");
            res.redirect('/client');
        }
        var credentials = {email: app.Base64.decode(req.params.email), password: app.Base64.decode(req.params.password)};

        app.client.loginSubscription(req, res, app, "client", credentials, function (data) {
            //res.send(data);
            if (data) {
                console.log('client found');
                res.redirect('/client');                
            } else {
                app.client.loginSubscription(req, res, app, "prospect", credentials, function (data) {
                    if (!data) {
                        console.log('prospect not found');
                        res.redirect('/client');
                    } else {
                        req.session.client.to_subscribe = 1;
                        res.render('client/masterpage_client.twig', {template: "client/subscribe/form.twig", client: req.session.client, url:app.config.url});
                    }
                });
            }
        });
    });

    app.get('/client/logout', function (req, res) {
        if (req.session.client) {
            delete req.session.client;
        }
        res.redirect('/client');
    });

    app.get('/client/account-form', function (req, res) {
        if (req.session.client) {
            app.client.get(req, res, app, function (data, weekday) {       
                if (!data) {
                    res.redirect('/client');
                } else {
                    if (typeof (req.session.message) !== 'undefined') {
                        res.render('client/masterpage_client.twig', {template: "client/update-form.twig", client: data, message: req.session.message, weekday:weekday, url:app.config.url});
                        delete req.session.message;
                    } else {
                        res.render('client/masterpage_client.twig', {template: "client/update-form.twig", client: data, weekday:weekday, url:app.config.url});
                    }
                }
            });
        } else {
            res.redirect('/client');
        }
    });

    app.post('/client/update', function (req, res) {
        if (req.session.client) {
            app.client.update(req, res, app, function (data, message) {
                if (!data) {
                    req.session.message = '<span style="color:#ff0000">' + message + '</span>';
                    res.redirect('/client/account-form');
                } else {
                    req.session.message = '<span style="color:#0000ff">' + app.i18n.__("Modification effectuée avec succès") + '</span>';
                    res.redirect('/client/account-form');
                }
            });
        } else {
            res.redirect('/client');
        }
    });

    app.post('/client/update/picture', app.multipart, function (req, res) {
        if (req.session.client) {

            var temp = req.files.image.path;

            if (app.fs.existsSync(temp) === false) {
                console.log("file does not exists");
                res.contentType('json');
                res.send(null);
            } else {

                app.fs.readFile(temp, function (err, data) {
                    var imageName = req.files.image.name;

                    /// If there's an error
                    if (!imageName || err) {

                        console.log("There was an error");
                        console.log(imageName);
                        console.log(err);
                        res.redirect("/client/account-form");
                        res.end();

                    } else {
                        var path = app.config.path + "public/client/image/" + req.session.client._id + '/';
                        var filename = app.sha1(temp) + '.jpg';

                        app.fs.mkdir(path, function (err) {

                            if (err && err.code !== 'EEXIST') {
                                console.dir(err);
                            }

                            var newfile = path + filename;
                            var thumb = path + "thumb_" + filename;

                            // resize and remove EXIF profile data
                            app.gm(temp)
                                    .resize(640, 480)
                                    .autoOrient()
                                    .noProfile()
                                    .quality(50)
                                    .write(newfile, function (err) {
                                        if (err) {
                                            console.log("erreur .write()");
                                            console.dir(err);
                                            //res.contentType('json');
                                            res.send(null);
                                        } else {
                                            app.gm(temp)
                                                    .resize(128, 96)
                                                    .autoOrient()
                                                    .noProfile()
                                                    .quality(50)
                                                    .write(thumb, function (err) {

                                                        if (err) {
                                                            console.dir(err);
                                                        } else {
                                                            app.client.pictureUpload(req, res, app, {
                                                                number: req.body.number,
                                                                filename: filename
                                                            });
                                                        }
                                                    });
                                        }
                                    });
                        });
                    }
                });
            }
        } else {
            //res.redirect('/home');
            //res.contentType('json');
            res.send(null);
        }
    });

    app.get('/client/invoice-form', function (req, res) {
        if (req.session.client) {
            res.render('client/masterpage_client.twig', {
                        template: "client/invoice/index.twig", client: req.session.client, reservations: null, url:app.config.url});
            
            /*app.client.getInvoices(req, res, app, function (data) {
                if (!data) {
                    res.redirect('/client');
                } else {
                    res.render('masterpage_client.twig', {
                        template: "invoice/index.twig", client: req.session.client, reservations: data});
                    res.end();
                }
            });*/
        } else {
            res.redirect('/client');
        }
        
    });

    app.post('/client/subscribe', function (req, res) {
        if (req.session.client && req.session.client.to_subscribe) {
            app.client.insert(req, res, app, function (result) {

                if (req.session.client) {
                    delete req.session.client;
                }
                res.send(result);
                res.end();
            });
        } else {
            res.redirect('/client');
        }
    });
    
    /* auto inscription */
    app.post('/client/auto-subscribe', function (req, res) {
        if (!req.session.client) {
            app.client.insertNew(req, res, app, function (result) {                
                if(result){
                    var credentials = {email: req.body.email, password: req.body.password};
                    
                    app.client.loginSubscription(req, res, app, "client", credentials, function (data) {                        
                        if(data){
                            res.redirect('/client');
                        } else {
                            res.redirect('/client/auto-subscribe-failed');
                        }
                    });
                }
            });
        } else {
            res.redirect('/client');
        }
    });
    
    app.get('/client/auto-subscribe-failed', function (req, res) {
        res.render('client/masterpage_client.twig', {template: "client/subscribe/add-failed.twig", url:app.config.url});
    });

    //restaurantRoutes(app);
    //pubRoutes(app);
    //hotelRoutes(app);
};