/**
* Protocol_step.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var _ = require('underscore-node');

module.exports = {
	
	attributes: {

		name : { type : 'string'},
		Lab_protocol : { model : 'lab_protocol' },
		step_number : { type : 'int' },
		instructions : { type : 'text'},
		message : { type : 'string' },
		Target_format : { model : 'container_format' },
		Target_sample : { model : 'sample_type' },
		reset_focus : { 
			type : 'boolean',
			defaultsTo : false,
		},
		input_options : { type : 'string'},  // may include split or hidden options:  pack_wells / fill_by / split_mode
		input_format : { type : 'string'},
		input_defaults : { type : 'string'},
		custom_settings : { type : 'string'}, // reset custom_defaults as specified eg: 'pack_wells=8; fill_by=column; split_mode=serial; '

		prompt : { 
			type : 'boolean',
			defaultsTo: true,
		},

		transfer_type : { 
			type: 'string',
			enum: ['Transfer', 'Aliquot', 'Pre-Print'],
		},
		createdBy : { model : 'Employee' },
		
		repeatable : { 
			type : 'boolean',
			defaultsTo: false,
		}
	},

	custom_defaults : {
		pack 		:  false,
		pack_wells 	:  0,
		fill_by 	: 'row',
		split_mode	: 'parallel'
	},

	parse_last_step : function (data) {

		console.log("parse last step details...");
		var last_step = {};
		var warningMsg;
		if (data[0] && data[0].last_protocol_id) {
			// Retrieve last step performed on current plate(s)

			console.log("get last step details...");
			var protocol_ids = _.uniq( _.pluck(data, 'last_protocol_id') );
			var names = _.uniq( _.pluck(data, 'last_step') );
			var numbers = _.uniq( _.pluck(data, 'last_step_number') );
			var statuses = _.uniq( _.pluck(data, 'protocol_status') );
			var transfer = _.uniq( _.pluck(data, 'last_step_transfer_type') );
			var settings   = _.uniq( _.pluck(data, 'transfer_settings') );

			if (protocol_ids.length > 1) {
				var protocols = _.uniq( _.pluck(data, 'last_protocol') );								
				sails.config.warnings.push("Samples appear to be at different stages of the pipeline: ['" + protocols.join("' AND '") + "']");
			}
			else if (numbers.length > 1) {
				sails.config.warnings.push("Samples appear to be at different stages of the last protocol: " + names.join(' AND ') );
				last_step = { protocol_id : protocol_ids[0]}
			}
			else {
				var protocols = _.uniq( _.pluck(data, 'last_protocol') );
				last_step = { protocol: protocols[0], protocol_id : protocol_ids[0], number: numbers[0], name: names[0], status: statuses[0], transfer_type: transfer, transfer_settings: settings};
			}

			console.log("Last Step: " + JSON.stringify(last_step));
		}
		else { console.log("No last step data") }
		return { last_step: last_step };
	},

	'loadSteps' : function (prot) {
		
		var deferred = q.defer();

		var protocol;
		var protocol_id;
		var subselect;
		if (prot.match(/[a-zA-Z]/)) {
			protocol = prot;
			subselect = "(SELECT id from lab_protocol where name like '" + prot + "')";
		}
		else { 
			protocol_id = prot || 0;
			subselect = protocol_id;
		}

		var query = "SELECT * FROM protocol_step"
			+ " LEFT JOIN Plate_Format ON Plate_Format_ID = Target_format"
			+ " WHERE Lab_protocol = " + subselect
			+ " GROUP BY protocol_step.id"
			+ " ORDER BY protocol_step.step_number";

		console.log("\n** Protocol Step : " + query);
		Record.query_promise(query)
		.then ( function (stepData) {
			Protocol_step.parse_steps( stepData )
			.then ( function ( data ) {
				if (! protocol_id && stepData.length) { protocol_id = stepData[0]['Lab_protocol'] }
				var send = { 
		    		Steps : stepData, 
		    		attributes: data.attributes,
		    		protocol: { id: protocol_id, name: protocol }
		    	};

				deferred.resolve(send);
			})
			.catch ( function (err) {
				deferred.reject(err);
			});

		})
		.catch ( function (err) {
			deferred.reject(err);
		});		

		return deferred.promise;
	},

	// simply parses query results from 'loadSteps function '
	'parse_steps' : function (query_result) {
		// returns { input: [array of input strings], attributes: [array of attributes] }
		var deferred = q.defer();

		var Input = [];
		var Attributes = [];

		var inputArray = [];
		var Plate_attributes = [];
		var Prep_attributes = [];

		var deferred = q.defer();

		var staticInput = ['Split', 'Prep_Comments'];

		// console.log("QR: " + JSON.stringify(query_result));

		var list = [];
 		for (i=0; i<query_result.length; i++) {
			var input = query_result[i]['input_options'];
			if (input) { 	
				var cleaned = input.replace(/\*/g,'');
				var stepInput = cleaned.split(':');

				list = _.union(list, stepInput);
			}
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

		console.log("\n** SQL: " + query);

		Record.query_promise(query)
		.then (function (attributeData) {
			var Atts = {};
			for (var i=0; i<attributeData.length; i++) {
				var att = attributeData[i].name;
				Atts[att] = attributeData[i];
			}
			console.log("Attributes: " + JSON.stringify(attributeData))
			deferred.resolve({ 'input' : orderedList, 'attributes' : Atts});
		})
		.catch (function (err) {
			err.context = 'looking for Attributes';
			deferred.reject(err); 
		})

		console.log("Union: " + JSON.stringify(list));
		return deferred.promise;
	},
};

