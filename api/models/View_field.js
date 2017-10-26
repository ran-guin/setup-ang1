/**
 * View_field.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	view_table_id: { model: 'view_table'},
  	field: { type: 'string'},
  	type: { 
  		type: 'string',
  		enum: ['field','attribute','sql']
  	},
    field_type: {
      type: 'String'
    },
  	mandatory: { type: 'boolean'},
  	prompt: { type: 'string'},
  }
};

