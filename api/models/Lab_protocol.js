/**
* Lab_protocol.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'Lab_Protocol',

  attributes: {
	Lab_Protocol_Name : { type : 'string' },

	FK_Employee__ID : { model : 'Employee' },

	Lab_Protocol_Status : { 
		type: 'enum',
		enum : ['Active','Archived','Under Development'],
	},

	Lab_Protocol_Description : { type : 'string'},
	Lab_Protocol_ID : { type : 'integer' },
	Lab_Protocol_VersionDate : { type : 'date' },
	Max_Tracking_Size : {
		type : 'enum',
		enum : ['384','96','1'],
		defaultsTo: '1'
	},

	Repeatable : {
		type: 'enum',
		enum: ['Yes','No'],
		defaultsTo: 'Yes',
	},
  }
};

