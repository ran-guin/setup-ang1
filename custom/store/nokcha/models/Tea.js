/**
* Tea.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {


  attributes: {
  	name : { type : 'string'},
  	tea_variety : { model : 'tea_variety'},

  	caffeinated : { 
  		type : 'enum',
  		enum : ['Yes', 'Low', 'No']
  	},
  	cost_100g : { type : 'integer' },
  }
};

