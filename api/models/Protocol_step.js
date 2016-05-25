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
		input_options : { type : 'string'},  // may include split or hidden options:  pack_wells / fill_by / split_mode
		input_format : { type : 'string'},
		input_defaults : { type : 'string'},
		custom_settings : { type : 'string'}, // reset custom_defaults as specified eg: 'pack_wells=8; fill_by=column; split_mode=serial; '

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
	},

	custom_defaults : [
		pack 		:  	false,
		pack_wells 	: 0,
		fill_by 	: 'row',
		split_mode	: 'parallel'
	];
};

