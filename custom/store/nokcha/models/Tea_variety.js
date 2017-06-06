/**
* Tea_variety.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	name : { type : 'string'},
  	tea_type : { model : 'tea_type' },
  	description : { type : 'string'},
  }
};

