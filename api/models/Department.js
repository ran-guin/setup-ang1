/**
* Department.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	tableName: 'Department',
	migrate: 'safe',
	
  attributes: {
  	name : { type : 'string' } 
  },

  initData: [
  	{ name : 'LIMS' },
  	{ name : 'Laboratory' }
  ],
};

