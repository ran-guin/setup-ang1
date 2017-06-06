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
      enum: ['public', 'lab', 'research', 'lab admin', 'admin'],
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

    status: {
      type: 'string',
      enum: ['inactive','pending', 'active'],
      defaultsTo: 'pending',
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

  payload : function (user, options) {
      var deferred = q.defer();

      if (!options) { options = {} }
      // generate standard payload 
      var url = sails.config.globals.url;

      var mode = sails.config.environment;
      var connection = undefined;

      var payload = { 
        user: user.name, 
        userid: user.id, 
        alDenteID: user.alDenteID, 
        access: user.access, 
        url: url,
      };

      custom_options = Object.keys(options);
      for (var i=0; i<custom_options.length; i++) {
          payload[custom_options[i]] = options[custom_options[i]]
      }
      
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
      deferred.resolve(payload);
      return deferred.promise;
  },

  get_remote_session : function (session) {
    var deferred = q.defer();

    deferred.reject("No session specifications");
    // replace with logic parsing external session from session parameters... should include security token of some sort for safety

    return deferred.promise;

  }

  remote_session_payload : function (session) {
    // eanble validation based upon a separate UI session (customized session retrieval using 'get_remote_session()' )
    console.log("Validate: " + session);

    var deferred = q.defer();

    User.get_remote_session(session)
    .then ( function (remote) {
     // Try to look up user using the provided email address
      User.findOne(remote.user, function foundUser(err, user) {

        if (err) { deferred.reject(err) }

        else if (!user || (user == 'undefined') ) { 
          console.log("Unrecognized User: " + username + '/' + userid);
          var err = new Error('unrecognized user: ' + username + '/' + userid);
          deferred.reject(err);
        }
        else {
          console.log("remote access granted");
          User.payload(user)
          .then (function (payload) {

            payload['remote_login'] = remote.info;
            // session authorization
         
            console.log("resolve remote payload: " + JSON.stringify(payload));
            deferred.resolve(payload);
          })
          .catch ( function (err) {
            console.log("Error generating payload");
            deferred.reject(err);
          });
        }
      });            
    })
    .catch ( function (err) {
      var err = new Error('session not validated');
      deferred.reject(err);      
    })
        
    return deferred.promise;
  }

  validate : function  (tryuser) {
    // customizable ... 
    var deferred = q.defer();

    // , user.FK_Employee__ID as alDenteID

    var query = "SELECT user.id, user.name, encryptedPassword, email, user.access FROM user"
    + " WHERE email ='" + tryuser + "' OR user.name = '" + tryuser + "'" 
    + " GROUP BY user.id";

    console.log("Q: " + query);
    Record.query_promise(query)
    .then (function (result) {
      deferred.resolve(result);
    })
    .catch ( function (err) {
      deferred.reject(err);
    })
    return deferred.promise;
  },

  // Note:  additional custom key values (besideds id, name, password, email & access) in query above should match custom key values provided below 

  validate_registration : function (data) {

    var deferred = q.defer();

    deferred.resolve([{ }]);   // may be used to retrieve external id referenced via a different database or table 

    // Note: ( key / value pair will be included in payload) ... 

    return deferred.promise;

  },


};

