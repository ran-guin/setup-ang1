/**
* Lab_protocol.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var _ = require('underscore-node');
var Q = require('q');
module.exports = {

	attributes: {
		name : { type : 'string' },

		createdBy : { model : 'Employee' },

		status : {
			type : 'string',
			'enum' : ['Active','Archived','Under Development']
		},

		description : { type : 'string '},

		repeatable : { 
			type : 'boolean',
			defaultsTo : 'false'
		},
	},

	list : function (input) {

		if (input == undefined) { input = {} }

		var ids = input['Plate'];
		
		var q = "SELECT * FROM lab_protocol";
	    Record.query(q, function (err, result) {
			var Protocols = [];

	    	if (err) {

	    	    console.log("ASYNC Error in q post request: " + err);
	            console.log("Q: " + q);

				return res.negotiate(err);
     		}
			else if (!result) {
					console.log('no results');
					return res.send('');
			}

			else {
				console.log("Found " + result.length + " active Protocols");

				for (var i=0; i<result.length; i++) {
					var name = result[i]['Lab_Protocol_Name'];
					var id   = result[i]['Lab_Protocol_ID'];
					Protocols.push({id : id, name: name});
				}
			}

			return Protocols;
		});
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
			var att2 = input[j].replace('Prep_Attribute=','').replace(' ','_');
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

		var staticInput = ['Split', 'Prep_Comments'];

		var list = [];
		for (i=0; i<query_result.length; i++) {
			var input = query_result[i]['input'].split(':');
			list = _.union(list, input);
		}

		console.log("List: " + list.join(','));
		var ordered = ['transfer_qty','Split','solution','solution_qty','equipment'];
		var last    = ['location','comments'];
		var orderedList = [];
		var attributeList = [];
		// reorder list in standard order for normal input //

		var Included = {};
		for (var i=0; i<ordered.length; i++) {
			if ( list.indexOf(ordered[i]) > 0 ) {
				orderedList.push(ordered[i])
				Included[ordered[i]] = 1;
			}
		}
		for (var i=0; i<list.length; i++) {
			if ( Included[list[i]]) {
				console.log('already included ' + list[i]);
			}
			else if ( last.indexOf(list[i]) > 0 ) { 
				console.log('moving to back: ' + list[i]);
			}
			else {
				attributeList.push(list[i]);
				orderedList.push(list[i]);
			}
		}

		for (var i=0; i<last.length; i++) {
			if ( list.indexOf(last[i]) ) {
				orderedList.push(last[i])
				Included[last[i]] = 1;
			}
		}

		console.log("Reordered List: " + orderedList.join(', '));
		// Legacy fields specified //
		var fields = "Attribute_ID as id, Attribute_Class as model, Attribute_Name as name, Attribute_Type as type, Attribute_Format as format"; // legacy 
		var query = 'SELECT ' + fields + " FROM Attribute WHERE Attribute_Class IN ('Plate','Prep') AND Attribute_Name IN ('" 
			+ attributeList.join("','")
			+ "')";

		console.log("SQL: " + query);

		Record.query(query, function (err, attributeData) {
			if (err) { deferred.reject("error looking for Attributes") }
			else {
				console.log("Attributes: " + JSON.stringify(attributeData))
				deferred.resolve({ 'input' : orderedList, 'attributes' : attributeData});
			}
		});

		console.log("Union: " + JSON.stringify(list));
		return deferred.promise;
	},
};

