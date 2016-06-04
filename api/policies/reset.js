/**
 * reset - simply resets messages (allows access to public)
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
    console.log("public access allowed");
    sails.config.messages = [];  // clear messages 
    sails.config.warnings = [];  // clear messages 
    sails.config.errors = [];  // clear messages 

    return next();
};
