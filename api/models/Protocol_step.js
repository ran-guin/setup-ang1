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
		input : { type : 'string'},
		format : { type : 'string'},
		defaults : { type : 'string'},

		prompt : { 
			type : 'boolean',
			defaultsTo: true,
		},

		createdBy : { model : 'Employee' },
		
		repeatable : { 
			type : 'boolean',
			defaultsTo: false,
		}

		/*
		Protocol_Step_Number : { type : 'integer' },
		Protocol_Step_Name : { type : 'string'},
		Protocol_Step_Instructions : { type : 'string'},
		Protocol_Step_ID : { type : 'integer' },
		Protocol_Step_Defaults : { type : 'string'},
		Input : { type : 'string' },
		Scanner : { type : 'boolean', defaultsTo: '1' },
		Protocol_Step_Message : { type : 'string'},
		FK_Employee__ID : { type : 'integer' },
		Protocol_Step_Changed : { type : 'datetime' },
		Input_Format : { type : 'string'},
		FK_Lab_Protocol__ID : { type : 'integer' },
		FKQC_Attribute__ID : { type : 'integer' },
		QC_Condition : { type : 'string'},
		Validate : { type : 'string' },
		Repeatable : { type : 'string', enum: ['Yes','No',''], defaultsTo: ''}
		*/
	}  
};

