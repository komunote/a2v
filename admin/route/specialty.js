module.exports = function(app) {

    app.get('/admin/specialty', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.search(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });


    app.post('/admin/specialty/add', function(req, res) {
        //if ((app.config.url + "/admin/specialty") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.insert(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/specialty/add/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.search(req, res, app, {failed:app.i18n.__("L'ajout a échoué")});
            
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/specialty/add/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.search(req, res, app, {success:app.i18n.__("Ajout réussi")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/specialty/add-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/specialty/update/:id([0-9a-f]{24})', function(req, res) {

        //if ((app.config.url + "/admin/specialty") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.post('/admin/specialty/update', function(req, res) {

        //if ((app.config.url + "/admin/specialty") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/specialty/update/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.search(req, res, app, {failed:app.i18n.__("La modification a échoué")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/specialty/update-failed.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/specialty/update/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.specialty.search(req, res, app, {success:app.i18n.__("Modification réussie")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/specialty/update-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });
};