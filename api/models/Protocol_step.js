/**
* Protocol_step.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	
	attributes: {

		name : { type : 'string '},
		Lab_protocol : { model : 'Lab_protocol' },
		step_number : { type : 'int' },
		instructions : { type : 'string'},
		message : { type : 'string' },
		Target_format : { model : 'container_format' },
		Target_sample : { model : 'Sample_Type' },
		reset_focus : { 
			type : 'boolean',
			defaultsTo : false,
		},
		input_options : { type : 'string'},
		input_format : { type : 'string'},
		input_defaults : { type : 'string'},

		prompt : { 
			type : 'boolean',
			defaultsTo: true,
		},

		transfer_type : { 
			type: 'string',
			enum: ['Transfer', 'Aliquot', 'Pre-Print'],
		},
		createdBy : { model : 'Employee' },
		
		repeatable : { 
			type : 'boolean',
			defaultsTo: false,
		}
	}  
};

