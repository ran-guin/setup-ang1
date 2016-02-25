/**
* Protocol_step.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	tableName : 'Protocol_Step',
	
	attributes: {
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
		Validate : { type : 'enum', enum : ['Primer','Enzyme','Antibiotic'] },
		Repeatable : { type : 'enum', enum: ['Yes','No',''], defaultsTo: ''}
	}  
};

