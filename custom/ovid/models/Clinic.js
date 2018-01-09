/**
* Clinic.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Q = require('q');

module.exports = {

  tableName     : 'clinic',

  attributes: {
    // The clinic's full name
    // e.g. 
    name: {
      type: 'string',
      required: true,
      unique: true,
    },

    // The clinic's email address
    // e.g. nikola@tesla.com
    email: {
      type: 'email',
      required: true,
    },

    // The street address of the clinic
    // 
    address: {
      type: 'string',
      required: true
    },

    // postal code for clinic
    postalCode: {
      type: 'date',
      required: true,
    },

    // fax number if applicable (for requisitions if required)
    faxNumber: {
      type: 'string'
    },

    // phone number for front desk (may change to many to one later)
    phoneNumber: {
      type: 'string',
      required: true
    },

    // foreign key to region
    region_id: {
      type: 'integer'
    },

    // enable clinic status to be verified 
    verificationStatus: {
    	type: 'string',
    	enum: ['Pending','Verified'],
    	defaultsTo: 'Pending'
    },

    autoload: {
      type : 'query',
      tables : ['clinic'],
      fields : [ 'clinic.name as clinic', 'clinic.id as clinic_id', 'clinic.address', 
      ],
      include : {
        'staff' : {
            fields : ['user.name as user', 'staff.id as staff_id', 'user.name as staff', 'staff.role', 'CS.dutyStatus'],
            left_joins : [
              "clinic_staff AS CS ON CS.clinic_id=clinic.id",
              "staff ON CS.staff_id=staff.id",
              "user ON staff.user_id=user.id"
            ],
        },
      },
      on : {
        'clinic_id' : {
            conditions : [ "clinic.id = INPUTVALUE" ]
        },
      }
    },
  },

  load: function (input, cb) {
      // separate load function only required to dynamically load staff & appointments
      // this may not be needed if sails / Waterline is updated to support join tables with extra custom fields ...

      // adapt to only tweak sails query hash based on possible input parameters... (needed ?)
      //query = sails.sql_helper.build_Query(Clinic, input);
    
      var clinic_id = input['clinic_id'] || 2;

      Clinic.findOne( { id : clinic_id} )
      .then ( function (clinicData) { 
        var info = {};
 
        if (clinicData) {

          info = clinicData || {};
          
          if (input['include'] ) {
            Q.all([
              Clinic.getAppointments(clinicData.id),
              Clinic.getStaff(clinicData.id)
            ])
            .then ( function (result) {
                info['appointments'] = result[0];
                info['staff'] = result[1];
                console.log("** CLINIC loaded: **\n" + JSON.stringify(info));
                return cb(null, info);
            })
            .catch( function (err) {
              return cb(err);
            });
          }
          else { return cb(null, info) }
        }
        else { 
          console.log("no clinic data");                  
          return cb(null, info);
        }      
    })
    .catch ( function (err) {
      console.log("Error: " + err);
      return ("no data");
    });
    
  }, 

  test: function (id) {
    console.log('testid');
    return [{name: 'Ran', role: 'Doc'}];
  },

  getStaff: function (clinic_id) {
    console.log("load Staff for clinic " + clinic_id);

    return Clinic_staff.find({ clinic : clinic_id })
    .populate('staff')
    .then ( function ( staffData ) {  
        var joined = Record.join_data({ join : staffData, to : 'staff', map : { 'id' : 'clininc_staff_id'} } );
        console.log("** Clinic Staff Data: **\n" + JSON.stringify(joined));
        return joined;
    })
    .catch ( function (err) {
        console.log("get Staff Errors: " + err);
        return;
    });
  },


  getAppointments: function (clinic_id) {
    console.log("load Appointments for clinic " + clinic_id);
    
    return Appointment.find({ clinic : clinic_id })
    .sort('position ASC')
    .populate('vaccinator')
    .populate('patient')
    .then ( function ( appointmentData ) {  
        if (appointmentData) {
          console.log("** Clinic Appointment Data: **\n" + JSON.stringify(appointmentData));
          return appointmentData;
        }
        else {
          console.log('no Appointments');
          return [];
        }
    })
    .catch ( function (err) {
        console.log("get Staff Errors: " + err);
        return;  
    });
  }

};

