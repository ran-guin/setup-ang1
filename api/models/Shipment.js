/**
 * Shipment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var BaseModel = require("./../../custom/core/models/Shipment.js");
// var BaseModel = require("./Xuser.js");

module.exports = _.merge({}, BaseModel, {

  migrate: 'safe',
  tableName: 'Shipment',

  attributes: {
    Shipment_ID : { type: 'number' },
    Shipment_Received : { type: 'time' },
    Waybill_Number : { type: 'string' },
    Shipment_Comments : { type: 'text' },
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
 
});

