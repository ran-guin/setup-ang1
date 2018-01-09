/**
* Employee.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	tableName: 'Employee',
	primaryField: 'Employee_ID',
	migrate: 'safe',
	
	  attributes: {
	 		Employee_ID : { type : 'integer' },
			Employee_Name : { type : 'string' },
			Employee_Start_Date : { type : 'date' },
			Initials : { type : 'string' },
			Email_Address : { type : 'string' },
			Employee_FullName : { type : 'string' },
			Position : { type : 'string' },
			Employee_Status : {type : 'enum', enum: ['Active','Inactive','Old'] },
			Permissions : { type : 'enum', set : ['R','W','U','D','S','P','A']},
			IP_Address : { type : 'string' },
			Password : { type : 'password' },
			Machine_Name : { type : 'string' },
			FK_Department__ID : { type : 'integer' },
		},

		alias: {
			id: 'Employee_ID',
			name: 'Employee_Name',
			email: 'Email_Address'
		}
};

