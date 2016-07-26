/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var request = require('request');

module.exports = {

  viewFields : ['id','name','createdAt'],

  attributes: {
    // The user's full name
    // e.g. Nikola Tesla
    name: {
      type: 'string',
      required: true
    },

    FK_Employee__ID : { type : 'int' }, // legacy reference to alDente ID .. 

    access: {
      type: 'string',
      enum: ['public', 'lab', 'research', 'admin'],
      defaultsTo: 'lab',
    },

    // The user's email address
    // e.g. nikola@tesla.com
    email: {
      type: 'email',
      required: true,
      unique: true
    },

    // The encrypted password for the user
    // e.g. asdgh8a249321e9dhgaslcbqn2913051#T(@GHASDGA
    encryptedPassword: {
      type: 'string',
      //required: true
    },

    // The timestamp when the the user last logged in
    // (i.e. sent a username and password to the server)
    lastLoggedIn: {
      type: 'date',
      defaultsTo: new Date(0)
    },

    // url for gravatar
    gravatarUrl: {
      type: 'string'
    },

    groups : {
      collection: 'grp',
      via: 'members'
    },

    beforeCreate: function(values, next) {
        // ensure pwd matches confirmation pwd 
        if (!values.password || values.password != values.confirmation) {
            return next( { err: "Password doesn't match confirmation"} );
        }
        require('bcrypt').hash(values.password, 10, function passwordEncrypted(err, encryptedPassword) {
            if (err) { return next(err) }
            values.encryptedPassword = encryptedPassword;
            next();
        });
    },

    // Override toJSON instance method to hide password
    toJSON: function() {
      var obj = this.toObject();
      delete obj.encryptedPassword;
      return obj;
    }
  },

  initData : [
    { name : 'Admin', email : 'admin@domain.com' },
    { name : 'DemoUser', email: 'demo@domain.com' },
    { name : 'Guest', email : 'guest@domain.com' },
  ],

  payload : function (user, access) {
      // generate standard payload 
      var url = sails.config.globals.url;

      var mode = sails.config.environment;
      var connection = undefined;

      var payload = { user: user.name, userid: user.id, alDenteID: user.alDenteID, access: user.access, url: url};
      
      if (mode) {
        payload['mode'] = mode;

        var connections = sails.config.connections;
        var conn  = sails.config.models.connection;
        var connection = connections[conn];

        if (connection) {
          host = connection.host;
          db   = connection.database;
          db_user   = connection.user;
        
          payload['db'] = db;
          payload['db_user'] = db_user;
          payload['host'] = host;
        }
      }

      return payload;
  },

  alDente_verification : function (session) {
    console.log("Validate: " + session);

    var deferred = q.defer();

    var url = "http://bcgpdev5.bccrc.ca/SDB/cgi-bin/barcode.pl?Validate=1&Session=" + session;
 
    if (session) {
      console.log('get request...' + url);
      request.get( url , function (err, result) {
        if (err) { deferred.reject(err) }
        else if (result && result.body) {     
          
          var found = result.body.match(/Validated Session: {.+?}/);

          if (found && found.length) {

            var sessionInfo = found[0].replace('Validated Session: ','');
            console.log("session Info: " + sessionInfo);

            var username = '';
            var userid   = '';
            var remote_login = sessionInfo;

            if (sessionInfo.match(/nobody/)) {
              console.log("FAILED TO FIND USER");
              sessionInfo = "{ 'username' : 'Ran', 'userid' : '4' }";
              username = 'Ran';
              userid   = 4;
            }

            // Validate User on LITMUS //
            
            // Try to look up user using the provided email address
            User.findOne({ name: username }, function foundUser(err, user) {

              if (err) { deferred.reject(err) }

              else if (!user || (user == 'undefined') ) { 
                console.log("Unrecognized User: " + username + '/' + userid);
                deferred.reject("unrecognized user: " + username);
              }
              else {
                console.log("remote access granted");
                var payload = User.payload(user, 'Login Access (TBD)');
                payload['remote_login'] = remote_login;
                // session authorization

                console.log("Create remote login record");
                
                console.log("resolve: " + JSON.stringify(payload));
                deferred.resolve(payload);
              }
            });            
          }
          else {
            deferred.reject('Not validated');
          }
        }
        else { 
          deferred.reject("no validation body found");
        }
      });
    }
    else {
      deferred.reject('no session provided');
    }

    return deferred.promise;
  }

};

