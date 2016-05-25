/**
* Appointment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

		position: {
			type: 'integer'
		},

		status: {
			type: 'string',
	  		enum: ['Scheduled', 'Queued', 'Ready','In Process', 'Completed', 'Cancelled','Prioritized'],
	  		defaultsTo: 'Queued'

		},

		arrivalTime: {
			type: 'datetime',
			defaultsTo: new Date()
		},
    
                startTime: {
                    type: 'datetime',
                },

                endTime: {
                    type: 'datetime',
                },

		reason: {
			type: 'string'
		},

                
		// Foreign Key references 

		// Data entry staff 
		staff: {
			model: 'staff',
		},

        		// REDUNDANT for optional booking simplicity //
		patient: {
			model: 'patient',
		},
                
                // REDUNDANT for optional booking simplicity //

		vaccinator: {
			model: 'staff',
		},

        clinic : {
            model: 'clinic',
        }
    },

	autoload: {
		type : 'query',
		tables : ['clinic', 'appointment', 'patient', 'region'],
		fields : [ 'clinic.name as clinic', 'clinic.id as clinic_id', 'clinic.address', 
			'appointment.id as appointment_id', 'appointment.patient', 'position',
			'MedUser.name as Vaccinator', 'MedStaff.id as Vaccinator_id', 'DeskUser.name as BookedBy', 'MedStaff.role', 
			'patient.id as patient_id', 'patient.firstName', 'patient.lastName', 'patient.gender', "birthdate", "FLOOR(DATEDIFF(CURDATE(), birthdate)/365) as age", "region.name as location"
		],
		order : ['status DESC', 'position', 'appointment.createdAt'],
		conditions: [
			"appointment.status NOT IN ('Cancelled', 'Completed')",
			"appointment.clinic = clinic.id",
			"appointment.patient=patient.id",
			"patient.region_id = region.id"
		],
		left_joins : [
			"staff as MedStaff ON appointment.vaccinator=MedStaff.id",
			"user as MedUser on MedStaff.user_id=MedUser.id",
			"staff as DeskStaff ON appointment.staff_id=DeskStaff.id",
			"user as DeskUser on DeskStaff.user_id=DeskUser.id",
		],

	},

	loadAppointmentPageData : function (input, cb) {

		var appointment_id = input.appointment;

		var returnData = {};

		// Generate page settings 
        var page = { 
            item_Class : 'treatment',
            search_title : "Search for Treatments using any of fields below",
            add_to_scope : true
        };
        
        returnData.page = page;

        Appointment.findOne( { id : appointment_id })
        .populate('clinic')
        .populate('patient')
        .populate('vaccinator')
        .then ( function (appointmentData) {         

        	if (appointmentData === undefined) { return cb(null, returnData) }

        	console.log("***** AD *******  : " + JSON.stringify(appointmentData));
        	var patient_id = appointmentData.patient.id;

        	returnData.appointment = appointmentData;
        	returnData.clinic = appointmentData.clinic;

        	Patient.load({patient : patient_id}, function (err, data) {
        		if (err) { return cb("Error loading patient: " + err) }
        			
                returnData['patient'] = data.patient;
	            returnData['treatments'] = data.treatments;
	            returnData['schedule'] = data.schedule;
	            returnData['protectionMap'] = data.protectionMap;

	            console.log("PATIENT: " + JSON.stringify(data.patient));
	            console.log("TREATMENT: " + JSON.stringify(data.treatments));
	            console.log("SCHEDULE: " + JSON.stringify(data.schedule));
	            console.log("MAP: " + JSON.stringify(data.protectionMap));
	            return cb(null, returnData);
	        });	
	    });	
	},

};

