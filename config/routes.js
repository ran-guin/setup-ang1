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

  'GET /signup': {view: 'signup'},

  ////////////////////////////////////////////////////////////
  // JSON API
  ////////////////////////////////////////////////////////////
  
  '/': 'DemoController.home',

  '/public' : { view: 'core/public'},
  '/contact' : { view: 'core/ContactUs'},

  '/page1': { view: 'core/Page1'},
  '/page2': { view: 'core/Page2'},

  // User enrollment + authentication
  'POST /signup': 'UserController.signup',
  'GET /login': 'UserController.login',
  'GET /logout': 'UserController.logout',

  'GET /demo' : 'MainController.showDemoPage',

  // Home page 
  'GET /home': 'MainController.showMainPage',
  'GET /dash': 'UserController.dashboard',

  // Default User pages 
  'GET /user/dashboard/:id': 'UserController.dashboard',
  'GET /user/:id': 'UserController.dashboard',

 'GET /api': 'QueryController.staff',
  'GET /api/q': 'QueryController.query',
  'POST /api/search': 'QueryController.search',

  'GET /': { view: 'core/public' },
  'GET /homepage': { view: 'core/homepage' },

  /* Generic Record control options */
  'GET /record/add/:model': 'RecordController.new',
  'POST /record/add/:model': 'RecordController.add',
  'GET /record/edit/:model': 'RecordController.edit',
  'POST /record/edit/:model': 'RecordController.update',

  'GET /lookup/:table' : 'RecordController.lookup',

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/
  
  'GET /xfer' : 'ContainerController.transfer',

  // Custom Pages 

  'GET /demo/protocol': 'DemoController.protocol',


  // Demo Pages 
  'GET /demo/test': 'DemoController.test',
  'GET /demo/patient': 'DemoController.patient',
  'GET /demo/clinic': 'DemoController.clinic',
  'GET /demo/appointment': 'DemoController.appointment',


  'GET /Lab_protocol/new' : 'Lab_protocolController.define',
  '/Lab_protocol/save' : 'Lab_protocolController.save',
  '/Lab_protocol/view/:id' : 'Lab_protocolController.view',
  '/Lab_protocol/demo/:id' : 'Lab_protocolController.demo',
  '/Lab_protocol/list' : 'Lab_protocolController.list',

  'POST /scan-barcode' : 'BarcodeController.scan',

  'POST /completed-step' : 'Lab_protocolController.completed',

  // Clinic Pages
  'GET /clinic/home/:id' : 'ClinicController.home',
  'GET /clinic/list': 'ClinicController.list',
  'GET /clinic/edit': 'ClinicController.edit',
  'GET /clinic/add' : 'ClinicController.new',
  'POST /clinic/add' : 'ClinicController.add',
  
  // Appointment Pages
  'GET /appointment/home/:id' : 'AppointmentController.home',

  // Staff Pages
  'GET /staff/load':   'StaffController.load',
  'GET /staff/list':   'StaffController.list',
  'GET /staff/manage': 'StaffController.manage',

  // Patient Pages
  'GET /patient/history/:id' : 'PatientController.loadHistory',

  // Other Custom Pages...
    'GET /cdc/travel/country/:country' : 'CdcController.travel',
    'GET /cdc/travel/region/:region'   : 'CdcController.travel',
    'GET /cdc/side_effects/:vaccine' : 'CdcController.side_effects',
    'GET /cdc/contraindications/:vaccine' : 'CdcController.contraindications',
    'GET /cdc/indications/:risk' : 'CdcController.indications',
    'GET /cdc/regions'          : 'CdcController.regions',
    'GET /cdc/risks' : 'CdcController.risks',

    'GET /travel/recommendations' : 'TravelController.recommendations',
};
