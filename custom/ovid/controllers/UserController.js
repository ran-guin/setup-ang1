/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * Check the provided email address and password, and if they
   * match a real user in the database, sign in to Activity Overlord.
   */


  dashboard: function (req, res) {
    var id = req.param('id')
    
    console.log('sess: ' + JSON.stringify(req.session));
    console.log('params : ' + JSON.stringify(req.session.params));

    if (req.session && req.session.params  && req.session.params) {
      var page = req.session.params.defaultPage || 'homepage';
      res.render('user/User', req.session.params );
    }
    else if (req.payload && req.payload.user) {
        var user_id = req.payload.user;
        res.render('user/User', req.payload);
    }
    else {
      console.log("No user defined ... default to public homepage");
      res.render('public', {message: "No user defined ... default to public homepage"});
    }
  },

  login: function (req, res) {
  
    var Passwords = require('machinepack-passwords');

    // Try to look up user using the provided email address
    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
        Passwords.checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: user.encryptedPassword
      }).exec({

        error: function (err){
          return res.negotiate(err);
        },

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        incorrect: function (){
          return res.notFound();
        },

        success: function (){

          var payload = User.payload(user.id, 'Login Access (TBD)');
          
          if ( req.param('Debug') ) { payload['Debug'] = true; }

          payload['token'] = jwToken.issueToken(payload); 
          
          return res.render('user/User', payload);
        }
      });
    });

  },

  /**
   * Sign up for a user account.
   */
  signup: function(req, res) {

    console.log('signup...');
    var Passwords = require('machinepack-passwords');
    var Gravatar = require('machinepack-gravatar');

    // Encrypt a string using the BCrypt algorithm.
    Passwords.encryptPassword({
      password: req.param('password'),
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
          emailAddress: req.param('email')
        }).exec({
          error: function(err) {
            return res.negotiate(err);
          },
          success: function(gravatarUrl) {
          // Create a User with the params sent from
          // the sign-up form --> signup.jade
            console.log("Create user : " + req.param('name'));

            User.create({
              name: req.param('name'),
              email: req.param('email'),
              encryptedPassword: encryptedPassword,
              lastLoggedIn: new Date(),
              gravatarUrl: gravatarUrl,
              access: 'new',
            }, function userCreated(err, newUser) {
              if (err) {

                console.log("err.invalidAttributes: ", err.invalidAttributes)

                // If this is a uniqueness error about the email attribute,
                // send back an easily parseable status code.
                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
                  && err.invalidAttributes.email[0].rule === 'unique') {
                  return res.emailAddressInUse();
                }

                // Otherwise, send back something reasonable as our error response.
                return res.negotiate(err);
              }

              // Log user in
              req.session.User = newUser.id;
              
              console.log("URL: " + sails.config.globals.url);
              var payload = { id: newUser.id, access: 'New User', url: sails.config.globals.url };

              var token = jwToken.issueToken(payload);
              
              console.log('Generated new user: ' + JSON.stringify(payload));
              console.log("Token issued: " + token);
              
              req.session.token = token;
              
              return res.json(200, { user: req.param('name'), token: token });

            });
          }
        });
      }
    });

  },

  /**
   * Log out *
   * (wipes `me` from the sesion)
   */
  logout: function (req, res) {

    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.User)
    User.findOne(req.session.User, function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If session refers to a user who no longer exists, still allow logout.
      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists.');
        return res.backToHomePage();
      }

      // Wipe out the session (log out)
      req.session.User = null;

      // Either send a 200 OK or redirect to the home page
      return res.backToHomePage();

    });
  }
	
};

