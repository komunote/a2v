module.exports = function(app) {    
    app.get('/admin/moderate', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {

            res.render('masterpage_admin.twig', {
                template: "moderate/index.twig",
                admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });
        
    app.get('/admin/moderate/photo/:type', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {
            app.moderate.search(req, res, app,  app.xss(req.params.type)/*, app.xss(req.params.number)*/);
        } else {
            res.redirect('/admin');
        }
    });
    
    /* ajax call */
    app.post('/admin/moderate/photo/validate', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.moderate.photoValidate(req, res, app);
        } else {
            res.redirect('/admin/moderate');
        }
    });
    
    /* ajax call */
    app.post('/admin/moderate/photo/cancel', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.moderate.photoCancel(req, res, app);
        } else {
            res.redirect('/admin/moderate');
        }
    });
};