module.exports = function (app) {
    app.get('/admin/client', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/client/index.twig",
                admin: req.session.admin, 
                url:app.config.url
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.route('/admin/client/search')
            .get(function (req, res) {
                if (typeof (req.session.admin) !== 'undefined') {
                    res.render('admin/masterpage_admin.twig', {
                        template: "admin/client/search-form.twig",
                        admin: req.session.admin, 
                        url:app.config.url                        
                    });
                } else {
                    res.redirect('/admin');
                }
            })
            .post(function (req, res) {
                //if ((app.config.url + "/admin/client/search") === req.headers['referer']) {
                if (typeof (req.session.admin) !== 'undefined') {
                    
                    app.admin_client.search(req, res, app);
                } else {
                    res.redirect('/admin');
                }
                /*} else {
                 res.redirect('/admin');
                 }*/
            });
    
    app.get('/admin/client/update/:id([0-9a-f]{24})', function (req, res) {

        //if ((app.config.url + "/admin/specialty") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.admin_client.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.post('/admin/client/update', function (req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.admin_client.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/client/update/failed', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/client/update-failed.twig", admin: req.session.admin, url:app.config.url});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/client/update/success', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/client/update-success.twig", admin: req.session.admin, url:app.config.url});
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/client/search-nearby', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.admin_client.searchNearby(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });   
};