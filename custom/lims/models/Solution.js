/**
 * Solution.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 module.exports = {

	tableName: 'Solution',
	migrate: 'safe',

	attributes: {

	},

  	legacy_map : {
  		'number' : 'Solution_Number',
		'number_in_batch' : 'Solution_Number_in_Batch',
		'expiry' : 'Solution_Expiry',
		'qty'    : 'Solution_Quantity',
		'qty_units' : 'Solution_Quantity_Units',
		'type'   : 'Solution_Type',
		'Stock'  : 'FK_Stock__ID',
		'rack'   : 'FK_Rack__ID',
		'notes'  : 'Solution_Notes',
 	},

	alias: {
		'id' : 'Solution_ID',
		'qty' : 'Solution_Quantity',
		'qty_units' : 'Solution_Quantity_Units',
	},

};

