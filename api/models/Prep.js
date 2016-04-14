/**
* Prep.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	name : { type : 'string' },
  	comments : { type : 'string' },
  	action : { 
  		type : 'string',
  		enum : ['Completed','Failed','Skipped'],
  	},
    createdBy : { model : 'employee' },
    Lab_protocol : { model : 'lab_protocol' },
  }
};

