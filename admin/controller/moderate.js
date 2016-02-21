exports.search = function (req, res, app, type/*, number*/) {

    var collection = app.db.collection('user');

    var query = {};
    //number = parseInt(number);

    if (type === 'public') {
        query = {$or: [{"pictures.public.0.toValidate": 1}, {"pictures.public.1.toValidate": 1}, {"pictures.public.2.toValidate": 1}]};
    } else {
        query = {$or: [{"pictures.private.0.toValidate": 1}, {"pictures.private.1.toValidate": 1}, {"pictures.private.2.toValidate": 1}]};
    }

    collection.find(query).sort({date_update: 1}).toArray(function (err, results) {

        res.render('masterpage_admin.twig', {
            template: "moderate/search-results.twig",
            admin: req.session.admin,
            result: results,
            type: type
                    //number: number
        });
    });
};

exports.photoValidate = function (req, res, app) {

    var collection = app.db.collection('user');

    console.log(req.body);
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body.id);
    var date = new Date().toJSON();

    collection.findOne({
        _id: o_id,
        validated: true
    }, function (err, user_tmp) {

        if (user_tmp !== null) {

            if (req.body.type === 'public' || req.body.type === 'private') {
                var user = {
                    _id: user_tmp._id,
                    email: user_tmp.email,
                    nickname: user_tmp.nickname,
                    date_update: date
                };

                user.pictures = user_tmp.pictures;
                user.pictures[req.body.type][req.body.number].toValidate = 0;

                collection.update({_id: o_id},
                {$set: user}, function (err, doc) {
                    if (doc === null || doc.length === 0) {
                        console.log('validation ko');
                        res.contentType('json');
                        res.send({result: false});
                    } else {
                        console.log('validation ok');
                        
                        res.contentType('json');
                        res.send({result: true});

                        app.transporter.sendMail({
                            from: "L'équipe de nice2meet2 <ne_pas_repondre@n2m2.fr>",
                            to: user.email,
                            subject: "validation photo n2m2",
                            text: "Cher " + user.nickname + ",\n votre photo a été validée par notre équipe.\n" +
                                    "Elle est immédiatement disponible.\n\n" +
                                    "L'équipe de nice2meet2\n" +
                                    'http://www.n2m2.fr',
                            html:
                                    '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                                    '<div style="background-color:#333333">' +
                                    '<p>' +
                                    '<a href="http://www.n2m2.fr:4000/client' + user.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                                    '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                                    '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Nouvelle plateforme de réservations </span>' +
                                    '<div><img style="width:100%;" src="http://www.n2m2.fr/static/image/bandeau_email.jpg" /></div>' +
                                    '</a>' +
                                    '</p></div>' +
                                    '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                                    '<p>Votre photo a été validée par notre équipe.</p>' +
                                    '<p>Elle est immédiatement disponible.</p><br /><br />' +
                                    '<p><a href="http://www.n2m2.fr">www.n2m2.fr</a></p>' +
                                    '<div style="background-color:#333333; color:#ffffff">' +                                    
                                    '<p><i>L\'équipe de nice2meet2<i></p></div></div></div>'
                        }, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });

                /*var sourceFile = app.config.path + 'picturesToValidate/' + user._id + '/' + user.pictures[req.body.type][req.body.number].filename;
                 var targetFile = app.config.path + 'public/photo/' + user._id + '/' + req.body.type + '_' + req.body.number + '_' + req.body.id + '.jpg';
                 var sourceFileThumb = app.config.path + 'picturesToValidate/' + user._id + '/thumb_' + user.pictures[req.body.type][req.body.number].filename;
                 var targetFileThumb = app.config.path + 'public/photo/' + user._id + '/thumb_' + req.body.type + '_' + req.body.number + '_' + req.body.id + '.jpg';
                 
                 app.fs.mkdir(app.config.path + 'public/photo/' + req.body.id, function(err) {
                 
                 if (err && err.code !== 'EEXIST') {
                 console.dir(err);
                 } else {
                 app.fs.writeFile(targetFile, app.fs.readFileSync(sourceFile), function(err) {
                 if (err && err.code !== 'EEXIST') {
                 console.dir(err);
                 } else {
                 
                 app.fs.writeFile(targetFileThumb, app.fs.readFileSync(sourceFileThumb), function(err) {
                 if (err && err.code !== 'EEXIST') {
                 console.dir(err);
                 } else {
                 
                 collection.update({_id: o_id},
                 {$set: user}, function(err, doc) {
                 if (doc === null || doc.length === 0) {
                 console.log('validation ko');
                 res.contentType('json');
                 res.send({result: false});
                 } else {
                 console.log('validation ok');
                 app.fs.unlinkSync(sourceFile);
                 app.fs.unlinkSync(sourceFileThumb);
                 
                 res.contentType('json');
                 res.send({result: true});
                 
                 app.transporter.sendMail({
                 from: "L'équipe de nice2meet2 <ne_pas_repondre@n2m2.fr>",
                 to: user.email,
                 subject: "validation photo n2m2",
                 text: "Cher " + user.nickname + ",\n votre photo a été validée par notre équipe.\n" +
                 "Elle est immédiatement disponible.\n\n" +
                 "L'équipe de nice2meet2\n"+
                 'http://www.n2m2.fr',
                 html: 
                 '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                 '<div style="background-color:#333333">' +
                 '<p>' +
                 '<a href="http://www.n2m2.fr:4000/client' + user.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                 '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                 '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Nouvelle plateforme de réservations </span>' +
                 '<div><img style="width:100%;" src="http://www.n2m2.fr/static/image/bandeau_email.jpg" /></div>' +
                 '</a>' +
                 '</p></div>' +
                 '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                 '<p>Votre photo a été validée par notre équipe.</p>' +
                 '<p>Elle est immédiatement disponible.</p><br /><br />' +
                 '<div style="background-color:#333333; color:#ffffff">' +
                 '<p><a href="http://www.n2m2.fr">www.n2m2.fr</a></p>' +
                 '<p><i>L\'équipe de nice2meet2<i></p></div></div></div>'
                 }, function(error, info) {
                 if (error) {
                 console.log(error);
                 } else {
                 console.log('Message sent: ' + info.response);
                 }
                 });
                 }
                 });
                 }
                 });
                 }
                 });
                 }
                 });*/

            } else {
                res.redirect('/admin/moderate');
            }

        } else {
            res.redirect('/admin/moderate');
        }

    });


};

exports.photoCancel = function (req, res, app) {

    var collection = app.db.collection('user');

    console.log(req.body);
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body.id);
    var date = new Date().toJSON();

    collection.findOne({
        _id: o_id,
        validated: true
    }, function (err, user_tmp) {

        if (user_tmp !== null) {

            if (req.body.type === 'public' || req.body.type === 'private') {
                var user = {
                    _id: user_tmp._id,
                    email: user_tmp.email,
                    nickname: user_tmp.nickname,
                    date_update: date
                };

                user.pictures = user_tmp.pictures;
                user.pictures[req.body.type][req.body.number]={};

                collection.update({_id: o_id},
                {$set: user}, function (err, doc) {
                    if (doc === null || doc.length === 0) {
                        console.log('validation ko');
                        res.contentType('json');
                        res.send({result: false});
                    } else {
                        console.log('validation ok');
                        
                        res.contentType('json');
                        res.send({result: true});

                        app.transporter.sendMail({
                            from: "L'équipe de nice2meet2 <ne_pas_repondre@n2m2.fr>",
                            to: user.email,
                            subject: "photo refusée n2m2",
                            text: "Cher " + user.nickname + ",\n votre photo a été refusée par notre équipe.\n" +
                                    "Elle ne répond pas aux critères d'acceptation de nice2meet2.\n\n" +
                                    "L'équipe de nice2meet2\n" +
                                    'http://www.n2m2.fr',
                            html:
                                    '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000;">' +
                                    '<div style="background-color:#333333">' +
                                    '<p>' +
                                    '<a href="http://www.n2m2.fr:4000/client' + user.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                                    '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                                    '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Nouvelle plateforme de réservations </span>' +
                                    '<div><img style="width:100%;" src="http://www.n2m2.fr/static/image/bandeau_email.jpg" /></div>' +
                                    '</a>' +
                                    '</p></div>' +
                                    '<p>Cher <b>' + user.nickname + '</b>,</p><br />' +
                                    '<p>Votre photo a été refusée par notre équipe.</p>' +
                                    '<p>Elle ne répond pas aux critères d\'acceptation de nice2meet2.</p><br /><br />' +
                                    '<p><a href="http://www.n2m2.fr">www.n2m2.fr</a></p>' +
                                    '<div style="background-color:#333333; color:#ffffff">' +                                    
                                    '<p><i>L\'équipe de nice2meet2<i></p></div></div></div>'
                        }, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });                

            } else {
                res.redirect('/admin/moderate');
            }

        } else {
            res.redirect('/admin/moderate');
        }

    });


};