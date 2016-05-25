/**
* Patient.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var moment = require('moment');

module.exports = {

  tableName     : 'patient',

  attributes: {
    // The user's full name
    // e.g. Nikola Tesla
    firstName: {
      type: 'string',
      required: true
    },

    lastName: {
      type: 'string',
      required: true
    },

    birthdate: {
    	type: 'date',
    	required: true
    },

    gender: {
    	type: 'string',
    	enum: ['M','F']
    },

    user : {
      model : 'user',
    },
    
    region: {
        model: 'region',
    },

    notes: {
    	type: 'string'
    },

    email: {
      type: 'email',
      required: true,
      unique: true
    },

    identifier: {
    	type: 'string',
    	required: true,
    },

    identifierType: {
    	type: 'string',
    	enum: ['BC Care Card #', 'OHIP #']
    },

    status: {
      type: 'string',
      enum: ['Active', 'Inactive', 'Demo'],
      defaultsTo: 'Active'
    }
  },

  load : function (input, cb) {

    var data = {};

    var conditions = {};
    if (input.user) { conditions.user = input.user }
    if (input.patient) {conditions.id = input.patient }

    Patient.findOne( conditions )
    .populate('region')
    .then ( function (patientData) {
      
      var age = moment().diff(moment(patientData.birthdate), 'years');
      patientData.ageYrs = age;
      console.log('loaded PATIENT : ' + age);

      data.patient = patientData;
      var patient_id = patientData.id;

      Treatment.find( { where : { patient : patient_id, status : ['Active'] } , sort : 'applied desc' } )   
          .populate('appointment')
          .populate('vaccine')
          .exec( function (err, treatments ) {
   //           if (err) { return res.send({ Error: err, message : "Error retrieving Treatments " }) }
            if (err) { cb("Error retrieving treatments: " + err) }
            
            console.log('got treatments ' + JSON.stringify(treatments));
            data['treatments'] = treatments;

            Recommendation.load({ patient_id : patient_id, treatments: treatments} , function (err, recommendation) {
                  data['schedule'] = recommendation.schedule;
                  data['protectionMap'] = recommendation.protectionMap;
                 
                  cb(null, data);   
            });  
      });
    });
  },


  loadHistory : function (input, cb) {

      console.log('load patient history...');

      var detailed = 0;
      var fields = ['vaccine.name as vaccine', 'appointment.date', 'expiry', 'reactionLevel', 'reactionNotes'];

      if (detailed) {
        fields.push(['route', 'site', 'staff','clinic']);
        tables += ""
      }

      var tables = "patient, appointment, treatment, vaccine";
      var left_joins = [];

      var conditions = [
          'appointment.patient = patient.id',
          'vaccine.id = treatment.vaccine_id',
          'appointment.id = treatment.appointment_id',
      ];

      if ( input['patient_id'] ) { conditions.push("patient.id = " + input['patient_id']) }

      var query = "SELECT " + fields.join(',');
      if (tables) query += ' FROM (' + tables + ')';
      if (left_joins.length) { query += " LEFT JOIN " + left_joins.join(' LEFT JOIN ') }
      if (conditions.length) { query += " WHERE " + conditions.join(' AND ') }
      console.log("Q: " + query);

      Patient.query(query, function (err, result) {
          if (err) { cb(err) }

          console.log("CLINIC INFO: " + JSON.stringify(result));

          var clinicStaff = [];
          for (var i=0; i<result.length; i++) {
            var staffInfo = {
              'id' : result[i]['clinic_staff'],
              'name' : result[i]['user'],
              'role' : result[i]['role'],
              'status' : result[i]['dutyStatus'],
            }
            clinicStaff.push(staffInfo);
          }

          var info = result;
          /** load clinic info **/
          
          cb(null, info);
      });
  }

};

