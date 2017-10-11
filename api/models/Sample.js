/**
* Sample.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  migrate: 'safe',
  tableName: 'Sample',

  attributes: {
  	Sample_ID: { type: 'integer'},
  	FK_Source__ID : { model: 'source'},
  },

  alias: {
  	id: 'Sample_ID'
  }

};

