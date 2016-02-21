exports.search = function(req, res, app, msg) {

    var collection = app.db.collection('specialty');
    collection.find().sort({name: 1}).toArray(function(err, results) {
        res.render('masterpage_admin.twig', {
            template: "specialty/index.twig",
            admin: req.session.admin,
            msg:msg,
            result: results
        });
    });
};

exports.get = function(req, res, app, id) {
    
    var collection = app.db.collection('specialty');    
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function(err, doc) {
        res.render('masterpage_admin.twig', {
            template: "specialty/update-form.twig",
            specialty: doc,
            admin: req.session.admin
        });
    });
};

exports.getAll = function(req, res, app, callback) {
    
    var collection = app.db.collection('specialty');
    collection.find().sort({name: 1}).toArray(function(err, doc) {
        callback(doc);
    });
};

exports.insert = function(req, res, app) {
    
    var collection = app.db.collection('specialty');    
    var category = {
        name: app.xss(req.body.name)
    };

    collection.insert(category, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/specialty/add/failed');
        } else {
            res.redirect('/admin/specialty/add/success');
        }
    });
};

exports.update = function(req, res, app) {

    var collection = app.db.collection('specialty');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    collection.update({_id: o_id}, {$set: {name: app.xss(req.body.name)}}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/specialty/update/failed');
        } else {
            res.redirect('/admin/specialty/update/success');
        }
    });
};