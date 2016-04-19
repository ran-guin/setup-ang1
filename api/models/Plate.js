/**
 * Plate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {


	/** LEGACY **/
	migrate: 'safe',
	tableName : 'Plate',

	attributes: {
	  		comments : { type : 'string' }
	},

	/** NEW **
	attributes: {
	  		comments : { type : 'string' }
	}
	*/
	
};

