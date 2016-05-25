/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bcrypt = require('bcrypt');

module.exports = {
        'new': function(req, res) {
                console.log("Err:" + JSON.stringify(req.session.flash));
                res.view('session/new');
        },

        create: function(req, res, next) {
                console.log('Initializing Session...');
                // Check for email and password in params sent via the form, if none
                // redirect the browser back to the sign-in form.
                if (!req.param('email') || !req.param('password')) {
                        // return next({err: ["Password doesn't match password confirmation."]});

                        var usernamePasswordRequiredError = [{
                                name: 'usernamePasswordRequired',
                                message: 'You must enter both a username and password.'
                        }]

                        // Remember that err is the object being passed down (a.k.a. flash.err), whose value is another object with
                        // the key of usernamePasswordRequiredError
                        req.session.flash = {
                                err: usernamePasswordRequiredError
                        }
                        console.log("Err:" + JSON.stringify(req.session.flash));
                        res.redirect('/session/new');
                        return;
                }

                // Try to find the user by there email address. 
                // findOneByEmail() is a dynamic finder in that it searches the model by a particular attribute.
                // User.findOneByEmail(req.param('email')).done(function(err, user) {
                User.findOneByEmail(req.param('email'), function foundUser(err, user) {
                        if (err) return next(err);

                        // If no user is found...
                        if (!user) {
                            
                                console.log("User not found...");
                                var noAccountError = [{
                                        name: 'noAccount',
                                        message: 'The email address ' + req.param('email') + ' not found.'
                                }]
                                req.session.flash = {
                                        err: noAccountError
                                }
                        //      return res.view('session/new', { flash : req.session.flash, Errors : [req.session.flash.err]  });
                                console.log("Err:" + JSON.stringify(req.session.flash));
                                res.redirect('/session/new');
                                return;
                        }

                        // Compare password from the form params to the encrypted password of the user found.
                        bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
                                if (err) return next(err);

                                // If the password from the form doesn't match the password from the database...
                                if (!valid) {
                                        var usernamePasswordMismatchError = [{
                                                name: 'usernamePasswordMismatch',
                                                message: 'Invalid username and password combination.'
                                        }]
                                        req.session.flash = {
                                                err: usernamePasswordMismatchError
                                        }
                                        console.log("Err:" + JSON.stringify(req.session.flash));
                                        res.redirect('/session/new');
                                        return;
                                }

                                // Log user in
                                

                                req.session.authenticated = true;
 //                               req.session.Session.User = user;

//                               req.session.User.encryptedPassword = null;   // track all attributes EXCEPT password... 
                                var Session = { 
                                    User : user,
                                    defaultPage: 'user/User',
                                    url:  "http://limsdev06.bcgsc.ca:6843",
                                }

                                console.log("Set Session Parameters from Session Controller");
                                req.session.User = user;
                                req.session.params = Session; 
    
                                // Change status to online
                                user.online = true;
                                user.save(function(err, user) {
                                        if (err) return next(err);

                                        // Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
                                        User.publishUpdate(user.id, {
                                                loggedIn: true,
                                                id: user.id,
                                                name: user.name,
                                                action: ' has logged in.'
                                        });


                                        // If the user is also an admin redirect to the user list (e.g. /views/user/index.jade)
                                        // This is used in conjunction with config/policies.js file
                                        if (user.access && user.access.match('Admin')) {
                                            res.redirect('/user');
                                            return;
                                        }

                                        //Redirect to their profile page (e.g. /views/user/show.jade)
                                        res.redirect('/user/dashboard/' + user.id);
                                        return;
                                });
                        });
                });
        },

        destroy: function(req, res, next) {

                User.findOne(req.session.User.id, function foundUser(err, user) {

                        var userId = req.session.User.id;

                        if (user) {
                                // The user is "logging out" (e.g. destroying the session) so change the online attribute to false.
                                User.update(userId, {
                                        online: false
                                }, function(err) {
                                        if (err) return next(err);

                                        // Inform other sockets (e.g. connected sockets that are subscribed) that the session for this user has ended.
                                        User.publishUpdate(userId, {
                                                loggedIn: false,
                                                id: userId,
                                                name: user.name,
                                                action: ' has logged out.'
                                        });

                                        // Wipe out the session (log out)
                                        req.session.destroy();

                                        // Redirect the browser to the sign-in screen
                                        console.log('reset 2');
                                        res.redirect('/session/new');
                                });
                        } else {

                                // Wipe out the session (log out)
                                req.session.destroy();

                                // Redirect the browser to the sign-in screen
                                console.log('reset 1');
                                res.redirect('/session/new');
                        }
                });
        }	
};

