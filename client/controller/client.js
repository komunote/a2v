exports.login = function (req, res, app, document, callback) {

    var collection = app.db.collection(document);

    collection.findOne({
        //email: new RegExp(app.xss(app.Base64.decode(req.body.email))),
        email: new RegExp(app.xss(req.body.email)),
        password: app.xss(req.body.password)
    }, function (err, client) {

        if (err) {
            console.log(err);
            return callback(null);
        }

        if (client === null) {
            console.dir('login ko');
            console.log(18);
            req.session.client = undefined;
            return callback(null);
        } else {
            console.dir('login ok');
            req.session.client = client;
            return callback(true);
        }
    });
};

exports.loginSubscription = function (req, res, app, document, credentials, callback) {

    var collection = app.db.collection(document);

    collection.findOne({
        email: new RegExp(app.xss(credentials.email)),
        password: app.xss(credentials.password)
    }, function (err, client) {

        if (err) {
            console.log(err);
            return callback(null);
        }
        if (client === null) {
            console.dir('login ko');
            console.log(44);
            req.session.client = undefined;
            return callback(null);
        } else {
            console.dir('login ok');
            req.session.client = client;
            return callback(true);
        }
    });

};

exports.get = function (req, res, app, callback) {

    var collection = app.db.collection('client');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.client._id);

    collection.findOne({_id: o_id}, function (err, doc) {
        if (err) {
            console.log(err);
            return callback(null);
        }

        var weekday = [app.i18n.__('Lundi'), app.i18n.__('Mardi'), app.i18n.__('Mercredi'), app.i18n.__('Jeudi'),
            app.i18n.__('Vendredi'), app.i18n.__('Samedi'), app.i18n.__('Dimanche')
        ];

        doc.privilege_out_of_date = true;

        return callback(doc, weekday);
    });
};

exports.insert = function (req, res, app, callback) {

//return callback(true);

    var collection = app.db.collection('client');
    var date = new Date().toJSON();

    var iban = null;

    //if (req.body.iban) {
    iban = app.client.checkIban(app.xss(req.body.iban));
    if (!iban) {
        console.log('IBAN incorrect');
        console.log(iban);
        return callback(false);
    }
    //}

    var client = {
        category: parseInt(req.body.category), // 1=Restaurant, 2=Pub, 3=Hôtel, 4=Spa
        company: app.xss(req.body.company),
        siret: app.xss(req.body.siret),
        ape: app.xss(req.body.ape),
        email: app.xss(req.body.email),
        phone: app.xss(req.body.phone),
        password: req.session.client.password,
        coordinates: req.session.client.coordinates,
        address: app.xss(req.body.address),
        postalcode: app.xss(req.body.postalcode),
        city: app.xss(req.body.city),
        contact: {
            name: app.xss(req.body.contact.name),
            function: app.xss(req.body.contact.function),
            phone: app.xss(req.body.contact.phone)
        },
        iban: iban ? iban : '',
        bic: app.xss(req.body.bic),
        sepa: null,
        rum: null,
        date_creation: date,
        status: 0, // -1= suspendu/supprimé, 0=en_cours, 1=validé        
        prospect_id: req.session.client._id,
        signature: req.body.signature,
        // qui a créé ce client/prospect
        admin_creation: req.body.admin_creation === "admin" || !req.body.admin_creation ? null : req.body.admin_creation
    };

    client.registration = {};

    client.registration.payment_mode = 0; // prélèvement

    switch (parseInt(req.body.registration.mode)) {
        case 7 : // Privilège
            client.registration.mode = 7;
            client.is_privilege = 1;
            client.registration.fee = 200;
            client.registration.yearly = false;
            break;
        case 1 : // Economique
            client.registration.mode = 1;
            client.registration.fee = 100;
            client.registration.yearly = true;
            break;
            /*case 2 :            
             client.registration.fee = 200;
             client.registration.annual = 1; break;*/
        default: // Gratuite
            client.registration.mode = 0;
            client.registration.fee = 0;
            client.registration.yearly = false;
    }

    // formation
    if (req.body.registration.training) {
        client.registration.training = 100;
    } else {
        client.registration.training = 0;
    }

    client.registration.ip = req.header('x-forwarded-for') || req.ip;

    if (!req.body.longitude || !req.body.latitude) {
        console.log('Position géographique incorrecte');
        return callback(false);
    }

    client.registration.coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];

    collection.insert(client, function (err, doc) {
        if (err) {
            console.log('Error client creation:');
            console.log(err);
            return callback(false);
        } else {
            if (doc === null || doc.length === 0) {
                return callback(false);
            } else {
                                
                app.transporter.sendMail({
                    from: "L'équipe autour2vous <ne_pas_repondre@autour2vous.com>",
                    //to: "contact@autour2vous.com",
                    to: client.email,
                    cc: "contact@autour2vous.com",
                    subject: "inscription autour2vous validée",
                    text: "Cher " + client.company + ",\nVotre inscription a été validée. Merci de retourner le formulaire de prélèvement SEPA rempli et signé à l'adresse suivante : \n" +
                            "autour2vous SAS, \nMas Granier, chemin des Lauriers \n13150 Tarascon\n " +
                            "https://www.autour2vous.com/client\n\n" +
                            "L'équipe autour2vous",
                    html:
                            '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                            '<div style="background-color:#000000">' +
                            '<p align="center">' +
                            '<a href="https://www.autour2vous.com/client" style="text-decoration: none; color:#F62459;font-size: 2em;">' +
                            '<span>autour<span style="color:#ffffff">2</span>vous</span>' +
                            '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé</span>' +
                            '<div><img style="width:100%;" src="https://www.autour2vous.com/static/image/bandeau_email.jpg" /></div>' +
                            '</a>' +
                            '</p></div>' +
                            '<p align="center">Cher <b>' + client.company + '</b>,</p><br />' +
                            '<p align="center">Votre inscription a été validée. Merci de retourner le formulaire de prélèvement SEPA rempli et signé à l\'adresse suivante :</p>' +
                            '<p align="center">autour2vous SAS, <br />Mas Granier, chemin des Lauriers <br />13150 Tarascon' +
                            '<br /></p><br /><br />' +
                            '<p align="center"><a href="https://www.autour2vous.com/client">www.autour2vous.com/client</a></p>' +
                            '<div>' +
                            '<p align="center"><i>L\'équipe autour2vous<i></p></div></div></div>'

                }, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                    return callback(true);
                });

            }
        }
    });
};

exports.insertNew = function (req, res, app, callback) {

//return callback(true);

    var collection = app.db.collection('client');
    var date = new Date().toJSON();

    var client = {
        category: parseInt(req.body.category),
        company: app.xss(req.body.company),
        email: app.xss(req.body.email),
        phone: app.xss(req.body.phone),
        address: app.xss(req.body.address),
        postalcode: app.xss(req.body.postalcode),
        city: app.xss(req.body.city),
        state: app.xss(req.body.state),
        country: app.xss(req.body.country),
        date_creation: date,
        status: 0, // -1= suspendu/supprimé, 0=en_cours, 1=validé                                
        admin_creation: "self"
    };
    client.registration = {};

    client.registration.ip = req.header('x-forwarded-for') || req.ip;

    if (!req.body.longitude || !req.body.latitude) {
        console.log('Position géographique incorrecte');
        return callback(false);
    }

    client.password = app.client.generatePassword();
    client.coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];

    collection.insert(client, function (err, doc) {
        if (err) {
            console.log('Error client creation:');
            console.log(err);
            return callback(false);
        } else {
            if (doc === null || doc.length === 0) {
                return callback(false);
            } else {
                var url = "https://www.autour2vous.com/client/subscription/" + app.Base64.encode(client.email) + '/' + app.Base64.encode(client.password);

                app.transporter.sendMail({
                    from: "L'équipe autour2vous <ne_pas_repondre@autour2vous.com>",
                    //to: "contact@autour2vous.com",
                    to: client.email,
                    cc: "contact@autour2vous.com",
                    subject: "inscription autour2vous validée",
                    text: "Cher " + client.company + ",\nVotre inscription a été validée. Merci de compléter votre fiche en vous connectant à votre compte.\n" +
                            "https://www.autour2vous.com/client\n\n" +
                            "L'équipe autour2vous",
                    html:
                            '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                            '<div style="background-color:#000000">' +
                            '<p align="center">' +
                            '<a href="https://www.autour2vous.com/client" style="text-decoration: none; color:#F62459;font-size: 2em;">' +
                            '<span>autour<span style="color:#ffffff">2</span>vous</span>' +
                            '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé</span>' +
                            '<div><img style="width:100%;" src="https://www.autour2vous.com/static/image/bandeau_email.jpg" /></div>' +
                            '</a>' +
                            '</p></div>' +
                            '<p align="center">Cher <b>' + client.company + '</b>,</p><br />' +
                            '<p align="center">Votre inscription a été validée. Merci de compléter votre fiche en vous connectant à votre compte.</p>' +                            
                            '<br /><br />' +
                            '<fieldset style="display: inline;background-color: #fff; color:#000; padding: 20px 5px 20px 5px;margin: 20px 5px 20px 5px;border: 2px dotted #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">' +
                            '<legend style="padding: 5px;color: #fff;background-color: #333;width: 100%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">Inscription</legend>' +
                            '<p>Vos identifiants (à conserver précieusement) concernant la section CLIENT :</p>' +
                            '<p>Email : <span style="color:#F62459">' + client.email + '</span></p>' +
                            '<p>Mot de passe : <span style="color:#F62459">' + client.password + '</p><br />' +
                            '<p><a href="' + url + '">Cliquez ici pour procéder à l\'inscription</a></p>' +
                            '</fieldset>' +
                            '<p align="center"><a href="https://www.autour2vous.com/client">www.autour2vous.com/client</a></p>' +
                            '<div>' +
                            '<p align="center"><i>L\'équipe autour2vous<i></p></div></div></div>'

                }, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                    return callback(true);
                });

            }
        }
    });
};

exports.update = function (req, res, app, callback) {

    var collection = app.db.collection('client');
    var date = new Date().toJSON();
    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.client._id);

    var client;

    if (req.session.client.category === 1) {
        client = {
            chef: app.xss(req.body.chef),
            dish_day: app.xss(req.body.dish_day),
            menus: app.xss(req.body.menus),
            starts: app.xss(req.body.starts),
            dishes: app.xss(req.body.dishes),
            desserts: app.xss(req.body.desserts),
            drinks: app.xss(req.body.drinks),
            price_min: app.xss(req.body.price_min),
            cooking_type: app.xss(req.body.cooking_type),
            //organic: req.body.organic,
            //home_made: req.body.home_made,
            closing_date: app.xss(req.body.closing_date),
            opening_date: app.xss(req.body.opening_date)
        };
    } else if (req.session.client.category === 2) {
        client = {
            drinks: app.xss(req.body.drinks),
            closing_date: app.xss(req.body.closing_date),
            opening_date: app.xss(req.body.opening_date)
        };
    }
    client.phone = app.xss(req.body.phone);
    client.contact = app.node_xss(req.body.contact);
    client.website = app.xss(req.body.website);
    client.access = app.xss(req.body.access);
    client.payment_mode = req.body.payment_mode;
    client.languages = req.body.languages;
    client.description = app.xss(req.body.description);
    client.reduction = parseInt(req.body.reduction);
    client.condition = parseInt(req.body.condition);
    client.date_update = date;

    client.opening = [];
    for (var i = 0; i < 7; i++) {
        client.opening.push({});
    }

    for (var i in req.body.opening) {
        var x = req.body.opening[i].i;
        client.opening[x] = req.body.opening[i];

        // si le midi c'est fermé
        if (client.opening[x]['noon_start'] == '' || client.opening[x]['noon_end'] == '') {
            delete client.opening[x]['noon_start'];
            delete client.opening[x]['noon_end'];
        }

        // si le soir c'est fermé
        if (client.opening[x]['evening_start'] == '' || client.opening[x]['evening_end'] == '') {
            delete client.opening[x]['evening_start'];
            delete client.opening[x]['evening_end'];
        }
    }

    if (req.body.siret && req.body.ape) {
        client.siret = app.xss(req.body.siret);
        client.ape = app.xss(req.body.ape);
    }

    if (req.body.sepa) {
        client.sepa = req.body.sepa;
    }

    if (req.body.iban) {
        client.iban = app.client.checkIban(app.xss(req.body.iban));
        client.bic = app.xss(req.body.bic);
    }

    if (!client.iban) {
        return callback(false, app.i18n.__("Erreur : IBAN incorrect"));
    }

    if (req.body.sponsorship.company && req.body.sponsorship.email) {
        var sponsor = {};

        sponsor.date = date;
        sponsor.company = app.xss(req.body.sponsorship.company);
        sponsor.email = app.xss(req.body.sponsorship.email);

        if (!client.sponsorship) {
            client.sponsorship = [];
        }
        client.sponsorship.push(sponsor);
    }

    collection.update({_id: o_id},
    {$set: client}, function (err, doc) {

        if (doc === null || doc.length === 0) {
            return callback(false, app.i18n.__("Erreur : La modification n'a pas pu être effectuée"));
        } else {
            return callback(true);
        }
    });
};

exports.pictureUpload = function (req, res, app, data) {

    var collection = app.db.collection('client');

    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.client._id);
    var date = new Date().toJSON();

    var client = {};
    client.date_update = date;

    if (!req.session.client.pictures) {
        client.pictures = {};
    } else {
        client.pictures = req.session.client.pictures;
    }

    client.pictures[data.number] = data;

    collection.update({_id: o_id},
    {$set: client}, function (err, doc) {

        if (err) {
            console.dir(err);
            /*res.contentType('text/html');
             res.send(null);*/
            res.render('client/masterpage_client.twig', {template: "client/update-form.twig", client: doc,
                message: '<span style="color:#ff0000">' + app.i18n.__("Erreur : Image non mise à jour.") + '</span>'});
            delete req.session.message;
        } else {
            app.client.get(req, res, app, function (data) {
                if (!data) {
                    res.redirect('/client');
                } else {
                    res.render('client/masterpage_client.twig', {template: "client/update-form.twig", client: data,
                        message: '<span style="color:#0000ff">' + app.i18n.__("Image mise à jour avec succès.") + '</span>'});
                }
            });

            /*res.contentType('text/html');
             res.send({result: true});*/
        }
    });
};

exports.checkIban = function (iban) {
    var IBAN = require('../controller/iban');
    return IBAN.isValid(iban) ? iban : false;
};

exports.parseDate = function (str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
}

exports.daydiff = function (first, second) {
    return (second - first) / (1000 * 60 * 60 * 24);
}

exports.generatePassword = function () {
    var source = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    return source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60)) + source.charAt(Math.floor(Math.random() * 60));
};