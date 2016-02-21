module.exports = function(app) {
    app.get('/admin/category', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.search(req, res, app);
        } else {
            res.redirect('/admin');
        }

    });

    app.post('/admin/category/add', function(req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.insert(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/category/add/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.search(req, res, app, {failed:app.i18n.__("L'ajout a échoué")});            
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/category/add/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.search(req, res, app, {success:app.i18n.__("Ajout réussi")});            
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/category/update/:id([0-9a-f]{24})', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/category/update', function(req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/category/update/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {            
            app.category.search(req, res, app, {failed:app.i18n.__("La modification a échoué")});            
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/category/update/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {                   
            app.category.search(req, res, app, {success:app.i18n.__("Modification réussie")});            
        } else {
            res.redirect('/admin');
        }
    });
};