/**
* Sample_type.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	tableName: 'Sample_Type',
	primaryField: 'Sample_Type_ID',
	
	migrate: 'safe',
	/* LEGACY */

	attributes: {
		//
	},

	alias: {
		'id' : 'Sample_Type_ID',
		'name' : 'Sample_Type'
	},	  
};

