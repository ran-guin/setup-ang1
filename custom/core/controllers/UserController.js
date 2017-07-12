/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/*
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var q = require('q');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
*/

var bodyParser = require('body-parser');
// var Logger = require('../services/logger');

module.exports = {
  /**
   * Check the provided email address and password, and if they
   * match a real user in the database, sign in to Activity Overlord.
   */

  dashboard: function (req, res) {
    var body = req.body || {};
    var id = req.param('id') || body.id;
    
    console.log('sess: ' + JSON.stringify(req.session));
    console.log('params : ' + JSON.stringify(req.session.params));

    if (req.session && req.session.params  && req.session.params && req.session.params.user) {
      var page = req.session.params.defaultPage || 'homepage';
      res.render('customize/User', req.session.params );
    }
    else if (req.payload && req.payload.user) {
        var user_id = req.payload.user;
        res.render('customize/User', req.payload);
    }
    else if (req.session && req.session.payload && req.session.payload.user) {
      var user_id = req.session.payload.user;
      res.render('customize/User', req.session.payload)
    }
    else {
      console.log("No user defined ... default to public homepage");
      res.render('customize/public_home', {message: "No user defined ... default to public homepage"});
    }
  },

  login: function (req, res) {

    var body = req.body || {};
    console.log("BODY: " + JSON.stringify(body));

    var tryuser = body.user || body.email;
    var pwd = body.password || req.param('password');
    var printer_group = body.printers;

    console.log('attempt login by ' + tryuser);

    var warning = null;
    if (req.session && req.session.payload) {
      if (req.session.payload.userid) {
        if (req.session.payload.user === tryuser) {
          warning = req.session.payload.user + " is still logged on in another window (okay)";
        }
        else {
          warning = req.session.payload.user + " was still signed in !  Please ensure users log out when finished with session.";
        }
        console.log(warning)
      }
    }
    console.log("Session: ?" + JSON.stringify(req.session));

    var Passwords = require('machinepack-passwords');

    // Try to look up user using the provided email address
    // User.findOne({

    //email: tryuser
    //})
    //.exec (function (err, results) { 

    User.validate(tryuser)
    .then (function (results) {

      if (!results || (results == 'undefined') ) { 
        return res.render("customize/public_login", {error: "Unrecognized user: '" + tryuser + "'", warning: warning, email: tryuser });
      }
      var user = results[0];

      if (user == undefined) { 
        return res.render("customize/public_login", { error: "User not found.  Try again or Register for an account", warning: warning});
      }

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
      console.log('Grps: ');
      console.log("Confirming password for " + JSON.stringify(user));
      console.log("compare " + pwd + ' to ' + user.encryptedPassword);

      if (!user.encryptedPassword) {
        return res.render("customize/public_login", {error: "User has not set up password.  Please see admin.", warning: warning});
      }

      Passwords.checkPassword({
        passwordAttempt: pwd,
        encryptedPassword: user.encryptedPassword
      }).exec({
        error: function (err){
          console.log("error: " + err);
          return res.negotiate(err);
        },

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        incorrect: function () {
          console.log("incorrect password");
          return res.render("customize/public_login", {error: "Incorrect user/password... try again...", warning: warning});
        },

        success: function (){
          console.log("access granted");
          User.payload(user, { printer_group : printer_group })
          .then ( function (payload) {
            if ( req.param('Debug') ) { payload['Debug'] = true; }

            // session authorization
            req.session.authenticated = true;
            req.session.payload = payload;

            var access = payload.access;
            // token authorization 
            payload['token'] = jwToken.issueToken(payload); 
            req.headers.authorization = "Bearer [" + payload['token'] + ']';

            sails.config.payload = payload;
            sails.config.messages = [];
            sails.config.warnings = [];
            sails.config.errors   = [];

            if (!access || access === 'public') {
              // // Logger.info('access denied', 'login');
              return res.render('customize/public_home', { 'message' : 'Access still pending approval by Administrator'});
            } 
            else {
              payload['warning'] = warning;
              return res.render('customize/private_home', payload);     
            }
          })
          .catch ( function (err) {
            console.log('access problem');
            return res.render('customize/public_home', { error: 'Error generating payload ' + err});
          });


        }
      });
    })
    .catch ( function (err) {
      return res.negotiate(err);      
    });

  },

  changePrinters : function (req, res) {
    return res.render('customize/changePrinters', req.session.payload);
  },

  lab_admin : function (req, res) {
    return res.render('lims/Lab_Admin', req.session.payload);

  },

  admin : function (req, res) {
    return res.render('customize/Admin', req.session.payload);

  },

  activate : function (req, res) {
    var body = req.body || {};

    var user = body.user || {};
    var userid = user.id;
    var status = user.status;
    var access = user.access;

    Record.update('user', [userid], { status : status, access : access})
    .then (function (response) {
      return res.json({ id: userid, status : status, access : access});
    })
    .catch (function (err) {
      console.log('could not activate user');
      return res.json(err);
    });
    
  },

  home : function (req, res) {
    
    Record.reset_messages();

    console.log("Payload = " + JSON.stringify(req.session.payload));

    if ( req.session.payload && req.session.payload.user) {
      if (! req.session.payload.access || req.session.payload.access === 'public') {
        return res.render('customize/public_home', {message: 'No valid user with access privileges'} );
      }
      else {
        return res.render('customize/private_home', req.session.payload);
      }
    }
    else {
      Config.printer_groups()
      .then ( function (printers) {
        console.log("Loaded Printer Groups " + JSON.stringify(printers));
        return res.render('customize/public_home', { printers : printers });
      })
      .catch ( function (err) {
        return res.render('customize/public_home');
      });
    }

  },


  /**
  * Sign up for a user account. ... may customized via 'User.validate_registratio' to require link to external D ...
  */
  signup: function(req, res) {
    var body = req.body || {};

    var user = body.user || body.name;
    var email = body.email ;

    var pwd = body.password;
    var pwd2 = body.confirm_password;

    console.log('signup...');
    var Passwords = require('machinepack-passwords');
    var Gravatar = require('machinepack-gravatar');

    // Encrypt a string using the BCrypt algorithm.
    Passwords.encryptPassword({
      password: pwd,
      difficulty: 10,
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        return res.negotiate(err);
      },
      // OK.
      success: function(encryptedPassword) {
        console.log('ok...');
        Gravatar.getImageUrl({
          emailAddress: email
        }).exec({
          error: function(err) {
            return res.negotiate(err);
          },
          success: function(gravatarUrl) {
          // Create a User with the params sent from
          // the sign-up form --> signup.jade
            console.log("Create new user : " + user);
                    
            Config.printer_groups()
            .then (function (printers) {

              var data = {
                name: user,
                email: email,
                encryptedPassword: encryptedPassword,
                lastLoggedIn: null,
                gravatarUrl: gravatarUrl,
                access: 'public',
              };

              console.log('.. validate registration');
              User.validate_registration(data)
              .then ( function (result) {

                if (result.length === 1) {

                  var custom_keys = Object.keys(result[0]);

                  var url;
                  if (sails.config && sails.config.globals) {
                    url = sails.config.globals.url;
                    console.log("URL: " + sails.config.globals.url);
                  }

                  var payload = { access: 'New User', url: url };

                  for (var i=0; i<custom_keys.length; i++) {
                      var key = custom_keys[i];
                      var val = result[0][key];

                      if (key) {
                        data[key] = val;
                        payload[key] = val;
                      }
                  }

                  console.log('add user record...');
                  console.log(JSON.stringify(data));

                  Record.createNew('user', data, {}, payload)
                  .then (function (result) {

                      if (req.session) { req.session.User = result.insertId }
                      
                      payload.id =  result.insertId;
                      var token = jwToken.issueToken(payload);
                      
                      sails.config.messages.push("Generated new user successfully [ name: '" + user + "'; id: " +  result.insertId + ' ]');

                      console.log('Generated new user: ' + JSON.stringify(payload));
                      
                      req.session.token = token;

                      return res.render('customize/public_home', { 
                        printers : printers, 
                        message: "Registered.  Access pending approval by administrator" ,
                      });                                          
                  })
                  .catch ( function (err) {
                     return res.render('customize/public_home', { printers : printers, error : "Problem adding user..." }); 
                  });
                }
                else if (result.length === 0) {
                  return res.render('customize/public_home', {  printers : printers, error : "no valid reference user - please see administrator" })
                }
                else if (result.length > 1) {
                  return res.render('customize/public_home', {  printers : printers, 
                    error : "multiple reference users - please see administrator" });                
                }

              })
              .catch (function (err) {
                console.log("Error validating user");
                console.log('could not retrieve external refefrence ID');
                return res.render('customize/public_home', {  

                  printers : printers, 
                  error : "could not retrieve external reference ID to create user"
                }); 
              });
            })
            .catch( function (err) {
              console.log("Error presetting printer groups - set to empty if not being used");
              return res.render('customize/public_home', { error : "Please have administrator reset or clear printer groups (undefined)"} ); 
            });
          }
        });
      }
    });

  },

  getNewPassword: function (req, res) {
    console.log("Reset Password...");
    var body = req.body || {};
    var validated = body.oldpassword || 'null';
    return res.render('customize/ResetPassword', { oldpassword : validated });
  },

  resetPassword: function (req, res) {

    var body = req.body || {};

    var password = body.password;
    var confirmed = body.confirm_password;

    if (password && confirmed && password === confirmed) {
        Passwords.encryptPassword({
        password: password,
        difficulty: 10,
      }).exec({    
        error: function(err) {
          return res.negotiate(err);
        },
        // OK.
        success: function(encryptedPassword) {
          Record.query_promise("UPDATE user SET encryptedPassword = '" + encryptedPassword + "'")
          .then ( function (result) {

          })
          .catch ( function (err) {
            // Logger.warning(err, 'could not reset password', 'resetPassword');
            return res.negotiate("Error updating new password");
          });
        }
      });
    }
    else {
      return res.negotiate("Password and confirmation not valid");
    }
  },

  /**
   * Log out *
   * (wipes `me` from the sesion)
   */
  logout: function (req, res) {

    /*
    
    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.User)
    User.findOne(req.session.User, function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If session refers to a user who no longer exists, still allow logout.
      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists.');
        return res.render('customize/public_home');
      }
    
    */

      // Wipe out the session (log out)
      req.session.destroy();
      // req.session.User = null;

      Config.printer_groups()
      .then (function (result) {
        return res.render('customize/public_home', { printers : result } );
      })
      .catch ( function (err) {
        return res.render('customize/public_home' );
      });

      // Either send a 200 OK or redirect to the home page

    // });
  }
	
};

