/**
 * View_table.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	view_id: { model: 'view' },
  	table_name: { type: 'string' },
  	join_condition: { type: 'string' },
  	mandatory: { type: 'boolean' },
  	label: { type: 'string'}
  }
};

