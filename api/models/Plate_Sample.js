/**
* Plate_Sample.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  migrate: 'alter',
  tableName: 'Plate_Sample',

  attributes: {
  	Plate_Sample_ID: { type: 'integer'},
  	FK_Sample__ID : { model: 'sample'},
  	FKOriginal_Plate__ID  : { model: 'container'}

  },

};

