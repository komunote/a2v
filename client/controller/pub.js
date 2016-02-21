exports.getQrCodes = function (req, res, app, callback) {

    var collection = app.db.collection('client');
    var date = new Date().toJSON().split('T')[0];
    var key = app.sha1(JSON.stringify('getQrCodes-' + req.session.client._id));

    app.mc.get(key, function (err, results) {
        if (!err && app.config.cache_enabled === 1) {
            console.log("getQrCodes : cached data found");
            return callback(JSON.parse(results[key]));
        } else {
            collection.find({_id: new app.BSON.ObjectID.createFromHexString(req.session.client._id)}, {qr_codes: 1}).toArray(function (err, items) {

                if (err) {
                    console.log(err);
                    return callback(null);
                } else {

                    if (items) {
                        var data = {
                            opened: [],
                            closed: [],
                            validated: []
                        };

                        for (var i in items) {
                            for (var j in items[i].qr_codes) {
                                //if (req.session.client._id === items[i].qr_codes[j].prospect_id) {
                                var item = {
                                    nickname: items[i].qr_codes[j].nickname,
                                    qr_code: items[i].qr_codes[j]
                                };
                                if (items[i].qr_codes[j].validated) {
                                    data.validated.push(item);
                                } else {
                                    if (date === items[i].qr_codes[j].date_created) {
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
                                    console.log("getQrCodes : data stored");
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

exports.validateQrCode = function (req, res, app, callback) {

    var collection = app.db.collection('user');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.params.user_id);
    var date = new Date().toJSON();
    var date_created = date.split('T')[0];

    collection.update({
        _id: o_id,
        qr_codes: {
            $elemMatch: {
                client_id: req.session.client._id,
                validated: 0,
                date_created: date.split('T')[0]
            }
        }},
    {$set: {
            'qr_codes.$.validated': 1,
            'qr_codes.$.date_validated': date,
            'qr_codes.$.qr_code': ''
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
                    qr_codes: {
                        $elemMatch: {
                            user_id: req.params.user_id,
                            validated: 0,
                            date_created: date_created
                        }
                    }};

                collection.update(criteria,
                        {$set: {
                                'qr_codes.$.validated': 1,
                                'qr_codes.$.date_validated': date
                            }}, function (err, doc) {

                    if (err) {
                        console.log(err);
                        return callback(null);
                    } else {
                        if (doc === null || doc === 0) {
                            console.log(criteria);
                            return callback(false);
                        } else {
                            return callback(true);
                        }
                    }
                });

            }
        }
    });
};
