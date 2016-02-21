exports.search = function(req, res, app, msg) {

    var collection = app.db.collection('criteria');
    collection.find().sort({name: 1}).toArray(function(err, results) {

        res.render('masterpage_admin.twig', {
            template: "criteria/index.twig",
            admin: req.session.admin,
            msg:msg,
            result: results
        });

    });
};

exports.get = function(req, res, app, id) {

    var collection = app.db.collection('criteria');
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function(err, doc) {
        res.render('masterpage_admin.twig', {
            template: "criteria/update-form.twig",
            criteria: doc,
            admin: req.session.admin
        });
    });
};

exports.insert = function(req, res, app) {

    var collection = app.db.collection('criteria');
    var category = {
        name: app.xss(req.body.name)
    };

    collection.insert(category, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/criteria/add/failed');
        } else {
            res.redirect('/admin/criteria/add/success');
        }
    });
};

exports.update = function(req, res, app) {

    var collection = app.db.collection('criteria');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    collection.update({_id: o_id}, {$set: {name: app.xss(req.body.name)}}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/criteria/update/failed');
        } else {
            res.redirect('/admin/criteria/update/success');
        }
    });
};