/**
* Vaccine_Side_effect.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    vaccine_id : {
        'model' : 'vaccine'
    },

    side_effect_id : {
        model: 'side_effect'
    },

    probability : {
        type: 'int'
    },

    severity : {
        type: 'string',
        enum: ['Mild', 'Normal', 'Severe'],
        defaultsTo: 'Normal'
    }
  }
};

