/**
 * DemoController
 *
 * @description :: Server-side logic for managing demoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');

module.exports = {


    test : function (req, res) {
        console.log("Run Demo Test");

        res.send({"DEMO" : "OKAY"});
    },
    
    patient : function (req, res) {
        console.log("Run Patient Demo");
     
        var demoUser = 'DemoPatient';

        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {

            var user_id = userData.id;
            var payload = User.payload(user_id, 'Demo');
            var Params = payload || req.session.param || {};
          
            var token = jwToken.issueToken(payload);

            Params['User'] = userData;            
            Params.token = token;
 
            Patient.load( {user : user_id}, function (err, data) {
                if (err) { res.send( { "Error" : "Error loading patient data", message : error }) }
                Params['patient'] = data.patient;
                Params['treatments'] = data.treatments;
                Params['schedule'] = data.schedule;
                Params['protectionMap'] = data.protectionMap;

                console.log("**** Patient Data ***** " + JSON.stringify(data));
                res.render('user/Patient', Params);
            });
 
        })
        .catch ( function (error) {
            res.send( { "Error" : "error loading user: " + error });
        });     
    },

    protocol : function (req, res) {
        console.log("Run Protocol Demo");
     
        var demoClinic = 1;
        var demoUser = 'demoNurse';
        var id = 4;
 
        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {

            var payload = User.payload(userData.id, 'Demo');
            var Params = payload || req.session.param;
          
            console.log("payload: " + JSON.stringify(payload));
            var token = jwToken.issueToken(payload);

            Params['User'] = userData;  
            Params['token'] = token;
            //Params['payload'] = payload; .. breaks something... 
            
            req.token = token;

            console.log('Token: ' + token);          
            //req.token = token;
 

            var q = "SELECT * FROM Protocol_Step where FK_Lab_Protocol__ID = " + id;

            Record.query(q, function (err, result) {
                if (err) {

                    console.log("ASYNC Error in q post request: " + err);
                    console.log("Q: " + q);
         //           res.status(500).send("Error generating Request Page");

                    return res.negotiate(err);
                }

                if (!result) {
                    console.log('no results');
                    return res.send('');
                }

                var Options = [];
                for (var i=0; i<result.length; i++) {
                    Lab_protocol.load_Attributes(result[i]['Input'].split(':'), function (err, atts) {
                        if (err) { return res.send("Error loading attributes") }

                        console.log("Attributes: " + JSON.stringify(atts));
                        if (atts['Plate'].length > 0) {
                            for (var i=0; i< atts['Plate'].length; i++) {
                                Attribute.options('Plate', atts['Plate'][i], function (err, opts) {
                                    if (err) { return res.send("Error generating Plate attribute options") }

                                    console.log('Options: ' + JSON.stringify(opts) );
                                    Options.push(opts);
                                });
                            }
                        }
                    });

                }
                return res.render('lims/Protocol_Step', { steps : result } );
            });
 
        });

    },                                                                                                                                                                                                                                                                                                                                                  

    clinic : function (req, res) {
        console.log("Run Clinic Demo");
     
        var demoClinic = 1;
        var demoUser = 'demoNurse';
 
        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {

            var payload = User.payload(userData.id, 'Demo');
            var Params = payload || req.session.param;
          
            console.log("payload: " + JSON.stringify(payload));
            var token = jwToken.issueToken(payload);

            Params['User'] = userData;  
            Params['token'] = token;
            //Params['payload'] = payload; .. breaks something... 
            
            req.token = token;

            console.log('Token: ' + token);          
            //req.token = token;
 
            Clinic.load( {'clinic_id' : demoClinic, include : { staff: true, appointments : true} }, function (err, clinicData) {         
                if (err) {
                  console.log('no demo clinic results: ' + err);
                  return res.send('');
                }
                else {
                    var page = { 
                        item_Class : 'patient',
                        search_title : "Search for Patients using any of fields below",
                        add_to_scope : true
                    };

                    Params['page'] = page;   
                    Params['clinic'] = clinicData;

                    console.log('-----');
                    console.log("*** Render clinic page...***\n" + JSON.stringify(Params));
                    // res.send({"DEMO Clinic Data: " : req.session.param});
                    return res.render('clinic/Clinic', Params);
                }   
            });
 
        });

    },                                                                                                                                                                                                                                                                                                                                                  

    appointment : function (req, res) {
        console.log("Run Appointment Demo");

        var demoAppointment = 1;
        var demoUser = 'demoNurse';
        var region   = 1;

        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {
   
            var payload = User.payload(userData.id, 'Demo Appointment');
            var Params = payload || req.session.param;
            Params['User'] = userData;
                          
            var token = jwToken.issueToken(payload);
            Params.token = token;
            req.token = token;

            Appointment.loadAppointmentPageData( {appointment: demoAppointment}, function (err, data) {
                if (err) { return res.send( { 'Error' : err }) }

                Params['page'] = data.page;
                Params['appointment'] = data.appointment;
                Params['patient'] = data.patient;
                Params['treatments'] = data.treatments;
                Params['schedule'] = data.schedule;
                Params['protectionMap'] = data.protectionMap;
                Params['clinic'] = data.clinic;
                console.log("*** Render Appointment Page:" + JSON.stringify(Params));
                return res.render("appointment/Appointment", Params);
            });
        });
    },

    research : function (req, res) {
        console.log('Research Demo');

        return res.render("research/Research", req.session.param);
    }
};

 