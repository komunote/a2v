exports.search = function(req, res, app, msg) {

    var collection = app.db.collection('category');
    collection.find().sort({name: 1}).toArray(function(err, results) {
        /*if (typeof(msg) !== "undefined") {*/
            res.render('masterpage_admin.twig', {
                template: "category/index.twig",
                admin: req.session.admin,
                msg:msg,
                result: results
            });
        /*} else {
            res.render('masterpage_admin.twig', {
                template: "category/index.twig",
                admin: req.session.admin,
                result: results
            });
        }*/
    });
};

exports.get = function(req, res, app, id) {

    var collection = app.db.collection('category');
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function(err, doc) {

        res.render('masterpage_admin.twig', {
            template: "category/update-form.twig",
            category: doc,
            admin: req.session.admin
        });
    });
};

exports.getAll = function(req, res, app, callback) {

    var collection = app.db.collection('category');

    collection.find().sort({name: 1}).toArray(function(err, doc) {
        callback(doc);
    });
};

exports.insert = function(req, res, app) {

    var collection = app.db.collection('category');

    var category = {
        name: app.xss(req.body.name)
    };

    collection.insert(category, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/category/add/failed');
        } else {
            res.redirect('/admin/category/add/success');
        }
    });
};

exports.update = function(req, res, app) {

    var collection = app.db.collection('category');

    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    collection.update({_id: o_id}, {$set: {name: app.xss(req.body.name)}}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/category/update/failed');
        } else {
            res.redirect('/admin/category/update/success');
        }
    });
};