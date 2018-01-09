/**
 * Service_centre.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	tableName: 'Service_Centre',
	migrate: 'safe',
	primaryField: 'Service_Centre_ID',

	attributes: {
		Service_Centre_ID: { type: 'integer' },
		Service_Centre_Name: { type: 'string'}
	},

	alias: {
		'id': 'Service_Centre_ID',
		'name': 'Service_Centre_Name'
	}
};

