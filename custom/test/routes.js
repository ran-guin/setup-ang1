/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/
 ////////////////////////////////////////////////////////////
  // Server-rendered HTML webpages
  ////////////////////////////////////////////////////////////

  'GET /signup': {view: 'customize/SignUp'},

  ////////////////////////////////////////////////////////////
  // JSON API
  ////////////////////////////////////////////////////////////
  
  '/': 'UserController.home',

  '/public' : { view: 'customize/public'},
  '/contact' : { view: 'customize/ContactUs'},

  '/about'   : { view: 'customize/About' },

  '/page1': { view: 'customize/Page1'},
  '/page2': { view: 'customize/Page2'},

  // User enrollment + authentication
  'POST /signup': 'UserController.signup',

  'GET /login': 'UserController.login',
  'POST /login': 'UserController.login',

  'POST /get_new_password' : 'UserController.getNewPassword',
  'POST /reset_password' : 'UserController.resetPassword',

  'GET /logout': 'UserController.logout',

  'POST /log/:level' : 'LoggerController.log',

  'GET /demo' : 'MainController.showDemoPage',

  // Home page 
  'GET /dash': 'UserController.dashboard',

  // Default User pages 
  'GET /user/dashboard/:id': 'UserController.dashboard',
  //'GET /user/:id': 'UserController.dashboard',  // reserve for waterline standard 


  'GET /': { view: 'customize/public_home' },
  'GET /home': 'UserController.home',

  /* Generic Record control options */

  'GET /record/list/:model' : 'RecordController.list',   
  'POST /record/list' : 'RecordController.list',    
  'GET /record/view/:model/:id' : 'RecordController.view',
  
  'GET /record/edit/:model/:id': 'RecordController.form',
  'POST /record/edit/:model/:id': 'RecordController.update',
  'POST /record/update/:model/:id': 'RecordController.update',


  'GET /attribute/:model/:attribute' : 'AttributeController.prompt',

  'GET /remote_login' : 'Remote_login.validate',
  'POST /remote_login' : 'Remote_login.validate',
  'GET /remote_login/test' : 'Remote_login.test',
  'POST /remote_login/test' : 'Remote_login.test',
  
  'GET /remote_login/validate' : 'Remote_login.validate',
  'POST /remote_login/validate' : 'Remote_login.validate',

  'GET /admin' : 'UserController.admin',
  'GET /lab_admin' : 'UserController.lab_admin',
  'POST /User/activate' : 'UserController.activate',
  
  'GET /test'  : 'TestController.test',
  'POST /test'  : 'TestController.test',

  'GET /record/add/:model': 'RecordController.form',

// API routes 
  'GET /lookup/:model/:label' : 'Record_APIController.lookup',
  'GET /lookup/:model' : 'Record_APIController.lookup',

  'POST /enum/:model/:field' : 'Record_APIController.enum',
  'GET /enum/:model' : 'Record_APIController.enum',

  'POST /remoteQuery': 'Record_APIController.remoteQuery',

  'POST /Record/search' : 'Record_APIController.search',
  'GET /Record/search' : 'Record_APIController.search',

  'POST /record/add/:model': 'Record_APIController.save',
  'POST /record/save' : 'Record_APIController.save',

  'GET /barcode/print/:model/:ids' : 'BarcodeController.print_Labels',

  'GET /parseMetaFields' : 'Record_APIController.parseMetaFields',
  'POST /parseMetaFields' : 'Record_APIController.parseMetaFields',

  'POST /uploadData' : 'Record_APIController.uploadData',

  'GET /test' : 'TestController.test',
  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  // Demo Pages 
  'GET /demo/test': 'DemoController.test',
  'GET /demo/patient': 'DemoController.patient',
  'GET /demo/clinic': 'DemoController.clinic',
  'GET /demo/appointment': 'DemoController.appointment',

  'POST /attributes/increment' : 'AttributeController.increment',

  'POST /scan-barcode' : 'BarcodeController.scan',
  'GET /scan-barcode' : 'BarcodeController.scan',
}
