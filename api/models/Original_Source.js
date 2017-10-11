/**
* Original_Source.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  migrate: 'alter',
  tableName: 'Original_Source',

  attributes: {
  	Original_Source_ID: { type: 'integer'},
    Original_Source_Name: { type: 'string'},
  	FK_Patient__ID: { model: 'patient'},
  },

};

