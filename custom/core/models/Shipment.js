/**
 * Shipment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    received : { type: 'time' },
    received_by : { model : 'user' },
    waybill_number : { type: 'string' },
    comments : { type: 'text' },
    parent_Shipment : { type: 'int' }, // or { model: 'shipment'}
  },

};

