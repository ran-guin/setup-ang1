/**
* Prep.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName : 'Prep', 

  attributes: {
  	Prep_Name : { type : 'string' },
  	Prep_Comments : { type : 'string' },
  	Prep_Action : { 
  		type : 'string',
  		enum : ['Completed','Failed','Skipped'],
  	},
  
        FK_Employee__ID : { model : 'employee' },
	FK_Lab_Protocol__ID : { model : 'lab_protocol' },
  }
};

