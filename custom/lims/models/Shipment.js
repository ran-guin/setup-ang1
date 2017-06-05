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
    // received : { type: 'time' },
    // received_by : { model : 'user' },
    // waybill_number : { type: 'string' },
    // comments : { type: 'text' },
    // parent_Shipment : { type: 'int' }, // or { model: 'shipment'}
    // sample_condition : { 
    //  type : 'string',
    //  enum: ['frozen','partially frozen','cold','room temp','warm','multiple conditions']
    // },

  	Shipment_ID : { type: 'number' },
  	Shipment_Received : { type: 'time' },
  	Waybill_Number : { type: 'string' },
  	Shipment_Comments : { type: 'text' },
  	// FKOriginal_Shipment__ID : { type: 'number' },
  	// Package_Conditions : { 
  	// 	type : 'string',
  	// 	enum: ['frozen','partially frozen','cold','room temp','warm','multiple conditions']
  	// }
  },

  alias : {
  	'id' : 'Shipment_ID',
    'received' : 'Shipment_Received',
    'waybill_number' : 'Waybill_Number',
    'comments' : 'Shipment_Comments',
    'parent_Shipment' : 'FKOriginal_Shipment__ID',
    'sample_condition' : 'Sample_Condition',
    'Received_by' : 'FKRecipient_Employee__ID',
    'Sent_by' : 'FKSender_Employee__ID'
  }
};

