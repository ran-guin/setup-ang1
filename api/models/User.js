/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    // The user's full name
    // e.g. Nikola Tesla
    name: {
      type: 'string',
      required: true
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
      required: true
    },

    // The timestamp when the the user last logged in
    // (i.e. sent a username and password to the server)
    lastLoggedIn: {
      type: 'date',
      required: true,
      defaultsTo: new Date(0)
    },

    // url for gravatar
    gravatarUrl: {
      type: 'string'
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

  payload : function (id, access) {
      // generate standard payload 
      var url = sails.config.globals.url;

      var payload = { user: id, access: access, url: url};
      return payload;
  }


};

