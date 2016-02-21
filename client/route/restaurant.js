module.exports = function(app){
  
  /* refuse reservation form */
    app.get('/r0/:user_id([0-9a-f]{24})/:prospect_id([0-9a-f]{24})', function (req, res) {
        if (req.session.client) {
            if (req.session.client._id === req.params.prospect_id) {
                res.render('masterpage_client.twig', {
                    template: "reservation/refusal-form.twig", client: req.session.client, user_id: req.params.user_id});
                res.end();
            } else {
                res.render('masterpage_client.twig', {
                    template: "reservation/refusal-failed.twig", client: req.session.client});
                res.end();
            }
        } else {
            res.redirect('/client');
        }
    });
    /* refuse reservation */
    app.post('/client/refuse-reservation', function (req, res) {
        if (req.session.client) {

            if (req.session.client._id === req.body.prospect_id) {
                app.restaurant.refuseReservation(req, res, app, function (data) {
                    if (!data) {
                        res.render('masterpage_client.twig', {
                            template: "reservation/refusal-failed.twig", client: req.session.client});
                        res.end();
                    } else {
                        res.render('masterpage_client.twig', {
                            template: "reservation/refusal-success.twig", client: req.session.client});
                        res.end();
                    }
                });
            } else {
                res.render('masterpage_client.twig', {
                    template: "reservation/refusal-failed.twig", client: req.session.client});
                res.end();
            }
        } else {
            res.redirect('/client');
        }
    });

    /* validate reservation */
    app.get('/r1/:user_id([0-9a-f]{24})/:prospect_id([0-9a-f]{24})', function (req, res) {
        if (req.session.client) {
            if (req.session.client._id === req.params.prospect_id) {
                app.restaurant.validateReservation(req, res, app, function (data) {
                    if (!data) {
                        res.render('masterpage_client.twig', {
                            template: "reservation/validation-failed.twig", client: req.session.client});
                        res.end();
                    } else {
                        res.render('masterpage_client.twig', {
                            template: "reservation/validation-success.twig", client: req.session.client});
                        res.end();
                    }
                });
            } else {
                res.render('masterpage_client.twig', {
                    template: "reservation/validation-failed.twig", client: req.session.client});
                res.end();
            }
        } else {
            res.redirect('/client');
        }
    });

    app.get('/client/reservation-form', function (req, res) {
        if (req.session.client && !req.session.client.to_subscribe && req.session.client.status === 1) {
            app.restaurant.getReservations(req, res, app, function (data) {
                if (!data) {
                    res.redirect('/client');
                } else {
                    res.render('masterpage_client.twig', {
                        template: "reservation/index.twig", client: req.session.client, reservations: data});
                }
            });
        } else {
            res.redirect('/client');
        }
    });
    
    app.get('/client/room-form', function (req, res) {
        if (req.session.client && !req.session.client.to_subscribe && req.session.client.status === 1 && req.session.client.reservation_mode === 1) {
            app.restaurant.roomGetAll(req, res, app, function (client, result) {
                res.render('masterpage_client.twig', {template: "reservation/room/index.twig",
                    client: client, rooms: result});
            });
        } else {
            res.redirect('/client');
        }
    });

    app.post('/client/room-add', function (req, res) {
        if (req.session.client && !req.session.client.to_subscribe && req.session.client.status === 1 && req.session.client.reservation_mode === 1) {
            app.restaurant.roomInsert(req, res, app, function (result) {
                app.restaurant.roomGetAll(req, res, app, function (client, data) {
                    res.render('masterpage_client.twig', {template: "reservation/room/index.twig",
                        client: client, rooms: data, message: result});
                });
            });
        } else {
            res.redirect('/client');
        }
    });
    
     app.post('/client/room-remove', function (req, res) {
        if (req.session.client && !req.session.client.to_subscribe && req.session.client.status === 1 && req.session.client.reservation_mode === 1) {
            app.restaurant.roomRemove(req, res, app, function (result) {
                app.restaurant.roomGetAll(req, res, app, function (client, data) {
                    res.render('masterpage_client.twig', {template: "reservation/room/index.twig",
                        client: client, rooms: data, message: result});
                });
            });
        } else {
            res.redirect('/client');
        }
    });
    
    app.post('/client/table-add', function (req, res) {
        if (req.session.client && !req.session.client.to_subscribe && req.session.client.status === 1 && req.session.client.reservation_mode === 1) {
            app.restaurant.tableInsert(req, res, app, function (result) {
                app.restaurant.roomGetAll(req, res, app, function (client, data) {
                    res.render('masterpage_client.twig', {template: "reservation/room/index.twig",
                        client: client, rooms: data, message: result});
                });
            });
        } else {
            res.redirect('/client');
        }
    });
    
    app.post('/client/table-remove-all', function (req, res) {
        if (req.session.client && !req.session.client.to_subscribe && req.session.client.status === 1 && req.session.client.reservation_mode === 1) {
            app.restaurant.tableRemoveAll(req, res, app, function (result) {
                app.restaurant.roomGetAll(req, res, app, function (client, data) {
                    res.render('masterpage_client.twig', {template: "reservation/room/index.twig",
                        client: client, rooms: data, message: result});
                });
            });
        } else {
            res.redirect('/client');
        }
    });
};