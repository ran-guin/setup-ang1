/**
 * Shipped_object.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	tableName : 'Shipped_Object',
	migrate: 'safe',

 	attributes: {
		FK_Shipment__ID: { type : 'number' },
		FK_Object_Class__ID: { type: 'number' },
		Object_ID : { type: 'number' }
	},

	alias: {
		'id' : 'Shipped_Object_ID'
	}
};

