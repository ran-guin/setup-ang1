/**
 * TestController
 *
 * @description :: Server-side logic enabling quick tests (eg test views dynamically) 
 */

module.exports = {
  /**
   * Check the provided email address and password, and if they
   * match a real user in the database, sign in to Activity Overlord.
   */

  test: function (req, res) {
    var option = req.param('option') || 'Test';
    console.log('Option: ' + option);
    
    res.render(option);
  },
	
};

