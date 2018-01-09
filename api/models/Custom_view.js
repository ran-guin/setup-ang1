/**
 * Custom_view.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	view_id: { model: 'view'},
  	custom_name: { 
      type: 'string',
      unique: true
    },
    active: { 
      type: 'boolean',
      defaultsTo: true
    },
    default_layer: {
      type: 'string'
    }
  },

  alias: {
    name: 'custom_name'
  }
};

