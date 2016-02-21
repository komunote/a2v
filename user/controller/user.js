exports.insert = function (req, res, app) {

    var collection = app.db.collection('user');
    var date = new Date().toJSON();

    var user = {
        nickname: app.xss(req.body.nickname),
        /*lastname: app.xss(req.body.lastname),
        firstname: app.xss(req.body.firstname),*/
        city: app.xss(req.body.city),
        postalcode: app.xss(req.body.postalcode),
        state: app.xss(req.body.state),
        country: app.xss(req.body.country),
        password: app.sha1(req.body.password),
        email: app.xss(req.body.email),
        birthday: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
        },
        date_creation: date,
        date_update: date
    };
    user.validation_id = app.sha1(date.toString() + 'a2v' + user.email);
    user.coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
    user.validated = false;

    collection.insert(user, function (err, doc) {
        if (err)
            console.log(err);

        if (doc === null || doc.length === 0) {
            console.log('signin ko');
            //res.redirect('/subscribe/failed');
            //res.contentType('json');
            res.send(null);
        } else {
            console.log('signin ok');

            app.transporter.sendMail({
                from: "L'équipe autour2vous <ne_pas_repondre@autour2vous.com>",
                to: user.email,
                subject: "validation inscription autour2vous",
                text: "Cher " + user.nickname + ",\n votre inscription est presque terminée. " +
                        "Merci de cliquer sur le lien suivant pour valider votre inscription :\n " +
                        "https://www.autour2vous.com/" + user._id + "/" + user.validation_id + "\n\n" +
                        "L'équipe autour2vous",
                html:
                        '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                        '<div style="background-color:#000000">' +
                        '<p>' +
                        '<a href="https://www.autour2vous.com" style="text-decoration: none; color:#F62459;font-size: 2em;">' +
                        '<span>autour<span style="color:#ffffff">2</span>vous</span>' +
                        '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé</span>' +
                        '<div><img style="width:100%;" src="https://www.autour2vous.com/static/image/bandeau_email.jpg" /></div>' +
                        '</a>' +
                        '</p></div>' +
                        '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                        "<p>votre inscription est presque terminée.</p>" +
                        "<p>Merci de cliquer sur le lien " +
                        "<a href=\"https://www.autour2vous.com/subscribe-validation/" + user._id + "/" + user.validation_id + "/\">ici</a>" +
                        " pour valider votre inscription.<br /></p><br /><br />" +
                        '<p><a href="https://www.autour2vous.com">www.autour2vous.com</a></p>' +
                        '<div style="background-color:#000000; color:#ffffff">' +
                        '<p><i>L\'équipe autour2vous<i></p></div></div></div>'

            }, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                }
                res.send(true);
            });

        }
    });
};

exports.update = function (req, res, app) {

    var collection = app.db.collection('user');

    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.user._id);
    var date = new Date().toJSON();

    var user = {
        lastname: app.xss(req.body.lastname),
        firstname: app.xss(req.body.firstname),
        city: app.xss(req.body.city),
        postalcode: app.xss(req.body.postalcode),
        phone: app.xss(req.body.phone),
        'notification.event': req.body.notification.event,
        'notification.flash': req.body.notification.flash,
        'notification.news': req.body.notification.news,
        date_update: date
    };

    collection.update({_id: o_id,
        validated: true},
    {$set: user}, function (err, results) {

        if (results === null || results.length === 0) {
            //res.redirect('/update/failed');
            //res.contentType('json');
            res.contentType('text/javascript');
            res.send('null');
        } else {
            res.contentType('text/javascript');
            res.send("{true}");
        }
    });
};

/*
 * lien de validation d'inscription
 */
exports.subscribeValidate = function (req, res, app, user_id, validation_id) {
    var collection = app.db.collection('user');
    var o_id = new app.BSON.ObjectID.createFromHexString(user_id);
    var date = new Date().toJSON();


    collection.findOne({
        _id: o_id,
        validation_id: validation_id,
        validated: false
    }, function (err, user) {

        if (user !== null) {
            collection.update({_id: o_id},
            {$set: {validated: true, date_update: date}}, function (err, doc) {
                res.redirect('/subscribe-validation-success');
            });
        } else {
            res.redirect('/subscribe-validation-failed');
        }

    });
};

exports.login = function (req, res, app) {

    var collection = app.db.collection('user');

    collection.findOne({
        email: app.xss(req.body.email),
        password: app.sha1(app.xss(req.body.password)),
        validated: true
    }, function (err, user) {

        if (user === null) {
            console.log('login ko');
            req.session.user = undefined;
            res.send(null);
        } else {
            console.log('login ok');
            //req.session.user = user;
            req.session.user = {
                _id:user._id,
                nickname : user.nickname,
                email : user.email,
                coordinates : user.coordinates
            };
            console.log(req.session.user);
            //req.session.save();
            //res.send(true);
            res.render('view/index.html', {user: req.session.user});
        }
    });
};

exports.getByNickname = function (req, res, app, nickname, callback) {

    var collection = app.db.collection('user');

    collection.findOne({
        nickname: nickname,
        validated: true
    }, function (err, user) {
        if (user === null) {
            console.log("user data not found");
            callback(null);
        } else {
            console.log('user data found');
            /*var thumb = 0;
             if (typeof (user.pictures) !== 'undefined' &&
             user.pictures !== null &&
             typeof (user.pictures.public) !== "undefined" &&
             user.pictures.public !== null &&
             typeof (user.pictures.public[0]) !== "undefined" &&
             user.pictures.public[0].toValidate === 0) {
             thumb = 1;
             }*/

            var data = {
                user: {nickname: req.session.user.nickname},
                receiver: {
                    _id: user._id,
                    nickname: user.nickname,
                    email: user.email,
                    coordinates: user.coordinates,
                    birthday: user.birthday,
                    gender: user.gender,
                    description: user.description,
                    //pictures: user.pictures,
                    //thumb_available: thumb
                }
            };

            callback(data);
        }
    });
};


exports.getById = function (req, res, app, id, callback) {

    var collection = app.db.collection('user');
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({
        _id: o_id,
        validated: true
    }, function (err, result) {

        var data = {user: null};



        data.__ = [
            /*app.i18n.__("Pas de photo"),
             app.i18n.__("Chatter avec"),
             app.i18n.__("Ajouter à ma liste d'amis")*/
        ];

        if (result === null) {
            console.log("getById user data not found");
            callback(data);
        } else {
            console.log('getById user data found');

            data.user = {
                _id: id,
                nickname: result.nickname,
                name: result.name,
                firstname: result.firstname,
                city: result.city,
                postalcode: result.postalcode,
                coordinates: result.coordinates,
                phone: result.phone,
                //gender: result.gender,
                //preference: result.preference,
                //description: result.description,
                //situation: result.situation,
                notification: result.notification,
                //pictures: result.pictures,
                qr_codes: result.qr_codes,
                reservations: result.reservations
            };

            callback(data);
        }
    });
};

exports.updateLocation = function (req, res, app) {

    if (req.session.user) {
        var collection = app.db.collection('user');
        var o_id = new app.BSON.ObjectID.createFromHexString(req.session.user._id);

        if (!req.body.location) {
            return res.send({result: 0});
        }

        var user = {
            coordinates: [parseFloat(req.body.location.longitude), parseFloat(req.body.location.latitude)],
            location: req.body.location
        };
        user.location.coordinates = [parseFloat(user.location.longitude), parseFloat(user.location.latitude)];

        if (JSON.stringify(user.coordinates) === JSON.stringify(req.session.user.coordinates)) {
            res.send({result: 'not-updated'});
        } else {
            collection.update({_id: o_id},
            {$set: user}, function (err, doc) {

                if (err)
                    console.log(err);

                if (doc === null || doc.length === 0) {
                    console.log('update failed');
                    //res.contentType('json');
                    res.send({result: 0});

                } else {
                    req.session.user.coordinates = user.coordinates;
                    req.session.user.location = user.location;
                    req.session.save();
                    res.send({result: 1});
                }
            });
        }
    }
};

exports.checkNickname = function (req, res, app, nickname) {
    var collection = app.db.collection('user');

    collection.findOne({
        nickname: nickname
    }, function (err, user) {

        if (!user) {
            //console.log('nickname available');
            //res.contentType('json');
            res.send({result: true});
        } else {
            //console.log('nickname not available');
            //res.contentType('json');
            res.send({result: false});
        }
    });
};

exports.checkEmail = function (req, res, app, email) {
    var collection = app.db.collection('user');

    collection.findOne({
        email: email
    }, function (err, user) {

        if (user === null) {
            //console.log('email available');
            //res.contentType('json');
            res.send({result: true});
        } else {
            //console.log('email not available');
            //res.contentType('json');
            res.send({result: false});
        }
    });
};

function templateClients(app, res, results, length, callback) {
    //console.log(app.Base64.decode(results));
    if (results === undefined || results === null || length === 0) {
        //console.log('searchNearbyClients ko');
        //res.contentType('json');
        //return res.send(null);
        callback(null);
    } else {
        //console.log('searchNearbyClients  ok');
        //res.contentType('json');
        //return res.send(results);
        callback(results);
    }
}



exports.searchNearbyProspects = function (req, res, app, callback) {

    //var oData = [/*{interested: "3"},*/ {category: {$in: ["Restaurant", "Café/Pub", "Pub/Restaurant"]}}, {city: "Paris"}];
    //var oData = [{category: {$in: ["Restaurant", "Café/Pub", "Pub/Restaurant"]}}];
    var oData = [/*{status:1}*/];

    if ("category" in req.query)// typeof (req.body.category) !== 'undefined'
        oData.push({category: parseInt(req.query.category)});

    if ("company" in req.query)
        oData.push({company: new RegExp(app.xss(req.query.company), 'i')});

    if ("city" in req.query && req.query.city !== '')
        oData.push({city: new RegExp(app.xss(req.query.city), 'i')});

    if ("postalcode" in req.query && req.query.postalcode !== '')
        oData.push({postalcode: app.xss(req.query.postalcode)});

    var range = parseInt(req.query.range > 0 ? req.query.range : 500);
//console.log(req);
//console.log(oData);
    if (range > 0) {
        if (range < 1000)
            range = 5000;

        oData.push({coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [2.3481128, 48.887609]//req.session.user.coordinates
                    },
                    $maxDistance: range
                }
            }});
    }

    var key = app.sha1(JSON.stringify(oData));
    var collection = app.db.collection('prospect');

    /*app.mc.get(key, function (err, results) {

        if(err){
            console.log(err);
            res.send(null);
            return;
        }
        if (app.config.cache_enabled === 1) {
            console.log("cached data found");
            //templateClients(res, JSON.parse(results[key], 1));
            templateClients(app, res, results[key], 1);

        } else {*/
            collection.find({$and: oData}).limit(10)
                    .toArray(function (err, results) {
                if(err){
                    console.log(err);
                    return callback(null);
                }

                if (!results){
                    return callback(null);
                }
                var length = results.length;

                var data = {
                    user:{},
                    /*user: {
                        _id: req.session.user._id,
                        nickname: req.session.user.nickname,
                        email: req.session.user.email,
                        coordinates: req.session.user.coordinates
                    },*/
                    clients: []
                };

                for (var i in results) {
                    data.clients.push({
                        _id: results[i]._id,
                        company: results[i].company,
                        address: results[i].address,
                        city: results[i].city,
                        category: results[i].category,
                        reduction: results[i].reduction,
                        price_min: results[i].price_min,
                        chef: results[i].chef,
                        //suggestion: results[i].suggestion,
                        menus: results[i].menus,
                        dishes: results[i].dishes,
                        day_dish: results[i].day_dish,
                        desserts: results[i].desserts,
                        organic: results[i].organic,
                        home_made: results[i].home_made,
                        condition: results[i].condition,
                        coordinates: results[i].coordinates,
                        pictures: results[i].pictures
                    });
                }

                data.__ = [
                    app.i18n.__("Réservez ce restaurant"),
                    app.i18n.__("Obtenez une réduction")
                ];

                //encoding
                //data = app.Base64.encode(JSON.stringify(data));
                data = JSON.stringify(data);

                if (app.config.cache_enabled === 1) {
                    //app.mc.set(key, JSON.stringify(data), {flags: 0, exptime: 1800}, function (err, status) {
                    /*app.mc.set(key, data, {flags: 0, exptime: 1800}, function (err, status) {
                        if (!err) {
                            console.log("data stored");
                        } else {
                            console.log(err);
                        }*/

                        templateClients(app, res, data, length, callback);
                    //});
                } else {
                    templateClients(app, res, data, length, callback);
                }
            });
        /*}
    });*/
};

exports.generateQrCode = function (req, res, app, callback) {

    var collection = app.db.collection('user');
    collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(req.session.user._id)}, {nickname: 1, email: 1, qr_codes: 1}, function (error, user) {
        if (!user.qr_codes || user.qr_codes.length < 1) {
            user.qr_codes = [];
        }
        var user_id = app.Base64.decode(req.body.user);
        var client_id = app.Base64.decode(req.body.client);
        var company = app.Base64.decode(req.body.company);
        var category = app.Base64.decode(req.body.category);
        var quantity = 1;
        var reduction = app.Base64.decode(req.body.reduction);

        var date = new Date().toJSON();
        var ex = date.split('T');

        //var key = ex[0] + '_' + user_id + '-' + client_id;

        if (user._id.toString() !== user_id) {
            console.log('wrong user');
            return callback(false);
        } else {

            /*if (typeof (user.qr_codes[key]) === 'undefined') {*/

            var qr = app.qrCode.qrcode(5, 'M');
            var url = 'https://www.autour2vous.com:4000/qr/' + user_id + '/' + client_id;

            qr.addData(url);
            qr.make();
            var img = qr.createImgTag(5);

            var item = {client_id: client_id, validated: 0, date_created: ex[0], date_validated: null,
                user_id: req.session.user._id, nickname: req.session.user.nickname,
                qr_code: img, company: company, category: category, reduction: reduction, quantity: quantity};

            var item_client = {user_id: req.session.user._id, nickname: req.session.user.nickname, validated: 0, date_created: ex[0], date_validated: null,
                reduction: reduction, quantity: quantity};

            // si le qr_code n'existe pas déjà
            var found = false;
            for (var i in user.qr_codes) {
                if (user.qr_codes[i].date_created === ex[0] && user.qr_codes[i].client_id === client_id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                user.qr_codes.push(item);

                collection.update({_id: new app.BSON.ObjectID.createFromHexString(req.session.user._id)},
                {$set: {qr_codes: user.qr_codes}}, function (err, doc) {

                    if (err) {
                        console.log(err);
                        return callback(null);
                    } else {
                        if (!doc) {
                            return callback(null);
                        } else {

                            collection = app.db.collection('client');
                            collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(client_id)}, {company: 1, email: 1, password: 1, qr_codes: 1}, function (_error, client) {
                                if (_error || !client) {
                                    console.log(_error);
                                    console.log(client);
                                    return callback(null);
                                } else {

                                    if (!client.qr_codes || !client.qr_codes instanceof Array) {
                                        client.qr_codes = [];
                                    }
                                    client.qr_codes.push(item_client);

                                    collection.update({_id: new app.BSON.ObjectID.createFromHexString(client_id)},
                                    {$set: {qr_codes: client.qr_codes}}, function (err, doc) {

                                        if (err) {
                                            console.log(err);
                                            return callback(null);
                                        } else {
                                            if (!doc) {
                                                return callback(null);
                                            } else {
                                                var ex = item.date_created.split('-');

                                                app.transporter.sendMail({
                                                    from: "L'équipe autour2vous <ne_pas_repondre@autour2vous.com>",
                                                    to: user.email,
                                                    subject: "création d'un QR Code",
                                                    text: 'Cher ' + user.nickname + ',\n Voici votre QR code pour l\'établissement "' + item.company + '". ' +
                                                            'Pour le visualiser, connectez-vous en cliquant sur le lien ci-dessous :\n ' +
                                                            'https://www.autour2vous.com/home/email/' + user.email + '\n\n' +
                                                            'L\'équipe autour2vous',
                                                    html:
                                                            '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                                                            '<div style="background-color:#000000">' +
                                                            '<p>' +
                                                            '<a href="https://www.autour2vous.com/home/email/' + user.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                                                            '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                                                            '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé !</span>' +
                                                            '<div><img style="width:100%;" src="https://www.autour2vous.com/static/image/bandeau_email.jpg" /></div>' +
                                                            '</a>' +
                                                            '</p>' +
                                                            '</div>' +
                                                            '<div>' +
                                                            '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                                                            '<p>Voici votre QR code pour l\'établissement "' + item.company + '"</p>' +
                                                            '<p>' + item.qr_code + '</p>' +
                                                            '<p> Date de validité : <i>' + ex[2] + '/' + ex[1] + '/' + ex[0] + '</i></p>' +
                                                            '<p> Réduction : <i>' + item.reduction + '</i></p>' +
                                                            '<p>Ce code est à présenter en caisse.</p>' +
                                                            '<br />' +
                                                            '<div style="background-color:#000000; color:#ffffff">' +
                                                            '<p><i>L\'équipe autour2vous<i></p></div></div></div>'
                                                }, function (error, info) {
                                                    if (error) {
                                                        console.log(error);
                                                        return callback(null);
                                                    } else {
                                                        console.log('Message sent: ' + info.response);
                                                        return callback(true);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });


                        }
                    }
                });
            } else {
                return callback(false);
            }
        }
    });
};

