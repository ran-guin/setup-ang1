/**
* Units.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	name : { type : 'string' },
  	base_unit : { type : 'string' },
  	factor : { type : 'float' }
  },

  initData: [
  	{ name : 'l' , base_unit: 'l', factor: 1 },
  	{ name : 'ml', base_unit: 'l', factor: 0.001 },
  	{ name : 'ul', base_unit: 'l', factor: 0.000001 },
  	{ name : 'nl', base_unit: 'l', factor: 0.000000001 },
  	{ name : 'pl', base_unit: 'l', factor: 0.000000000001 },

  	{ name : 'g' , base_unit: 'g', factor: 1 },
  	{ name : 'mg', base_unit: 'g', factor: 0.001 },
  	{ name : 'ug', base_unit: 'g', factor: 0.000001 },
  	{ name : 'ng', base_unit: 'g', factor: 0.000000001 },
  	{ name : 'pg', base_unit: 'g', factor: 0.000000000001 },
  ]
};

