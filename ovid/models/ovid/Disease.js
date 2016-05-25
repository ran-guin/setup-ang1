/**
* Disease.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName     : 'disease',

  attributes: {
    // The name of the disease ... eg "Yellow Fever"
    name: {
      type: 'string',
      required: true,
      unique: true,
    },
/*
    // alternative name (array ?)  ## eg "yellow jack"
    alias: {
    	type: 'array',

    }
*/
    // A text descriptions
    description: {
      type: 'email',
    },

    // A link to the cdc data page
    // 
    link: {
      type: 'string',
    },

    vaccines: {
      collection: 'vaccine',
      via: 'diseases'
    }
  }
};

