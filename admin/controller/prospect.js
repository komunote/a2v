exports.form = function (req, res, app) {

    this.count(req, res, app, function (results) {

        var count = results;
        //var category = require('../../controller/admin/category');

        //app.category.getAll(req, res, app, function (results) {

        //var categories = results;
        //var specialty = require('../../controller/admin/specialty');

        //app.specialty.getAll(req, res, app, function (results) {
        res.render('admin/masterpage_admin.twig', {
            template: "admin/prospect/add-form.twig",
            admin: req.session.admin,
            //categories: categories,
            //specialties: results,
            count: count, url: app.config.url
        });
        //});
        //});

    });
};

exports.count = function (req, res, app, callback) {

    app.db.collection('prospect').count(function (err, count) {
        callback(count);
    });
};

exports.get = function (req, res, app, id) {

    var collection = app.db.collection('prospect');
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function (err, doc) {

        //var category = require('../../controller/admin/category');
        //app.category.getAll(req, res, app, function (results) {

        //var categories = results;
        //var specialty = require('../../controller/admin/specialty');

        //app.specialty.getAll(req, res, app, function (results) {
        res.render('admin/masterpage_admin.twig', {
            template: "admin/prospect/update-form.twig",
            admin: req.session.admin,
            prospect: doc, url: app.config.url
                    //categories: categories,
                    //specialties: results
        });
        //});
        //});
    });

    /*collection.findOne({_id: o_id}, function(err, doc) {
     res.render('masterpage_admin.twig', {
     template: "prospect/update-form.twig",
     prospect: doc,
     admin: req.session.admin
     });
     });*/
};

exports.search = function (req, res, app) {
    var oData = [];

    if (req.body.category != "")
        oData.push({category: req.body.category});
    if (req.body.company != "")
        oData.push({company: new RegExp(req.body.company, 'i')});
    if (req.body.city != "")
        oData.push({city: new RegExp(req.body.city, 'i')});
    if (req.body.postalcode != "")
        oData.push({postalcode: new RegExp(req.body.postalcode, 'i')});
    if (req.body.interested != "")
        oData.push({interested: req.body.interested});
    if (req.body.email_sent != "")
        oData.push({email_sent: parseInt(req.body.email_sent)});
    if (req.body.admin_creation) {
        if (req.body.admin_creation === "admin")
            oData.push({admin_creation: null});
        else
            oData.push({admin_creation: req.body.admin_creation});
    }
    //if (req.body.tobecontacted != "")
    //oData.push({tobecontacted: req.body.tobecontacted});
    if (req.body.email_subscription_sent != "") {
        if (parseInt(req.body.email_subscription_sent) > 0) {
            oData.push({email_subscription_sent: parseInt(req.body.email_subscription_sent)});
        } else {
            oData.push({email_subscription_sent: null});
        }
    }


    if (req.body.comment != "")
        oData.push({comment: new RegExp(req.body.comment, 'i')});
    //console.dir(oData);

    var collection = app.db.collection('prospect');

    collection.count({$and: oData}, function (error, count) {

        if (error) {
            console.log(error);
            res.render('admin/masterpage_admin.twig', {template: "admin/prospect/search-results.twig", admin: req.session.admin, result: null, count: 0, url: app.config.url});
        } else {
            collection.find({$and: oData
            }).sort({company: 1}).limit(400).toArray(function (err, results) {

                if (results.length === 0) {
                    console.dir('recherche ko');
                    res.redirect('/admin/prospect/search');
                } else {
                    for (var i in results) {
                        if (results[i].password) {
                            results[i].url = "https://www.autour2vous.com/client/subscription/" + app.Base64.encode(results[i].email) + "/" + app.Base64.encode(results[i].password);
                        }
                    }

                    console.dir('recherche ok');
                    res.render('admin/masterpage_admin.twig', {
                        template: "admin/prospect/search-results.twig",
                        admin: req.session.admin,
                        result: results,
                        count: count, url: app.config.url
                    });
                }
            });
        }
    });



};

exports.insert = function (req, res, app, callback) {

    var collection = app.db.collection('prospect');
    var date = new Date().toJSON();
    var prospect = {
        category: req.body.category,
        company: app.xss(req.body.company),
        email: app.xss(req.body.email),
        phone: app.xss(req.body.phone),
        contact: app.xss(req.body.contact),
        website: app.xss(req.body.website),
        address: req.body.address,
        city: req.body.city,
        postalcode: req.body.postalcode,
        department: req.body.department,
        deptnumber: req.body.deptnumber,
        state: req.body.state,
        country: req.body.country,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        //contract: req.body.contract,
        //product: req.body.product,        
        //specialty: req.body.specialty,
        //note: req.body.note,
        //tobecontacteddate: app.xss(req.body.tobecontacteddate),
        //tobecontacted: req.body.tobecontacted,
        //sendemail: req.body.sendemail,
        interested: req.body.interested,
        comment: app.xss(req.body.comment),
        //types: req.body.types,
        //reviews: req.body.reviews,
        date_creation: date,
        date_update: date,
        qr_codes: null,
        reservations: null,
        email_sent: 0,
        admin_creation: req.session.admin.login
    };

    collection.insert(prospect, function (err, doc) {

        if (err) {
            console.log(err);
            return callback(false);
        } else {
            if (doc === null || doc.length === 0) {
                return callback(false);
            } else {
                //return callback(true);
                app.prospect.generatePassword(req, res, app, function (data) {
                    if (data !== null) {
                        //return callback(true);
                        
                        app.prospect.sendSubscription(req, res, app, prospect.email, function (_data) {
                            if (_data) {
                                return callback(true);
                            } else {
                                console.log('sendSubscription failed');
                                return callback(false);
                            }
                        });
                    } else {
                        return callback(false);
                    }

                });
            }
        }
    });
};

exports.sendSubscription = function (req, res, app, email, callback) {
    var collection = app.db.collection('prospect');

    collection.findOne({email: new RegExp(email, 'i')}, function (err, prospect) {
        if (err) {
            console.log("Error : " + err);
            return callback(null);
        } else {
            if (prospect) {
                if (!prospect.password) {
                    //return res.send(null);
                    return callback(null);
                }
                var url = "https://www.autour2vous.com/client/subscription/" + app.Base64.encode(prospect.email) + '/' + app.Base64.encode(prospect.password);

                app.transporter.sendMail({
                    from: "Votre partenaire autour2vous <contact@autour2vous.com>",
                    //to: "contact@n2m2.fr", //prospect.email,
                    to: prospect.email,
                    //cc: "contact@autour2vous.com",
                    subject: "votre demande d'inscription",
                    text: "Cher restaurant " + prospect.company + "," +
                            "\n\nNous vous remercions pour votre demande d'inscription." +
                            "\n\nVos identifiants (à conserver précieusement) concernant la section CLIENT :" +
                            "\nEmail : " + prospect.email +
                            "\nMot de passe : " + prospect.password +
                            "\n\nCliquez sur le lien pour vous procéder à l'inscription : " + url + " \n" +
                            "\n\nAmicalement,\n" +
                            "Votre partenaire autour2vous\n" +
                            'Tél : 06 18 99 61 66\n' +
                            'Tél : 07 88 50 41 57\n' +
                            'Du lundi au samedi, de 9h30 à 20h00 non stop\n' +
                            '\nwww.autour2vous.com/' + prospect.email + '/',
                    html:
                            '<div style="width:100%; font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#fff; background-color:#000;">' +
                            '<div style="background-color:#000"><p><a href="http://www.autour2vous.com" style="text-decoration: none; color:#f62459;font-size: 2em;"><span>autour<span style="color:#ffffff">2</span>vous</span><span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé ! </span><div><img style="width:100%;" src="https://www.autour2vous.com/static/image/bandeau_email.jpg" /></div></a></p></div>' +
                            '<div style="text-align:center;"><p>Cher restaurant <b>' + prospect.company + '</b>,</p><br />' +
                            "<p>C'est avec enthousiame que nous vous annonçons la sortie de la nouvelle plateforme à dimension humaine.</p><br />" +
                            '<fieldset style="display: inline;background-color: #fff; color:#000; padding: 20px 5px 20px 5px;margin: 20px 5px 20px 5px;border: 2px dotted #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">' +
                            '<legend style="padding: 5px;color: #fff;background-color: #f62459; color:#fff; width: 100%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">Concept</legend>' +
                            '<p style="color:#f62459;">' +
                            '<span style="text-decoration: none; color:#f62459;font-size: 1em;"><span>autour<span style="color:#000">2</span>vous</span></span> prend en compte vos besoins :' +
                            '</p>' +
                            '<p>A partir 0,50 € par réservation le midi et 1 € le soir</p>' +
                            '<p>Inscription basée sur la sélection</p><br />' +
                            '<p><b>Reprenez le POUVOIR</b> :</p><br />' +
                            '<style>li{padding-bottom: 20px;}</style>' +
                            '<ul style="text-align: left; list-style: disc;">' +
                            '<li style="color:#F62459"><b>Offre : </b>Pour les 500 premiers, inscription à vie garantie, aucun abonnement annuel ne vous sera facturé !</li>' +
                            '<li><b>Clarté : </b>payez à la réservation</li>' +
                            '<li><b>Egalité : </b>compte premium pour tous</li>' +
                            '<li><b>Efficacité : </b>modification en temps réel et à volonté de votre fiche</li>' +
                            '<li><b>Simplicité : </b>une interface ergonomique et accessible à tous et toutes sur PC, tablettes et mobiles</li>' +
                            '<li><b>Autonomie : </b>mettez en avant votre établissement autour2vous et restez maître de votre activité</li>' +
                            '<li><b>Solidarité : </b>0,10 € reversé par réservation à l\'association La Mie de Pain</li>' +
                            '</ul>' +
                            '</fieldset>' +
                            '<fieldset style="display: inline;background-color: #fff; color:#000; padding: 20px 5px 20px 5px;margin: 20px 5px 20px 5px;border: 2px dotted #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">' +
                            '<legend style="padding: 5px;color: #fff;background-color: #333;width: 100%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">Inscription</legend>' +
                            '<p>Vos identifiants (à conserver précieusement) concernant la section CLIENT :</p>' +
                            '<p>Email : <span style="color:#F62459">' + prospect.email + '</span></p>' +
                            '<p>Mot de passe : <span style="color:#F62459">' + prospect.password + '</p><br />' +
                            '<p><a href="' + url + '">Cliquez ici pour procéder à l\'inscription</a></p>' +
                            '</fieldset>' +
                            '<br/>' +
                            '<p>Amicalement,</p>' +
                            '<div>' +
                            '<p><i>Votre partenaire</i> <a href="https://www.autour2vous.com" style="text-decoration: none; color:#f62459;font-size: 1em;"><span>autour<span style="color:#ffffff">2</span>vous</span></a></p>' +
                            '<p><i>Tél : 06 18 99 61 66<i></p>' +
                            '<p><i>Tél : 07 88 50 41 57<i></p>' +
                            '<p><b>Du lundi au samedi, de 9h30 à 20h00 non stop</b></p>' +
                            '</div></div></div>'
                }, function (error, info) {
                    if (error) {
                        console.log(error);
                        console.log("error on _id:", prospect._id, ', email:', prospect.email);
                        return callback(false);
                    } else {
                        console.log('Message sent: ' + info.response);
                        collection.update({email: new RegExp(prospect.email, 'i')},
                        {$set: {email_subscription_sent: 1, email_subscription_sent_date: new Date().toJSON()}}, {multi: true}, function (err, doc) {
                            if (err) {
                                console.log(err);
                                return callback(false);
                            } else {
                                console.log("update email_sent:ok, ", prospect._id);
                                return callback(true);
                            }
                        });

                    }
                });

            } else {
                console.log("sendSubscription : Prospect is null");
                return callback(null);
            }
        }
    });
};

exports.update = function (req, res, app) {

    // si le prospect appartient à quelqu'un mais qu'il ne s'agit pas de l'admin ou d'antho, on interdit la modificaiton
    if (req.body.admin_creation && req.body.admin_creation !== "admin") {

        if (req.body.admin_creation !== req.session.admin.login &&
                req.session.admin.status > 2) {
            return res.redirect('/admin/prospect/update/failed');
        }
    }

    var collection = app.db.collection('prospect');
    var date = new Date().toJSON();
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    collection.update({_id: o_id},
    {$set: {
            company: app.xss(req.body.company),
            email: app.xss(req.body.email),
            phone: app.xss(req.body.phone),
            contact: app.xss(req.body.contact),
            website: app.xss(req.body.website),
            contract: req.body.contract,
            old_address: app.xss(req.body.address),
            address: app.xss(req.body.address),
            city: app.xss(req.body.city),
            postalcode: app.xss(req.body.postalcode),
            product: req.body.product,
            category: req.body.category,
            specialty: req.body.specialty,
            note: req.body.note,
            tobecontacteddate: app.xss(req.body.tobecontacteddate),
            email_subscription_sent: parseInt(req.body.email_subscription_sent),
            tobecontacted: req.body.tobecontacted,
            sendemail: req.body.sendemail,
            interested: req.body.interested,
            comment: app.xss(req.body.comment),
            email_sent: 0,
            date_update: date,
            admin_update: req.session.admin.login
        }}, function (err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/prospect/update/failed');
        } else {
            res.redirect('/admin/prospect/update/success');
        }
    });
};

exports.searchNearby = function (req, res, app) {

    var collection = app.db.collection('prospect');
    collection.find({
        coordinates: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: req.session.admin.coordinates
                },
                $maxDistance: parseInt(req.body.range)
            }
        }
    }).toArray(function (err, results) {

        if (results === null || results.length === 0) {
            console.dir('recherche ko');
            console.dir(err);
            res.redirect('/admin/prospect/search');
        } else {
            //console.dir('recherche ok');

            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/search-results.twig",
                admin: req.session.admin,
                result: results, url: app.config.url
            });
        }
    });
};

exports.insertFromCSV = function (req, res, app, data) {

    //var collection = app.db.collection('prospect_tmp');
    var collection = app.db.collection('prospect');

    collection.insert(data, {continueOnError: true, safe: true}, function (err, doc) {

        if (!err) {
            console.log('pas d\'erreur');

            if (doc === null || doc.length === 0) {
                console.log('nothing');
                res.send(0);
                res.end();
            } else {
                console.dir('ok');
                res.send(1);
                res.end();
            }
        } else {
            console.log(err);
        }
    });
};

exports.getProspectWithNoCoordinates = function (req, res, app) {

    var collection = app.db.collection('prospect');
    collection.find({
        coordinates: [0, 0]
    }).limit(1).toArray(function (err, results) {

        if (!err) {
            if (results === null || results.length === 0) {
                console.dir('recherche ko');
                res.send(null);
            } else {
                console.dir('recherche ok');
                res.send(results);
            }
        } else {
            console.log(err);
            res.send(null);
        }
    });
};

exports.updateGeolocation = function (req, res, app) {

    var collection = app.db.collection('prospect');
    var date = new Date().toJSON();
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    var prospect = req.body.prospect;
    prospect.longitude = parseFloat(req.body.prospect.longitude);
    prospect.latitude = parseFloat(req.body.prospect.latitude);
    prospect.coordinates = [prospect.longitude, prospect.latitude];
    prospect.date_update = date;

    /*console.log(prospect);
     res.send(null);*/

    collection.update({_id: o_id},
    {$set: prospect}, function (err, doc) {

        if (err) {
            console.log(err);
            res.send(null);
            res.end();
        } else {
            if (doc === null || doc.length === 0) {
                console.log(req.body);
                res.send(null);
                res.end();
            } else {
                console.log(prospect);
                res.send(true);
                res.end();
            }
        }
    });
};

exports.sanitizeProspectCity = function (req, res, app) {

    var collection = app.db.collection('prospect');
    var pattern = /\(Les\)/;
    collection.find({city: pattern}).each(function (err, prospect) {

        var ex = prospect.city.toString().split(pattern);
        collection.update({_id: prospect._id}, {$set: {city: ex[0]}}, function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                console.log(prospect.email, prospect._id, prospect.city, ex[0]);
            }
        });

        res.send(true);
        res.end();
    });
};

exports.checkDuplicatedAddress = function (req, res, app) {

    var collection = app.db.collection('prospect');

    collection.find({}).sort({email: 1}).toArray(function (err, prospects) {
        console.log(prospects.length);
        var lastAddress = '';
        var lastEmail = '';
        var lastCategory = '';
        var count = 0;
        var log = [];
        for (var i in prospects) {
            if (lastAddress === prospects[i].address && lastEmail === prospects[i].email && lastCategory === prospects[i].category) {

                log.push(prospects[i], prospects[i - 1]);
                count++;
                var prospectToRemove;

                if (prospects[i].dept_number === null) {
                    prospectToRemove = prospects[i];
                } else {
                    prospectToRemove = prospects[i - 1];
                }

                collection.remove({_id: prospectToRemove._id}, function (err, doc) {
                    if (err) {
                        console.log(err);
                    }
                });
            }

            lastAddress = prospects[i].address;
            lastEmail = prospects[i].email;
            lastCategory = prospects[i].category;
        }

        res.send({count: count, result: log});
        res.end();
    });
};

exports.generatePassword = function (req, res, app, callback) {
    var gen = function () {
        var source = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
        return source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60));
    };

    var collection = app.db.collection('prospect');

    collection.find({password: undefined}).each(function (err, prospect) {
        if (err) {
            console.log(err);
            return callback(null);
        } else {
            if (prospect) {
                collection.update({_id: prospect._id}, {$set: {password: gen()}}, function (err, doc) {
                    if (err) {
                        console.log(err);                        
                        return callback(null);
                    } 
                });
            } else {
                return callback(true);
            }
        }
    });    
};