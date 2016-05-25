/**
* Contraindication.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	condition: {
  		type: 'string'
  	},

  	degree: {
  		type: 'string',
  		enum: ['Critical','Normal','Mild'],
  		defaultsTo: 'Normal'
  	},
  	
        vaccine_id: {
            model: 'vaccine',
        }
  }
};

