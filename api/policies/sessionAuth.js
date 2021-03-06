/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.authenticated) {
    console.log("session authenticated");
    sails.config.messages = [];  // clear messages 
    sails.config.warnings = [];  // clear messages 
    sails.config.errors = [];  // clear messages 
    console.log('clear messages...');
    console.log("Auth Payload: " + JSON.stringify(req.session.payload));
    return next();
  }
  else {
        // User is not allowed
        var requireLoginError = [{name: 'requireLogin', message: "you must be signed in"}];
          req.session.flash = { err: requireLoginError };
        
        console.log('session authentication required');

        res.redirect('/logout');
        return;
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  // return res.forbidden('You are not permitted to perform this action.');
};
