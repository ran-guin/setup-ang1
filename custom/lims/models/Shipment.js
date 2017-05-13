/**
 * Shipment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	migrate: 'safe',
	tableName: 'Shipment',

  attributes: {
  	Shipment_ID : { type: 'number' },
  	Shipment_Received : { type: 'time' },
  	Waybill_Number : { type: 'string' },
  	Shipment_Comments : { type: 'text' },
  	FKOriginal_Shipment__ID : { type: 'number' },
  	Sample_Condition : { 
  		type : 'string',
  		enum: ['frozen','partially frozen','cold','room temp','warm','multiple conditions']
  	}
  },

  alias : {
  	'id' : 'Shipment_ID',
  }
};

