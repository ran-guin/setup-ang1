/**
* Container_format.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	migrate: 'safe',
	tableName: 'Plate_Format',
	/** LEGACY **/

	attributes: {
/*
		format : { type : 'string' },
		wells : { type : 'integer' },
		description : { type : 'string' }
*/
	},

	alias: {
		'id' : 'Plate_Format_ID',
		'name' : 'Plate_Format_Type'
	},


};

