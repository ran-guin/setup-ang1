/**
 * Custom_view_setting.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	custom_view_id: { model: 'custom_view'},
  	view_field_id: { model: 'view_field'},
  	display_order: { type: 'integer'},
  	pre_picked: { type: 'boolean'},
    default_search: { 
      type: 'string',
      defaultsTo: '',
      notNull: true
    }
  }
};

