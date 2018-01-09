/**
 * Equipment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	migrate: 'safe',
	tableName: 'Equipment',	
	attributes: {

  	},

  	alias : {
  		'id'    : 'Equipment_ID',
  		'name'   : 'Equipment_Name',
  		'number' : 'Equipment_Number',
		'number_in_batch' : 'Equipment_Number_in_Batch',
		'Stock'  : 'FK_Stock__ID',
		'location'   : 'FK_Location__ID',
		'comments'  : 'Equipment_Comments',
		'status'    : 'Equipment_Status',
		'serial'    : 'Serial_Number',
		'serial_number'    : 'Serial_Number'
 	}
};

