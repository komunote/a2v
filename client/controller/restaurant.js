exports.getReservations = function (req, res, app, callback) {

    var collection = app.db.collection('client');
    var date = new Date().toJSON().split('T')[0];
    var key = app.sha1(JSON.stringify('reservations-' + req.session.client._id));

    app.mc.get(key, function (err, results) {
        if (!err && app.config.cache_enabled === 1) {
            console.log("reservations : cached data found");
            return callback(JSON.parse(results[key]));

        } else {
            collection.find({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)}, {_id: 1, reservations: 1}).toArray(function (err, items) {

                if (err) {
                    console.log(err);
                    return callback(null);
                } else {

                    if (items) {
                        var data = {
                            __ : app.__,
                            opened: [],
                            closed: [],
                            validated: [],
                            refused: []
                        };

                        for (var i in items) {
                            for (var j in items[i].reservations) {
                                //if (req.session.client._id === items[i].reservations[j].prospect_id) {
                                var item = {
                                    user_id: items[i].reservations[j].user_id,
                                    nickname: items[i].reservations[j].nickname,
                                    reservation: items[i].reservations[j]
                                };
                                if (items[i].reservations[j].validated === 1) {
                                    data.validated.push(item);
                                } else if (items[i].reservations[j].validated === -1) {
                                    data.refused.push(item);
                                } else {
                                    if (date === items[i].reservations[j].date_created) {
                                        data.opened.push(item);
                                    } else {
                                        data.closed.push(item);
                                    }
                                }
                                //}
                            }
                        }
                        if (app.config.cache_enabled === 1) {
                            app.mc.set(key, JSON.stringify(data), {flags: 0, exptime: 1800}, function (err, status) {
                                if (!err) {
                                    console.log("reservations : data stored");
                                } else {
                                    console.log(err);
                                }
                                return callback(data);
                            });
                        } else {
                            return callback(data);
                        }
                    } else {
                        return callback(null);
                    }
                }
            });
        }
    });
};

exports.validateReservation = function (req, res, app, callback) {

    var collection = app.db.collection('user');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.params.user_id);
    var date = new Date().toJSON();
    var date_created = date.split('T')[0];

    collection.findOne({_id: o_id}, {nickname: 1, email: 1}, function (error, user) {

        if (error) {
            console.log(error);
            return callback(null);
        } else {
            collection.update({
                _id: o_id,
                reservations: {
                    $elemMatch: {
                        client_id: req.session.client._id,
                        validated: 0,
                        date_created: date_created
                    }
                }},
            {$set: {
                    'reservations.$.validated': 1,
                    'reservations.$.date_validated': date
                }}, function (err, doc) {

                if (err) {
                    console.log(err);
                    return callback(null);
                } else {
                    if (doc === null || doc === 0) {
                        return callback(false);
                    } else {

                        collection = app.db.collection('client');
                        var criteria = {
                            _id: new app.BSON.ObjectID.createFromHexString(req.session.client._id),
                            reservations: {
                                $elemMatch: {
                                    user_id: req.params.user_id,
                                    validated: 0,
                                    date_created: date_created
                                }
                            }};

                        collection.update(criteria,
                                {$set: {
                                        'reservations.$.validated': 1,
                                        'reservations.$.date_validated': date
                                    }}, function (err, doc) {

                            if (err) {
                                console.log(err);
                                return callback(null);
                            } else {
                                if (doc === null || doc === 0) {
                                    console.log(criteria);
                                    return callback(false);
                                } else {
                                    var ex = date_created.split('-');
                                    var _date = ex[2] + '/' + ex[1] + '/' + ex[0];

                                    app.transporter.sendMail({
                                        from: "L'équipe de nice2meet2 <ne_pas_repondre@n2m2.fr>",
                                        to: user.email,
                                        subject: "réservation validée",
                                        text: 'Cher ' + user.nickname + ',\n L\'établissement "' + req.session.client.company + '" ' +
                                                'a accepté votre réservation :\n ' +
                                                'Date : ' + _date + '\n' +
                                                'Veuillez présenter cet email afin d\'obtenir votre réduction.\n\n' +
                                                'Pour plus de détails, connectez-vous sur votre compte :' +
                                                'http://www.n2m2.fr/home/email/' + user.email + '\n\n' +
                                                'L\'équipe de nice2meet2',
                                        html:
                                                '<div style="width:90%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000">' +
                                                '<div style="background-color:#000000">' +
                                                '<p>' +
                                                '<a href="http://www.n2m2.fr/home/email/' + user.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                                                '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                                                '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Nouvelle plateforme de réservations </span>' +
                                                '<div><img style="width:100%;" src="http://www.n2m2.fr/static/image/bandeau_email.jpg" /></div>' +
                                                '</a>' +
                                                '</p></div>' +
                                                '<div>' +
                                                '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                                                '<p>L\'établissement <b>"' + req.session.client.company + '"</b> a accepté votre réservation :</p>' +
                                                '<p>Date : ' + _date + '</p>' +
                                                '<p>Veuillez présenter cet email afin d\'obtenir votre réduction.</p>' +
                                                '<br />' +
                                                '<p>Pour plus de détails, connectez-vous sur votre compte :</p>' +
                                                '<p><a href="http://www.n2m2.fr/home/email/' + user.email + '/">www.n2m2.fr</a></p>' +
                                                '<div style="background-color:#000000; color:#ffffff">' +
                                                '<p><i>L\'équipe de nice2meet2<i></p></div></div></div>'

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
                }
            });
        }
    });
};

exports.refuseReservation = function (req, res, app, callback) {

    var collection = app.db.collection('user');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body.user_id);
    var date = new Date().toJSON();
    var date_created = date.split('T')[0];

    var reason = '';
    if (req.body.reason !== '') {
        reason = app.xss(req.body.reason);
    }

    if (reason !== '') {

        collection.findOne({_id: o_id}, {nickname: 1, email: 1}, function (error, user) {

            if (error) {
                console.log(error);
                return callback(null);
            } else {

                collection.update({
                    _id: o_id,
                    reservations: {
                        $elemMatch: {
                            client_id: req.session.client._id,
                            validated: 0,
                            date_created: date_created
                        }
                    }},
                {$set: {
                        'reservations.$.validated': -1,
                        'reservations.$.date_validated': date,
                        'reservations.$.reason': reason
                    }}, function (err, doc) {

                    if (err) {
                        console.log(err);
                        return callback(null);
                    } else {
                        if (doc === null || doc === 0) {
                            return callback(false);
                        } else {

                            collection = app.db.collection('client');
                            var criteria = {
                                _id: new app.BSON.ObjectID.createFromHexString(req.session.client._id),
                                reservations: {
                                    $elemMatch: {
                                        user_id: req.body.user_id,
                                        validated: 0,
                                        date_created: date_created
                                    }
                                }};

                            collection.update(criteria,
                                    {$set: {
                                            'reservations.$.validated': -1,
                                            'reservations.$.date_validated': date,
                                            'reservations.$.reason': reason
                                        }}, function (err, doc) {

                                if (err) {
                                    console.log(err);
                                    return callback(null);
                                } else {
                                    if (doc === null || doc === 0) {
                                        console.log(req.body);
                                        console.log(criteria);
                                        return callback(false);
                                    } else {
                                        app.transporter.sendMail({
                                            from: "L'équipe de nice2meet2 <ne_pas_repondre@n2m2.fr>",
                                            to: user.email,
                                            subject: "réservation refusée",
                                            text: 'Cher ' + user.nickname + ',\n L\'établissement "' + req.session.client.company + '" ' +
                                                    'a refusé la réservation en précisant le motif suivant :\n ' +
                                                    '"' + reason + '"\n' +
                                                    'Selon le motif invoqué, vous pouvez réitérer une nouvelle réservation auprès de ce même établissement.\n\n' +
                                                    'Pour plus de détails, connectez-vous sur votre compte :\n' +
                                                    'http://www.n2m2.fr/home/email/' + user.email + '\n\n' +
                                                    'L\'équipe de nice2meet2',
                                            html:
                                                    '<div style="width:90%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000">' +
                                                    '<div style="background-color:#000000">' +
                                                    '<p>' +
                                                    '<a href="http://www.n2m2.fr/home/email/' + user.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                                                    '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                                                    '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Nouvelle plateforme de réservations </span>' +
                                                    '<div><img style="width:100%;" src="http://www.n2m2.fr/static/image/bandeau_email.jpg" /></div>' +
                                                    '</a>' +
                                                    '</p></div>' +
                                                    '<div>' +
                                                    '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                                                    '<p>L\'établissement <b>"' + req.session.client.company + '"</b> a refusé la réservation en précisant le motif suivant :</p>' +
                                                    '<p><b>' + reason + '</b></p>' +
                                                    '<p>Selon le motif invoqué, vous pouvez réitérer une nouvelle réservation auprès de ce même établissement.</p>' +
                                                    '<br />' +
                                                    '<p>Pour plus de détails, connectez-vous sur votre compte :</p>' +
                                                    '<p><a href="http://www.n2m2.fr/home/email/' + user.email + '/">www.n2m2.fr</a></p>' +
                                                    '<div style="background-color:#000000; color:#ffffff">' +
                                                    '<p><i>L\'équipe de nice2meet2<i></p></div></div></div>'
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
                    }
                });
            }

        });


    } else {
        return callback(false);
    }
};

exports.roomGetAll = function (req, res, app, callback) {

    var collection = app.db.collection('client');

    collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
    {_id: 1, rooms: 1, capacity: 1, category: 1, occupation: 1},
    function (err, client) {
        if (err || !client) {
            console.log(err);
            return callback(null);
        } else {
            if(!client.rooms){
                return callback(client, null); 
            }
            
            return callback(client, client.rooms);
        }
    });

};

exports.roomInsert = function (req, res, app, callback) {
    var collection = app.db.collection('client');

    var room = {
        name: app.xss(req.body.name),
        capacity: parseInt(app.xss(req.body.capacity)),
        occupation: 0,
        smoking: !req.body.smoking ? 0 : 1
    };

    if (room.capacity < 2 || !room || room === '') {
        return callback("La salle n'as pas de nom ou sa capacité est inférieure à 2");
    }

    collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)}, {rooms: 1}, function (_error, client) {
        if (_error || !client) {
            console.log(_error);
            console.log(client);
            return callback(null);
        } else {

            if (!client.rooms) {
                client.rooms = [];
            }

            var found = false;
            for (var i in client.rooms) {
                if (client.rooms[i].name === room.name) {
                    found = true;
                    break;
                }
            }
            if (found) {
                return callback("Erreur : Nom de salle déjà existant.");
            }

            client.rooms.push(room);

            var capacity = 0;
            for (var i in client.rooms) {
                if (client.rooms[i]) {
                    capacity += parseInt(client.rooms[i].capacity);
                }
            }

            collection.update({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
            {$set: {rooms: client.rooms, capacity: isNaN(capacity) || capacity < 0 ? 0 : capacity}}, function (err, doc) {
                if (err) {
                    console.log('Error room creation :');
                    console.log(err);
                    return callback(false);
                } else {
                    if (doc === null || doc.length === 0) {
                        return callback("Echec. Salle non ajoutée. Veuillez contacter le service technique.");
                    } else {
                        return callback("Salle ajoutée avec succès");
                    }
                }
            });
        }
    });
};

exports.tableInsert = function (req, res, app, callback) {
    var collection = app.db.collection('client');

    var table = {
        capacity: parseInt(app.xss(req.body.capacity)),
        quantity: parseInt(app.xss(req.body.quantity))

    };

    if (table.capacity < 2 || !table || table === '' || !table.quantity || table.quantity < 1) {
        return callback("Erreur : La table n'as pas de quantité ou sa capacité est inférieure à 2");
    }

    collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
    {rooms: 1, occupation: 1}, function (_error, client) {
        if (_error || !client) {
            console.log(_error);
            console.log(client);
            return callback(null);
        } else {

            if (!client.rooms) {
                return callback("Erreur : La table ne peut pas être affectée s'il n'y a pas de salle.");
            }

            var iRoom = -1;
            for (var i in client.rooms) {
                if (client.rooms[i].name === req.body.room["name"]) {
                    if (!client.rooms[i].tables) {
                        client.rooms[i].tables = {};
                    }
                    if (client.rooms[i].tables[table.capacity]) {
                        return callback("Erreur : Type de table déjà existant.");
                    }
                    client.rooms[i].tables[table.capacity] = table;
                    client.rooms[i].occupation += table.capacity * table.quantity;
                    iRoom = i;
                    break;
                }
            }

            var capacity = 0;
            for (var i in client.rooms[iRoom].tables) {
                capacity += parseInt(client.rooms[iRoom].tables[i].capacity) * client.rooms[iRoom].tables[i].quantity;
            }

            if (capacity > parseInt(req.body.room["capacity"])) {
                return callback("Erreur : Capacité de la salle dépassée. Max : " + req.body.room["capacity"]);
            }

            var occupation = parseInt(client.occupation) + table.capacity * table.quantity;

            collection.update({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
            {$set: {rooms: client.rooms,
                    occupation: isNaN(occupation) || occupation < 0 ? 0 : occupation}}, function (err, doc) {
                if (err) {
                    console.log('Error table creation :');
                    console.log(err);
                    return callback(false);
                } else {
                    if (doc === null || doc.length === 0) {
                        return callback("Erreur inconnue. Table non ajoutée. Veuillez contacter le service technique.");
                    } else {
                        return callback("Table ajoutée avec succès");
                    }
                }
            });
        }
    });
};

exports.tableRemoveAll = function (req, res, app, callback) {
    var collection = app.db.collection('client');

    collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
    {rooms: 1, occupation: 1}, function (_error, client) {
        if (_error || !client) {
            console.log(_error);
            console.log(client);
            return callback(null);
        } else {

            var found = false;
            var oldOccupation = 0;

            for (var i in client.rooms) {
                if (client.rooms[i].name === req.body.name) {
                    oldOccupation = parseInt(client.rooms[i].occupation);
                    client.rooms[i].tables = null;
                    client.rooms[i].occupation = 0;
                    found = true;
                    break;
                }
            }

            if (!found) {
                return callback("Erreur : La salle n'existe pas ou ne contient pas de table.");
            }

            var occupation = parseInt(client.occupation) - oldOccupation;

            collection.update({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
            {$set: {rooms: client.rooms,
                    occupation: isNaN(occupation) || occupation < 0 ? 0 : occupation}}, function (err, doc) {
                if (err) {
                    console.log('Error tables removing :');
                    console.log(err);
                    return callback(false);
                } else {
                    if (doc === null || doc.length === 0) {
                        return callback("Echec. Tables non supprimées. Veuillez contacter le service technique.");
                    } else {
                        return callback("La salle a été vidée de ses tables avec succès");
                    }
                }
            });
        }
    });
};

exports.roomRemove = function (req, res, app, callback) {
    var collection = app.db.collection('client');

    collection.findOne({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
    {rooms: 1, capacity: 1, occupation: 1}, function (_error, client) {
        if (_error || !client) {
            console.log(_error);
            console.log(client);
            return callback(null);
        } else {

            var found = false;
            var oldCapacity = 0;
            var oldOccupation = 0;
            for (var i in client.rooms) {
                if (client.rooms[i].name === req.body.name) {
                    oldCapacity = parseInt(client.rooms[i].capacity);
                    oldOccupation = parseInt(client.rooms[i].occupation);
                    client.rooms.splice(i, 1);
                    found = true;
                    break;
                }
            }

            if (!found) {
                return callback("Erreur : La salle n'existe pas ou ne contient pas de table.");
            }
            var capacity = client.capacity - oldCapacity;
            var occupation = parseInt(client.occupation) - oldOccupation;

            collection.update({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)},
            {$set: {rooms: client.rooms,
                    capacity: isNaN(capacity) || capacity < 0 ? 0 : capacity,
                    occupation: isNaN(occupation) || occupation < 0 ? 0 : occupation}}, function (err, doc) {
                if (err) {
                    console.log('Error room removing :');
                    console.log(err);
                    return callback(false);
                } else {
                    if (doc === null || doc.length === 0) {
                        return callback("Echec. Salle non supprimée. Veuillez contacter le service technique.");
                    } else {
                        return callback("La salle a été supprimée avec succès");
                    }
                }
            });
        }
    });
};