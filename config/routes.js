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

  'GET /rebuildFK' : 'RecordController.build_FK',

  'GET /record/list/:model' : 'RecordController.list',   
  'POST /record/list' : 'RecordController.list',    
  'GET /record/view/:model/:id' : 'RecordController.view',
  
  'GET /record/edit/:model/:id': 'RecordController.form',
  'POST /record/edit/:model/:id': 'RecordController.update',
  'POST /record/update/:model/:id': 'RecordController.update',
  // limited access ...
  'GET /record/dump/:model': 'RecordController.record_dump',
  'POST /record/dump': 'RecordController.record_dump',

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
  'GET /validate/:model' : 'Record_APIController.validate',
  'POST /validate' : 'Record_APIController.validate',  

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


  'GET /help/:string' : 'HelpController.find',
  'POST /help' : 'HelpController.find',

  'POST /remote_log' : 'Custom_API.remote_log',

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
  'POST /uploadMatrix' : 'ContainerController.uploadMatrix',

  'POST /alDente_protocol' : 'Remote_login.protocol',
  
  'POST /uploadFile' : 'AttributeController.uploadAttributes',

  'POST /transfer' : 'ContainerController.transfer',

  'GET /xfer' : 'ContainerController.transfer',  
  'POST /xfer' : 'ContainerController.completeTransfer',

  'GET /Container/history' : 'ContainerController.history',
  'GET /Container/summary' : 'ContainerController.summary',

  'POST /plate_set/save' : 'Plate_setController.save_next_set',

  'POST /Rack/newBox'  : 'RackController.createBox',
  'POST /Rack/boxData' : 'RackController.boxData',

  'POST /Stock/receive' : 'StockController.receive',
  'GET /Stock/receive' : 'StockController.receiveForm',

  'GET /Stock/received' : 'StockController.received',

  // Custom Pages 

  'GET /demo/protocol': 'DemoController.protocol',
  'GET /protocol_step/edit/:id' : 'Lab_protocolController.edit_step',
  'GET /lab_protocol/edit/:id' : 'Lab_protocolController.edit',
  'POST /protocol_step/update'  : 'Lab_protocolController.update_step',
  'POST /lab_protocol/update'  : 'Lab_protocolController.update',

  'GET /Lab_protocol/addStep/:id/:step'    : 'Custom_APIController.add_step',


  // Demo Pages 
  'GET /demo/test': 'DemoController.test',
  'GET /demo/patient': 'DemoController.patient',
  'GET /demo/clinic': 'DemoController.clinic',
  'GET /demo/appointment': 'DemoController.appointment',


  'GET /Lab_protocol/new' : 'Lab_protocolController.define',
  '/Lab_protocol/save' : 'Lab_protocolController.save',
  '/Lab_protocol/view/:id' : 'Lab_protocolController.view',
  '/Lab_protocol/demo/:id' : 'DemoController.protocol',
  '/Lab_protocol/list' : 'Lab_protocolController.list',
  '/Lab_protocol/run'  : 'Lab_protocolController.run',
  
  'POST /Lab_protocol/complete-step' : 'Lab_protocolController.complete',

  'POST /attributes/increment' : 'AttributeController.increment',

  'POST /scan-barcode' : 'BarcodeController.scan',
  'GET /scan-barcode' : 'BarcodeController.scan',

  //'POST /completed-step' : 'Lab_protocolController.complete',

  // OVID Clinic Pages

  'GET /api': 'QueryController.staff',
  'GET /api/q': 'QueryController.query',

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
