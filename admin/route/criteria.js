module.exports = function(app, db) {
    app.get('/admin/criteria', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');
            app.criteria.search(req, res, app);
        } else {
            res.redirect('/admin');
        }

    });

    app.post('/admin/criteria/add', function(req, res) {

        //if ((app.config.url + "/admin/criteria") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');
            app.criteria.insert(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/criteria/add/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');  
            app.criteria.search(req, res, app, {failed:app.i18n.__("L'ajout a échoué")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/criteria/add-failed.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/criteria/add/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');            
            app.criteria.search(req, res, app, {success:app.i18n.__("Ajout réussi")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/criteria/add-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/criteria/update/:id([0-9a-f]{24})', function(req, res) {

        //if ((app.config.url + "/admin/criteria") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');
            app.criteria.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.post('/admin/criteria/update', function(req, res) {

        //if ((app.config.url + "/admin/criteria") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');
            app.criteria.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/criteria/update/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');
            app.criteria.search(req, res, app, {failed:app.i18n.__("La modification a échoué")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/criteria/update-failed.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/criteria/update/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            //var criteria = require('../../controller/admin/criteria');
            app.criteria.search(req, res, app, {success:app.i18n.__("Modification réussie")});
            //res.render('admin/masterpage_admin.twig', {template: "admin/criteria/update-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

};