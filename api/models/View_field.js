/**
 * View_field.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	view_id: { model: 'view'},
  	table: { type: 'string'},
  	field: { type: 'string'},
  	type: { 
  		type: 'string',
  		enum: ['field','attribute']
  	},
  	order: { type: 'integer'},
  	mandatory: { type: 'boolean'},
  	prompt: { type: 'string'}
  }
};

