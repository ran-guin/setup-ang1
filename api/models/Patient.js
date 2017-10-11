/**
* Patient.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  migrate: 'safe',
  tableName: 'Patient',

  attributes: {
    Patient_ID: { type: 'integer'},
  	Patient_Identifier: { type: 'string' }
  },

  alias: {
  	id: 'Patient_ID'
  }
};

