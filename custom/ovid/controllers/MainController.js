/**
 * MainpageController
 *
 * @description :: Server-side logic for managing main page 
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

   showMainPage: function (req, res) {

    // If not logged in, show the public view.
    if (!req.session.User) {
      console.log('public home page');
      return res.view('public');
    }

    // Otherwise, look up the logged-in user and show the logged-in view,
    // bootstrapping basic user data in the HTML sent from the server
    User.findOne(req.session.User, function (err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the main home with an open tab logged-in as that user?');
        return res.view('/signup');
      }

      user.encryptedPassword = null; // do not track password within user object

      var Session = {
        user : user,
        _csrf: req.session.token,
        flash: req.session.flash
      };

      return res.view('/user/dashboard/' + user.id, Session );

    });
  },

  showDemoPage: function (req, res) {

      console.log('public demo page');
      return res.view('demo');
  },

};
