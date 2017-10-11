/**
* Source.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  migrate: 'safe',
  tableName: 'Source',

  attributes: {
  	Source_ID: { type: 'integer'},
  	External_Identifier: { type: 'string' },
  	FK_Original_Source__ID : { type: 'integer'},
  	Source_Received_Date : { type: 'datetime' }
  },

};

