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
var Logger = require('../services/logger');

module.exports = {
  /**
   * Check the provided email address and password, and if they
   * match a real user in the database, sign in to Activity Overlord.
   */


  dashboard: function (req, res) {
    var id = req.param('id') || req.body.id;
    
    console.log('sess: ' + JSON.stringify(req.session));
    console.log('params : ' + JSON.stringify(req.session.params));

    if (req.session && req.session.params  && req.session.params) {
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

  data: function (req, res) {
    var body = req.body || {};
    var id = body.userid || req.param('id') ;
    
    console.log('userid: ' + id);

    Record.query_promise("Select * from user where id = " + id)
    .then ( function (result) {
      console.log("query results: " + JSON.stringify(result));
      return res.send(result);
    })
    .catch (function (err) {
      return res.send(err);
    })
  },

  login: function (req, res) {

    var body = req.body || {};
    console.log("BODY: " + JSON.stringify(body));

    var tryuser = body.user || body.email;
    var pwd = body.password || req.param('password');
    var printer_group = body.printers;

    console.log('attempt login by ' + tryuser);

    var Passwords = require('machinepack-passwords');

    // Try to look up user using the provided email address
    // User.findOne({

      var query = "SELECT user.id, user.name, encryptedPassword, email, user.access FROM user"
      + " WHERE email ='" + tryuser + "' OR user.name = '" + tryuser + "'" 
      + " GROUP BY user.id";

      console.log("Q: " + query);
      Record.query(query, function (err, results) {
    //email: tryuser
    //})
    //.exec (function (err, results) { 

      if (err) return res.negotiate(err);

      if (!results || (results == 'undefined') ) { 
        return res.render("customize/public_login", {error: "Unrecognized user: '" + tryuser + "'", email: tryuser });
      }
      var user = results[0];

      if (user == undefined) { return res.render("customize/public_login", { error: "User not found.  Try again or Register for an account"} ) }

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
      console.log('Grps: ');
      console.log("Confirming password for " + JSON.stringify(user));
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
          return res.render("customize/public_login", {error: "Incorrect user/password... try again..." });
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
              if (payload.userid) {
                return res.render('customize/private_home', { 'message' : 'Registration pending.  Some features may not be available....' });
              }
              else {
                Logger.info('access denied', 'login');
                return res.render('customize/public_login', { 'message' : 'Private access still pending approval by Administrator'});
              }
            } 
            else {
              return res.render('customize/private_home', payload);     
            }
          })
          .catch ( function (err) {
            Logger.error(err, 'access problem', 'login');
            return res.render('customize/public_login', { error: 'Error generating payload ' + err});
          });


        }
      });
    });

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
      Logger.error(err, 'could not activate user', 'activate');
      return res.json(err);
    });
    
  },

  home : function (req, res) {
    
    Record.reset_messages();

    console.log("Payload = " + JSON.stringify(req.session.payload));

    if ( req.session.payload) {
      return res.render('customize/private_home', req.session.payload);
    }
    else {
      var printers = sails.config.printer_groups || Printer_group.printer_groups;
      console.log("Load Printer Groups " + JSON.stringify(printers));
      return res.render('customize/public_home', { printers : printers });
    }
  },

  /**
   * Sign up for a user account.
   */
  signup: function(req, res) {

    var user = req.body.user ;
    var email = req.body.email ;

    var pwd = req.body.password;
    var pwd2 = req.body.confirm_password;

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
            console.log("Create user : " + user);
            var printers = sails.config.printer_groups || Printer_group.printer_groups;
            console.log("Load Printer groups " + JSON.stringify(printers));

            User.create({
              name: user,
              email: email,
              encryptedPassword: encryptedPassword,
              lastLoggedIn: new Date(),
              gravatarUrl: gravatarUrl,
              access: 'public',
            }, function userCreated(err, newUser) {
              if (err) {

                console.log("err.invalidAttributes: ", err.invalidAttributes)

                // If this is a uniqueness error about the email attribute,
                // send back an easily parseable status code.
                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
                  && err.invalidAttributes.email[0].rule === 'unique') {
                  
                  return res.render('customize/public_home', { printers : printers, error : "Email address already in use" });                      
                  // return res.emailAddressInUse();
                }

                // Otherwise, send back something reasonable as our error response.
                return res.negotiate(err);
              }

              // Log user in
              req.session.User = newUser.id;
              
              console.log("URL: " + sails.config.globals.url);

              var payload = { id: newUser.id, access: 'New User', url: sails.config.globals.url };
              var token = jwToken.issueToken(payload);
              
              sails.config.messages.push("Generated new user... ");

              console.log('Generated new user: ' + JSON.stringify(payload));
              console.log("Token issued: " + token);
              
              req.session.token = token;
          
              return res.render('customize/public_home', {  printers : printers, message : "Registered.  Access pending approval by administrator" })
              //return res.json(200, { user: user, token: token });
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
            Logger.warning(err, 'could not reset password', 'resetPassword');
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
      req.session.User = null;

      var printers = sails.config.printer_groups || Printer_group.printer_groups;
      console.log("Load printer groups " + JSON.stringify(printers));

      // Either send a 200 OK or redirect to the home page
      return res.render('customize/public_home', { printers : printers } );

    // });
  }
	
};

