/**
 * Plate_Format.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  migrate: 'safe',
  tableName: 'Plate_Format',

  attributes: {
    Plate_Format_ID: { type: 'integer'},
  	Plate_Format_Type: { type: 'string' }
  },

  alias: {
  	id: 'Plate_Format_ID',
  	name: 'Plate_Format_Type'
  }

};

