/**
* Protection.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    // REDUNDANT - remove if we can get find().populate('protection', { patient : 4 })  to work ( not filtering original list ??)
    vaccine : {
        model : 'vaccine'
    },

    disease : {
        model : 'disease'
    },
  },

};



