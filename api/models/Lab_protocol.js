/**
* Lab_protocol.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var _ = require('underscore-node');
var Q = require('q');
module.exports = {

	tableName: 'Lab_Protocol',

	attributes: {
		Lab_Protocol_Name : { type : 'string' },

		FK_Employee__ID : { model : 'Employee' },

		Lab_Protocol_Status : { 
			type: 'enum',
			enum : ['Active','Archived','Under Development'],
		},

		Lab_Protocol_Description : { type : 'string'},
		Lab_Protocol_ID : { type : 'integer' },
		Lab_Protocol_VersionDate : { type : 'date' },
/*
		Max_Tracking_Size : {
			type : 'enum',
			enum : ['384','96','1'],
			defaultsTo: '1',
			required: true,
		},

		Repeatable : {
			type: 'enum',
			enum: ['Yes','No'],
			defaultsTo: 'Yes',
			required: false,
		},
*/
	},
	
	validation_messages: {
	    Lab_Protocol_Name: {
	      required: 'You must supply a valid name for the placement. If you do not have a specific name, make up one.',
	      minLength: 'The name must be more than one character long.'
	    },
	    Max_Tracking_Size: {
	        required: 'You must supply a width value in pixels.'
	    },
	    Repeatable: {
	        required: 'You must supply a height value in pixels.'
	    },
	  },
  
	'load_Attributes' : function (input, cb) {

		var Plate_attributes = [];
		var Prep_attributes = [];

		console.log("Input: " + JSON.stringify(input));
		for (j=0; j<input.length; j++) {
			var att1 = input[j].replace('Plate_Attribute=','');
			var att2 = input[j].replace('Prep_Attribute=','');
			if (att1 != input[j]) { Plate_attributes.push(att1) }
			else if (att2 != input[j]) { Prep_attributes.push(att2) }

			// console.log("Plate Atts: " + JSON.stringify(Plate_attributes));
			// console.log("Prep Atts: " + JSON.stringify(Prep_attributes));
		}

		return cb(null, { 'Plate' : Plate_attributes, 'Prep' : Prep_attributes });

	},

	'input_list' : function (query_result) {

		var deferred = Q.defer();

		var Input = [];
		var Attributes = [];

		var inputArray = [];
		var Plate_attributes = [];
		var Prep_attributes = [];

		var deferred = Q.defer();

		var list = [];
		for (i=0; i<query_result.length; i++) {
			var input = query_result[i]['Input'].split(':');
		
			for (j=0; j<input.length; j++) {
				var att1 = input[j].replace('Plate_Attribute=','');
				var att2 = input[j].replace('Prep_Attribute=','');
				if (att1 != input[j]) { Plate_attributes.push(att1) }
				else if (att2 != input[j]) { Prep_attributes.push(att2) }
			}

			list = _.union(list, input);
		}

		console.log("Union: " + JSON.stringify(list));

		// return cb(null, { 'input' : list, 'attributes' : { 'Plate' : Plate_attributes, 'Prep' : Prep_attributes }} );

		deferred.resolve({ 'input' : list, 'attributes' : { 'Plate' : Plate_attributes, 'Prep' : Prep_attributes }});
		return deferred.promise;
	},
};

