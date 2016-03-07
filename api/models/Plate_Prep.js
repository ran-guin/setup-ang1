/**
 * Plate_Prep.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	FK_Plate__ID : { model : 'plate' },
  	FK_Prep__ID : { model : 'prep' },
  	//FK_Plate_Set__Number : { type : 'integer' },
  	FK_Equipment__ID : { model : 'equipment' },
  	FK_Solution__ID : { model : 'solution' },
  	Solution_Quantity : { type : 'float' },
  	Transfer_Quantity : { type : 'float' },
  	Solution_Quantity_Units : { 
  		type : 'string',
  		enum : ['pl','nl','ul','ml','l','g','mg','ug','ng','pg'],
  	},
  }
};

