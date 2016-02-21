exports.search = function(req, res, app) {

    var collection = app.db.collection('type');
    collection.find().sort({name: 1}).toArray(function(err, results) {

        res.render('masterpage_admin.twig', {
            template: "type/index.twig",
            admin: req.session.admin,
            result: results
        });

    });
};

exports.get = function(req, res, app, id) {
    
    var collection = db.collection('type');    
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function(err, doc) {
        res.render('masterpage_admin.twig', {
            template: "type/update-form.twig",
            type: doc,
            admin: req.session.admin
        });
    });
};

exports.getAll = function(req, res, app, callback) {
    
    var collection = app.db.collection('type');
    collection.find().sort({name: 1}).toArray(function(err, doc) {
        callback(doc);
    });
};

exports.insert = function(req, res, app) {
    
    var collection = app.db.collection('type');
    var type = {
        name: app.xss(req.body.name)
    };

    collection.insert(type, function(err, doc) {
        if (doc === null || doc.length === 0) {
            res.redirect('/admin/type/add/failed');
        } else {
            res.redirect('/admin/type/add/success');
        }
    });
};

exports.update = function(req, res, app) {

    var collection = app.db.collection('type');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    collection.update({_id: o_id}, {$set: {name: app.xss(req.body.name)}}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/type/update/failed');
        } else {
            res.redirect('/admin/type/update/success');
        }
    });
};