module.exports = function (app) {
    app.get('/admin/prospect', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/index.twig",
                admin: req.session.admin, url:app.config.url
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.route('/admin/prospect/search')
            .get(function (req, res) {
                if (typeof (req.session.admin) !== 'undefined') {
                    res.render('admin/masterpage_admin.twig', {
                        template: "admin/prospect/search-form.twig",
                        admin: req.session.admin, url:app.config.url
                    });
                } else {
                    res.redirect('/admin');
                }
            })
            .post(function (req, res) {
                //if ((app.config.url + "/admin/prospect/search") === req.headers['referer']) {
                if (typeof (req.session.admin) !== 'undefined') {                    
                    app.prospect.search(req, res, app);
                } else {
                    res.redirect('/admin');
                }
                /*} else {
                 res.redirect('/admin');
                 }*/
            });

    app.get('/admin/prospect/add', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.form(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/prospect/add', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.insert(req, res, app, function(data){
                if(data){
                    res.redirect('/admin/prospect/add/success');
                } else {
                    res.redirect('/admin/prospect/add/failed');
                }
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/add/failed', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/add-failed.twig",
                admin: req.session.admin, url:app.config.url
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/add/success', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/add-success.twig",
                admin: req.session.admin, url:app.config.url
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/update/:id([0-9a-f]{24})', function (req, res) {

        //if ((app.config.url + "/admin/specialty") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.post('/admin/prospect/update', function (req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/prospect/update/failed', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/prospect/update-failed.twig", admin: req.session.admin, url:app.config.url});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/update/success', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/prospect/update-success.twig", admin: req.session.admin, url:app.config.url});
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/prospect/search-nearby', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.searchNearby(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/import-from-csv', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {

            try {
                var file = require('../../pubs.json');

                var tab = {};
                for (var i in file) {
                    var key = file[i].company + file[i].postalcode + file[i].phone;
                    if (typeof (tab[key]) !== 'undefined') {
                        tab[key].email += ',' + file[i].email;
                    } else {
                        tab[key] = file[i];
                    }
                }

                var file = [];
                for (var i in tab) {
                    file.push(tab[i]);
                }
              
                app.prospect.insertFromCSV(req, res, app, file);

            } catch (err) {
                console.log(err);
                res.end();
            }

        } else {
            res.redirect('/admin');
        }
    });

    /* ajax call */
    app.get('/admin/prospect/getProspectWithNoCoordinates', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.getProspectWithNoCoordinates(req, res, app);
        } else {
            res.send(null);
        }
    });

    app.post('/admin/prospect/updateGeolocation', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.updateGeolocation(req, res, app);
        } else {
            res.send(null);
        }
    });

    app.get('/admin/prospect/sanitize-prospect-city', function (req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            app.prospect.sanitizeProspectCity(req, res, app);
        } else {
            res.send(null);
        }
    });

    app.post('/admin/prospect/send-subscription', function (req, res) {
        if (req.session.admin && req.body.email) {
            app.prospect.sendSubscription(req, res, app, app.xss(req.body.email), function(data){
               if(!data) {
                   res.send(null);
               } else {
                   res.send(true);
               }
            });
        } else {
            res.send(null);
        }
    });

    app.get('/admin/prospect/send-email-to-restaurants', function (req, res) {
        //if (typeof (req.session.admin) !== 'undefined') {

        var collection = app.db.collection('prospect');

        collection.find({category: 'Restaurant', email_sent: 1}).limit(1).each(function (err, prospect) {
            if (typeof (prospect) !== 'undefined' && prospect !== null) {

                var url = "http://www.autour2vous.com:4000/client/subscription/" + app.Base64.encode(prospect.email) + '/' + app.Base64.encode(prospect.password);
                
                app.transporter.sendMail({
                    from: "Votre partenaire autour2vous <contact@autour2vous.com>",
                    //to: "contact@n2m2.fr", //prospect.email,
                    to: prospect.email,                    
                    //to:"eric.meou@orange.fr,chabrier.david@orange.fr,backfire_david@hotmail.fr",
                    subject: "vos réservations à partir de 0,50 euros, offre de partenariat",                    
                    html:
                            '<div style="width:100%; font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#fff; background-color:#000;">' +
                            '<div style="background-color:#000"><p><a href="http://www.autour2vous.com" style="text-decoration: none; color:#f62459;font-size: 2em;"><span>autour<span style="color:#ffffff">2</span>vous</span><span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Cliquez c\'est réservé ! </span><div><img style="width:100%;" src="http://www.autour2vous.com/static/image/bandeau_email.jpg" /></div></a></p></div>' +
                            '<div style="text-align:center;"><p>Cher restaurant <b>' + prospect.company + '</b>,</p><br />' +                            
                            '<fieldset style="display: inline;background-color: #fff; color:#000; padding: 20px 5px 20px 5px;margin: 20px 5px 20px 5px;border: 2px dotted #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">' +
                            '<legend style="padding: 5px;color: #fff;background-color: #f62459; color:#fff; width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">Concept</legend>' +
                            '<p style="color:#f62459;">Nouvelle plateforme de réservation qui prend en compte vos besoins :</p>' +
                            '<p>A partir 0,50 € par réservation le midi et 1 € le soir</p>' +
                            '<p>Inscription basée sur la sélection</p><br />' +
                            '<p><b>Reprenez le POUVOIR</b> :</p> <br />' +
                            '<style> li{padding-bottom: 20px;}</style>' +
                            '<ul style="text-align: left; list-style: disc;">' +
                            '<li style="color:#F62459"><b>Offre : </b>Pour les 500 premiers, inscription à vie garantie, aucun abonnement annuel ne vous sera facturé !</li>' +
                            '<li><b>Clarté : </b>payez à la réservation</li>' +
                            '<li><b>Egalité : </b>compte premium pour tous</li>' +
                            '<li><b>Efficacité : </b>modification en temps réel et à volonté de votre fiche</li>' +
                            '<li><b>Simplicité : </b>une interface ergonomique et accessible à tous et toutes sur PC, tablettes et mobiles</li>' +
                            '<li><b>Autonomie : </b>mettez en avant votre établissement autour2vous et restez maître de votre activité</li>' +
                            '<li><b>Solidarité : </b>0,10 € reversé par réservation à l\'association La Mie de Pain</li>' +
                            '</ul>' +
                            '</fieldset>' +
                            '<fieldset style="display: inline;background-color: #fff; color:#000; padding: 20px 5px 20px 5px;margin: 20px 5px 20px 5px;border: 2px dotted #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">' +
                            '<legend style="padding: 5px;color: #fff;background-color: #333;width: 95%;-moz-border-radius: 10px;-webkit-border-radius: 10px;border-radius: 10px;">Inscription</legend>' +
                            '<p>Vos identifiants (à conserver précieusement) concernant la section CLIENT :</p>' +
                            '<p>Email : <span style="color:#F62459">' + prospect.email + '</span></p>' +
                            '<p>Mot de passe : <span style="color:#F62459">' + prospect.password + '</p><br />' +
                            '<p><a href="' + url + '">Cliquez ici pour procéder à l\'inscription</a></p>' +
                            '</fieldset>' +
                            '<br/>' +
                            '<p>Amicalement,</p>' +
                            '<div>' +
                            '<p><i>Votre partenaire</i> <a href="http://www.autour2vous.com" style="text-decoration: none; color:#f62459;font-size: 1em;"><span>autour<span style="color:#ffffff">2</span>vous</span></a></p>' +
                            '<p><i>Tél : 06 18 99 61 66<i></p>' +
                            '<p><i>Tél : 07 88 50 41 57<i></p>' +
                            '</div></div></div>'
                }, function (error, info) {
                    if (error) {
                        console.log(error);
                        console.log("error on _id:", prospect._id, ', email:', prospect.email);
                    } else {
                        console.log('Message sent: ' + info.response);
                        collection.update({_id: prospect._id}, {$set: {email_sent: 1}}, function (err, doc) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("update email_sent:ok, ", prospect._id);
                            }
                        });

                    }
                });
            }
        });


        res.send(true);
        /*} else {
         res.send(null);
         }*/
    });

    app.get('/admin/prospect/send-email-to-pubs', function (req, res) {
        //if (typeof (req.session.admin) !== 'undefined') {

        var collection = app.db.collection('prospect');

        collection.find({category: 'Café/Pub', email_sent: 0}).limit(500).each(function (err, prospect) {
            if (typeof (prospect) !== 'undefined' && prospect !== null) {

                app.transporter.sendMail({
                    from: "Votre partenaire autour2vous <contact@n2m2.fr>",
                    //to:"contact@n2m2.fr",
                    to: prospect.email,
                    subject: "fidélisez vos clients pour seulement 0.99 euro, offre de partenariat",
                    text: "Cher établissement " + prospect.company + ",\n " +
                            "La sortie de autour2vous est proche  ! Augmentez votre chiffre d'affaire en proposant des réductions sur vos consommations." +
                            "\nRéductions : \n" +
                            "Augmentez votre chiffre d'affaire grâce à notre concept." +
                            "\nConcept:\n" +
                            "autour2vous est un nouveau site de rencontre et de sorties nouvelle génération 100% gratuit pour les hommes comme pour les femmes, qui propose à ses utilisateurs de pouvoir allez boire un verre autour de chez eux en quelques clics sur tous les supports : tablettes, smartphones, et applications mobiles." +
                            "Nos utilisateurs voudront venir dans votre établissement pour passer un moment inoubliable. La qualité du service est notre principale préoccupation pour nos utilisateurs." +
                            "\nPartenariat:\n" +
                            "Ce partenariat avec autour2vous va vous permettre de mettre en avant votre établissement sur notre site et ainsi augmenter votre chiffre d'affaire." +
                            "\nComment trouver mon établissement ?\n" +
                            "La publicité de votre établissement est géolocalisée et gratuite. Tous les utilisateurs près de votre établissement ou dans un rayon de plusieurs kilomètres pourront obtenir une réduction chez vous (que vous êtes libres de choisir) sans aucune action particulière de votre part." +
                            "Cela nous permettra de proposer à nos utilisateurs des établissements pour sortir entre amis ou pour une première rencontre." +
                            "\nQue dois-je faire ?\n" +
                            "\nIl vous suffit simplement de souscrire très bientôt à la mise en place de ce partenariat facturée 50 euros HT seulement, qu'une seule fois à l'ouverture du compte. Un e-mail vous sera envoyé prochainement pour vous faire part des modalités." +
                            "\nEnsuite ?\n" +
                            "Tout sera automatisé ! Vous proposez une réduction pour attirer votre client. Par exemple : premier verre à -50%. " +
                            "Ensuite d'un simple clic l'utilisateur obtient son QR Code (code barres 2D). " +
                            "Une fois le client vous présentant son QR Code, vous n'aurez plus qu'à le valider en le scannant avec votre téléphone portable." +
                            "En chaque fin de mois, une facture vous sera envoyée par email qui récapitule " +
                            "le nombre de personnes ayant utilisées leurs QR Code (0,99 euro facturé par personne)\n" +
                            "Nous ne demandons pas de pourcentage sur la note. Votre chiffre d'affaire reste le votre et souhaitons qu'il prospère !  Il n'y a aucun frais caché. Si malheureusement vous n'avez eu aucune réduction de validée pendant un mois donné, aucune facture ne vous sera envoyée." +
                            "\nGardons le contact\n" +
                            "Nous souhaitons que nos utilisateurs soient séduits par votre établissement et renouvelle cette expérience dans un avenir très proche. Nous souhaitons d'autant plus que vous soyez satisfaits par l'affluence que nous comptons vous apporter.\n\n" +
                            "Afin de préparer une approche personnalisée, si vous êtes intéressés par ce partenariat, n'hésitez pas à nous contacter en répondant simplement à cet email," +
                            "votre conseiller se fera un plaisir de revenir vers vous le jour et à l'heure souhaités." +
                            "\n\nAmicalement,\n" +
                            "Votre partenaire autour2vous\n" +
                            'Tél : 06 18 99 61 66\n' +
                            'Tél : 07 88 50 41 57\n' +
                            '\nwww.n2m2.fr/home/email/' + prospect.email + '/',
                    html:
                            '<div style="width:100%;font-family:Verdana, Geneva, Arial, sans-serif; font-size: 1.5em; color:#000000">' +
                            '<div style="background-color:#333333">' +
                            '<p>' +
                            '<a href="http://www.n2m2.fr/home/email/' + prospect.email + '/" style="text-decoration: none; color:#ff00ff;font-size: 2em;">' +
                            '<span>nice<span style="color:#ffffff">2</span>meet<span style="color:#ffffff">2</span></span>' +
                            '<span style="display:block; color: #ffffff; font-style: italic; font-size: 0.5em;">Nouvelle plateforme de réservations </span>' +
                            '<div><img style="width:100%;" src="http://www.n2m2.fr/static/image/bandeau_email.jpg" /></div>' +
                            '</a>' +
                            '</p></div>' +
                            '<div>' +
                            '<p>Cher établissement <b>' + prospect.company + '</b>,</p><br />' +
                            '<p>La sortie de autour2vous est proche  ! Augmentez votre chiffre d\'affaire en proposant des réductions sur vos consommations.</p>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Réductions</legend>' +
                            '<p><b>Augmentez votre chiffre d\'affaire</b> grâce à notre concept.</p>' +
                            '</fieldset>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff"">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Concept</legend>' +
                            '<p>autour2vous est un <b>nouveau site de rencontre et de sorties nouvelle génération 100% gratuit</b> pour les hommes comme pour les femmes, qui propose à ses utilisateurs de pouvoir allez boire un verre autour de chez eux en quelques clics sur tous les supports : tablettes, smartphones, et applications mobiles.</p><br />' +
                            '<p>Nos utilisateurs voudront <b>venir boire un verre dans votre établissement</b> pour passer un <b>moment inoubliable</b>. <b>La qualité du service</b> est notre principale préoccupation pour nos utilisateurs.</p>' +
                            '</fieldset>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff"">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Partenariat</legend>' +
                            '<p>Ce partenariat avec autour2vous va vous permettre de <b>mettre en avant votre établissement</b> sur notre site et ainsi augmenter votre chiffre d\'affaire.</p>' +
                            '</fieldset>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff"">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Comment trouver mon établissement ?</legend>' +
                            '<p><b>La publicité de votre établissement est géolocalisée et gratuite</b>. Tous les <b>utilisateurs près de votre établissement</b> ou dans un rayon de plusieurs kilomètres pourront <b>obtenir une réduction chez vous (que vous êtes libres de choisir)</b> sans aucune action particulière de votre part. Cela nous permettra de proposer à nos utilisateurs des établissements pour <b>sortir entre amis</b> ou pour une <b>première rencontre</b>.</p>' +
                            '</fieldset>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff"">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Que dois-je faire ?</legend>' +
                            '<p>Il vous suffit simplement de <b>souscrire très bientôt</b> à la mise en place de ce partenariat facturée 50 euros HT seulement, qu\'une seule fois à l\'ouverture du compte. Un e-mail vous sera envoyé prochainement pour vous faire part des modalités.</p>' +
                            '</fieldset>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff"">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Ensuite ?</legend>' +
                            '<p><b>Tout sera automatisé</b> ! Vous proposez une réduction pour attirer votre client.</p>' +
                            '<p>Par exemple : premier verre à -50%. Ensuite d\'un simple clic l\'utilisateur obtient son QR Code (code barres 2D). </p>' +
                            '<p>Une fois le client vous présentant son QR Code, vous n\'aurez plus qu\'à le valider en le scannant avec votre téléphone portable.</p>' +
                            '<p>En chaque fin de mois, une facture vous sera envoyée par email qui récapitule le nombre de personnes ayant utilisées leurs QR Code (0,99 euro facturé par personne)</p>' +
                            '<p><b>Nous ne demandons pas de pourcentage sur la note</b>. Votre chiffre d\'affaire reste le votre et souhaitons qu\'il prospère !  Il n\'y a aucun frais caché. Si malheureusement vous n\'avez eu aucune réduction de validée pendant un mois donné, aucune facture ne vous sera envoyée.</p>' +
                            '</fieldset>' +
                            '<fieldset style="background-color: #333333;padding: 5px;margin: 5px;border:2px solid #333; color:#ffffff"">' +
                            '<legend style="border:2px solid #F62459; padding:5px; color:#fff; background-color: #F62459">Gardons le contact</legend>' +
                            '<p>Nous souhaitons que nos utilisateurs soient <b>séduits par votre établissement</b> et <b>renouvelle cette expérience</b> dans un avenir très proche. Nous souhaitons d\'autant plus que vous soyez satisfaits par <b>l\'affluence que nous comptons vous apporter</b>.</p><br />' +
                            '<p>autour2vous souhaite faire bénéficier à nos utilisateurs d\'un verre de bienvenue ou d\'une réduction sur l\'addition ou ce que vous souhaitez. A vous de choisir !</p><br />' +
                            '<p>Afin de préparer une <b>approche personnalisée</b>, si vous êtes intéressés par ce partenariat, n\'hésitez pas à nous contacter en répondant simplement à cet email, <b>votre conseiller</b> se fera un plaisir de revenir vers vous le jour et à l\'heure souhaités.</p>' +
                            '</fieldset>' +
                            '<br/>' +
                            '<p>Amicalement,</p>' +
                            '<div>' +
                            '<p><i>Votre partenaire autour2vous<i></p>' +
                            '<p><i>Tél : 06 18 99 61 66<i></p>' +
                            '<p><i>Tél : 07 88 50 41 57<i></p>' +
                            '<p><a href="http://www.n2m2.fr/home/email/' + prospect.email + '/">www.n2m2.fr</a></p>' +
                            '</div>' +
                            '</div></div>'
                }, function (error, info) {
                    if (error) {
                        console.log(error);
                        console.log("error on _id:", prospect._id, ', email:', prospect.email);
                        res.send(false);
                    } else {
                        console.log('Message sent: ' + info.response);
                        collection.update({_id: prospect._id}, {$set: {email_sent: 1}}, function (err, doc) {
                            if (err) {
                                console.log(err);
                                res.send(false);
                            } else {
                                console.log("update email_sent:ok, ", prospect._id);
                                res.send(true);
                            }
                        });

                    }
                });
            } else {
                res.send(false);
            }
        });                
    });

    app.get('/admin/prospect/checkDuplicatedAddress', function (req, res) {
        if (req.session.admin && req.session.admin.status === 1) {
            app.prospect.checkDuplicatedAddress(req, res, app);
        } else {
            res.send(null);
        }
    });

    app.get('/admin/prospect/generatePassword', function (req, res) {
        if (req.session.admin && req.session.admin.status === 1) {
            console.log('Génération des mot de passe...');
            app.prospect.generatePassword(req, res, app, function (data) {
                if (data) {
                    res.send(true);
                } else {
                    res.send(false);
                }
            });
        } else {
            res.send(null);
        }
    });

};