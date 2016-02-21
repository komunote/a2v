exports.form = function (req, res, app) {

    this.count(req, res, app, function (results) {

        var count = results;
        //var category = require('../../controller/admin/category');

        app.category.getAll(req, res, app, function (results) {

            var categories = results;
            //var specialty = require('../../controller/admin/specialty');

            app.specialty.getAll(req, res, app, function (results) {
                res.render('admin/masterpage_admin.twig', {
                    template: "admin/client/add-form.twig",
                    admin: req.session.admin,
                    categories: categories,
                    specialties: results,
                    count: count, url:app.config.url
                });
            });
        });

    });
};

exports.count = function (req, res, app, callback) {

    app.db.collection('client').count(function (err, count) {
        callback(count);
    });
};

exports.get = function (req, res, app, id) {

    var collection = app.db.collection('client');
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function (err, doc) {

        //var category = require('../../controller/admin/category');
        //app.category.getAll(req, res, app, function (results) {

            //var categories = results;
            //var specialty = require('../../controller/admin/specialty');

            //app.specialty.getAll(req, res, app, function (results) {
                res.render('admin/masterpage_admin.twig', {
                    template: "admin/client/update-form.twig",
                    admin: req.session.admin,
                    client: doc, url:app.config.url             
                });
            //});
        //});
    });    
};

exports.search = function (req, res, app) {
    var oData = [];

    if (req.body.category !== "")
        oData.push({category: parseInt(req.body.category)});
    if (req.body.company !== "")
        oData.push({company: new RegExp(req.body.company, 'i')});
    if (req.body.email !== "")
        oData.push({email: new RegExp(req.body.email, 'i')});
    if (req.body.city !== "")
        oData.push({city: new RegExp(req.body.city, 'i')});
    if (req.body.postalcode !== "")
        oData.push({postalcode: new RegExp(req.body.postalcode, 'i')});
    if (req.body.admin_creation !== ""){
        if (req.body.admin_creation === "admin")
            oData.push({admin_creation: null});
         else 
            oData.push({admin_creation: req.body.admin_creation});        
    }    
            
    var collection = app.db.collection('client');
console.log(oData);
    collection.count({$and: oData}, function (error, count) {
        
        if (error) {
            console.log(error);
            res.render('admin/masterpage_admin.twig', {template: "admin/client/search-results.twig", admin: req.session.admin, result: null, count: 0, url:app.config.url});
        } else {
            collection.find({$and: oData
            }).sort({company: 1}).limit(200).toArray(function (err, results) {

                if (results.length === 0) {
                    console.dir('recherche ko - admin/client');
                    res.redirect('/admin/client/search');
                } else {
                    
                    for (var i in results) {                        
                        if (results[i].password) {
                            results[i].url = "https://www.autour2vous.com/client/subscription/" + app.Base64.encode(results[i].email) + "/" + app.Base64.encode(results[i].password);
                        }
                    }
                                   
                    console.dir('recherche ok');
                    res.render('admin/masterpage_admin.twig', {
                        template: "admin/client/search-results.twig",
                        admin: req.session.admin,
                        result: results,
                        count: count, url:app.config.url
                    });
                }
            });
        }
    });



};

exports.update = function (req, res, app) {

    var collection = app.db.collection('client');
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
            email_subscription_sent : parseInt(req.body.email_subscription_sent),
            tobecontacted: req.body.tobecontacted,
            sendemail: req.body.sendemail,
            interested: req.body.interested,
            comment: app.xss(req.body.comment),
            email_sent: 0,
            date_update: date
        }}, function (err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/client/update/failed');
        } else {
            res.redirect('/admin/client/update/success');
        }
    });
};

exports.searchNearby = function (req, res, app) {

    var collection = app.db.collection('client');
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
            res.redirect('/admin/client/search');
        } else {
            console.dir('recherche ok');

            res.render('admin/masterpage_admin.twig', {
                template: "admin/client/search-results.twig",
                admin: req.session.admin,
                result: results, url:app.config.url
            });
        }
    });
};
