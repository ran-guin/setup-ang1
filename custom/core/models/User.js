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

    interests : {
      collection: 'interest',
      via: 'members'
    },

    activities : {
      collection: 'activity',
      via: 'members'
    },

    skills: {
      collection: 'skill',
      via: 'candidates'
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

};

