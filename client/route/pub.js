module.exports = function (app) {
    /* validate qr_code*/
    app.get('/qr/:user_id([0-9a-f]{24})/:prospect_id([0-9a-f]{24})', function (req, res) {
        if (req.session.client) {

            if (req.session.client._id === req.params.prospect_id) {
                app.client.validateQrCode(req, res, app, function (data) {
                    if (!data) {
                        res.render('masterpage_client.twig', {template: "qrCode/validation-failed.twig", client: req.session.client});
                        res.end();
                    } else {
                        res.render('masterpage_client.twig', {template: "qrCode/validation-success.twig", client: req.session.client});
                        res.end();
                    }
                });
            } else {
                res.render('masterpage_client.twig', {template: "qrCode/validation-failed.twig", client: req.session.client});
                res.end();
            }
        } else {
            res.redirect('/client');
        }
    });

    app.get('/client/qrCode-form', function (req, res) {
        if (req.session.client) {
            app.client.getQrCodes(req, res, app, function (data) {
                if (!data) {
                    res.redirect('/client');
                } else {
                    res.render('masterpage_client.twig', {
                        template: "qrCode/index.twig", client: req.session.client, qrCodes: data});
                    res.end();
                }
            });
        } else {
            res.redirect('/client');
        }
    });
};