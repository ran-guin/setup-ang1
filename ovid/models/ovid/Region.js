/**
* Region.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {

  attributes: {
    name: {
        type: 'string'
    },

    parent_region_id: {
        model: 'region'
    },

    /*** list of appliable regions ... another way of doing this generically ? */
    applicable : {
    	type: 'string'
    },
  },



};


