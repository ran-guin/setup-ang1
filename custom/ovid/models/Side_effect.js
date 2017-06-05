/**
* Side_effect.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	name : {
  	    type: 'string'
  	},
        description : {
            type: 'string'
        },
        vaccine : {
            model : 'vaccine'
        },
        occurrance : {
            type : 'integer',
            tooltip : 'estimated likelihood of side effect (as %)',
        }
  }
};

