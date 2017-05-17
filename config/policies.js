/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  //'*': true,
  'test' : {
    '*' : true
  },
  
  'public_API' : {
    '*' : true
  },

  'main' : {
    'showDemoPage' : true
  }, 

  'demo' : {
      '*' : true
  },
  
  'public' : {
	'*' : true,
  },
 
  'rack' : { 
    'wells' : true, 
  }, 

  'barcode' : {
    'print_Labels' : true,
  },

  /*
  session: {
      'create' : true,
      'login' : true,
  },
*/
  record_API: {
    'lookup' : true,
    'enum'   : 'reset',
    'search' : true,
    'validate' : true,
  },

  record: {
      '*' : true, 
      'lookup' : true,
      'enum' : 'reset',
  },

  record_API: {
    '*' : true,
  },

  user: {
      'create' : 'reset',
      'login'  : 'reset',
      'signup' : 'reset',
      'logout' : 'reset',
      'home' : 'reset',   // sessionAuth',
	     'dashboard'	: "sessionAuth",
       'getNewPassword' : 'reset',	
//      '*' : "sessionAuth"
  },
  
  'rack' : {
    'boxData' : true,
  },

  //'lab_protocol' : 'sessionAuth",

  'attribute' : {
      'list' : true,
      'create' :  true, // ['tokenAuthorized']
      'save' : true,
  },

//  '*': ['tokenAuthorized'],
  'remote_login' : {
    '*' : true,
    'test' : true,
    'validate' : true,
  },

  // enable testing during development mode 
  test: {
      'test' : 'reset'
  },

  //'*' : ['sessionAuth'],
  '*' : 'sessionAuth',

  'container': {
    'history' : true,
    'summary' : true,
    'storage_history' : true,
  }

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
