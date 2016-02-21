module.exports = function (app) {   
    var prospectRoutes = require('../route/prospect');
    var clientRoutes = require('../route/client');
   
    app.get('/admin', function (req, res) {
        if (req.session.admin) {
            res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", admin: req.session.admin, url:app.config.url});
        } else {
            res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", url:app.config.url});
        }
    });

    app.route('/admin/email')
            .get(function (req, res) {
                if (typeof (req.session.admin) !== 'undefined') {
                    res.render('admin/masterpage_admin.twig', {template: "admin/email-form.twig", admin: req.session.admin, url:app.config.url});
                } else {
                    res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", url:app.config.url});
                }
            })
            .post(function (req, res) {
                if (req.session.admin) {
                    
                    var message="";
            
                    for(var i in req.body.message){
                        if(req.body.message[i]){
                            if(!req.body.message[i]) continue;
                            message +='<fieldset style="display: inline;background-color: #fff; color:#000; padding: 20px 5px 20px 5px;margin: 20px 5px 20px 5px;border: 2px dotted #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">' +
                                        '<legend style="padding: 5px;color: #fff;background-color: #f62459; color:#fff; width: 100%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;text-align:center;">' + 
                                            (req.body.title[i] ? app.xss(req.body.title[i]) : '&nbsp;')+
                                        '</legend>' +
                                    '<div>' + (req.body.message[i] ? app.xss(req.body.message[i]) : '&nbsp;')+ '</div>' +
                                '</fieldset><br />';
                        }
                    }
                    
                    app.transporter.sendMail({
                        from: "Votre partenaire autour2vous <contact@autour2vous.com>",
                        to: app.xss(req.body.to), //"contact@n2m2.fr",
                        cc:"contact@autour2vous.com",
                        subject: app.xss(req.body.subject),
                        text: app.xss(req.body.message) + '\n\nwww.autour2vous.com',
                        html:
                                '<div style="width:100%; font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#fff; background-color:#000;">' +
                                '<div style="background-color:#000">'+
                                    '<p><a href="http://www.autour2vous.com" style="text-decoration: none; color:#f62459;font-size: 2em;"><span>autour<span style="color:#ffffff">2</span>vous</span><span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé ! </span>'+
                                    '<div><img style="width:100%;" src="http://www.autour2vous.com/static/image/bandeau_email.jpg" /></div></a></p>'+
                                '</div><br />' +
                                '<p><b>'+app.xss(req.body.contact) +'</b>,</p><br />'+
                                message+
                                '<p>Amicalement,</p>' +
                                '<div style="font-size:1em;">' +
                                '<p><i>Votre partenaire</i> <a href="http://www.autour2vous.com" style="text-decoration: none; color:#f62459;font-size: 1em;"><span>autour<span style="color:#ffffff">2</span>vous</span></a></p><br />' +
                                '<p><i>'+app.xss(req.body.sender_name)+'<i>,</p>' +
                                '<p><i>'+app.xss(req.body.sender_function)+'<i></p>' +
                                '<p><i>Tél : '+app.xss(req.body.sender_phone)+'<i></p>' +                                
                                '<p><b>Du lundi au samedi, de 9h30 à 20h00 non stop</b></p>'+
                                '</div></div>'
                    }, function (error, info) {
                        if (error) {
                            console.log(error);
                            res.render('admin/masterpage_admin.twig', {template: "admin/email-form.twig", admin: req.session.admin, result: 'ko', url:app.config.url});
                        } else {
                            console.log('Message sent: ' + info.response);
                            res.render('admin/masterpage_admin.twig', {template: "admin/email-form.twig", admin: req.session.admin, result: 'ok', url:app.config.url});
                        }
                    });

                } else {
                    res.render('masterpage_admin.twig', {template: "admin/admin.twig", url:app.config.url});
                }
            });

    app.get('/admin/nomenclature', function (req, res) {

        if (req.session.admin) {

            res.render('admin/masterpage_admin.twig', {
                template: "admin/nomenclature.twig",
                admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.route('/admin/login')
            .get(function (req, res) {                
                res.render('admin/masterpage_admin.twig', {template: "admin/login-form.twig", url:app.config.url});                                
            })
            .post(function (req, res) {
                if ((app.config.url + "/admin/login") === req.headers['referer'] ||
                        (app.config.url + "/admin") === req.headers['referer']) {
                    //var admin = require('../controller/admin');
                    app.admin.login(req, res, app);
                } else {
                    res.redirect("/admin");
                }
            });

    app.get('/admin/logout', function (req, res) {
        req.session.admin = undefined;
        //req.session.regenerate();        
        res.redirect('/admin');
    });

    /* ajax call */
    app.post('/admin/update-location', function (req, res) {

        if (req.session.admin) {
            console.log('ok');
            req.session.admin.location = req.body.location;
            req.session.admin.coordinates = [parseFloat(req.body.location.longitude), parseFloat(req.body.location.latitude)];
            console.dir(req.session.admin);
        }
    });

    // validation du qr code
    app.get('/qr/:user_id/:prospect_id', function (req, res) {
        if (req.session.admin) {
            var user_id = app.Base64.decode(req.params.user_id);
            var prospect_id = app.Base64.decode(req.params.user_id);

            res.send(user_id + '-' + prospect_id);

        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/stat', function (req, res) {
        if (req.session.admin) {
            app.admin.getStat(req, res, app, function (stat) {
                res.render('admin/masterpage_admin.twig', {template: "admin/stat.twig", admin: req.session.admin, stat: stat, url:app.config.url});
            });
        } else {
            res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", url:app.config.url});
        }
    });

    prospectRoutes(app);
    clientRoutes(app);    
};