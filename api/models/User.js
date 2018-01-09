var _ = require('lodash');
var q = require('q');
// 
var BaseModel = require("./../../custom/core/models/User.js");
// var BaseModel = require("./Xuser.js");

module.exports = _.merge({}, BaseModel, {

  migrate: 'safe',
  attributes: {

    FK_Employee__ID : { type : 'integer' }, // legacy reference to alDente ID .. 

  },

  alias: {
    external_id: 'FK_Employee__ID'
  },

  monitor: function (session) {
    if (sails.config && sails.config.payload && session && session.payload) {
      if (sails.config.payload.user === session.payload.user) {
        return '';
      }
      else {
        return "POTENTIAL USER CONFLICT - Using " + session.payload.user + ' rather than ' + sails.config.payload.user;
      }
    }
    else {
      return "No payload found in session";
    }
  },

  validate : function  (tryuser) {
    // customizable ... 
    var deferred = q.defer();
   
    var query = "SELECT user.id, user.name, encryptedPassword, email, user.access, user.FK_Employee__ID as external_ID FROM user"
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

  validate_registration : function (data) {

    var email = data.email;

    var deferred = q.defer();

    var get_ID = "SELECT Employee_ID as FK_Employee__ID FROM Employee WHERE Email_Address = '" + email + "'";

    console.log(get_ID);
    Record.query_promise(get_ID)
    .then (function (result) {
      deferred.resolve(result);
    })
    .catch ( function (err) {
      console.log(err);
      deferred.reject(err);
    });
    
    return deferred.promise;
  },


  get_remote_session: function(session) {
    
    var deferred = q.defer();

    // custom session retrieval from different UI
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

            var user_specs = { name: username };
            deferred.resolve({ user: user_specs, info: remote_login} );
          }
          else {
            deferred.reject('no session found');
          }
        }
        else {
          deferred.reject('No session found');
        }
      });
    }
    else {
      deferred.reject('No session provided');      
    }

    return deferred.promise;
  },

});