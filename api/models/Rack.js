/**
* Rack.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	tableName: 'Rack',
	// ** LEGACY **/
	migrate: 'safe',
  	attributes: {
  		Rack_ID : { type : 'integer'},
  		Rack_Name : { type : 'string' },
  		Rack_Alias : { type : 'stirng' },
  		FK_Equipment__ID : { model : 'equipment'},
  		FKParent_Rack__ID : { model : 'rack'}
  	}	
};

