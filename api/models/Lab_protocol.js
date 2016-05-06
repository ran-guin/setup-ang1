/**
* Lab_protocol.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var _ = require('underscore-node');
var q = require('q');

module.exports = {

	attributes: {
		name : { type : 'string' },

		createdBy : { model : 'Employee' },

		status : {
			type : 'string',
			'enum' : ['Active','Archived','Under Development']
		},

		description : { type : 'string '},

		Container_format : { model : 'container_format' },
		Sample_type : { model : 'sample_type'} ,
		repeatable : { 
			type : 'boolean',
			defaultsTo : 'false'
		},
	},

	'isTransfer' : function ( name ) {
		// Determine if a protocol step is a transfer step according to name format 
		var matches = name.match(/^(Extract|Pre-Print|Transfer) /);
		if (matches && matches.length) {
			console.log("Matches: " + JSON.stringify(matches));
			return true;
		}
		else {
			console.log("Not transfer step...");
			return false;
		}
	},

	'complete' : function ( data ) {

		var deferred = q.defer();

		console.log("COMPLETE ALL STEPS: " + JSON.stringify(data));

		var plate_list = '';
		console.log('get ids...');
		var ids = data['ids'] || data['plate_ids'];  // array version of same list ... 
		if (ids && ids.length > 0 && ids != 'undefined') {

			console.log(typeof ids + " = type: " + ids.constructor); 

			if ( ids.constructor == 'String' ) { console.log("list"); plate_list = ids; ids = plate_list.split(/\s*,\s*/) }
			else { console.log("ARRAY"); plate_list = ids.join(',') }
			Lab_protocol.savePrep(data)
			.then ( function (PrepResult) {

				var promises = [];
				console.log("Added Single Prep: " + JSON.stringify(PrepResult));

				var prep_id = [ PrepResult.Prep.insertId ];
				console.log("Prep IDS: " + JSON.stringify(prep_id));

				if (data['Sources']) {

					var transfer = data['Transfer'];

					console.log('Sources: ' + JSON.stringify(data['Sources']));
					promises.push( Container.execute_transfer( 
						data['Sources'],
						data['Transfer'],
						{ 'prep_id' : prep_id } // test data
					));

				}
				else {
					console.log("No Prep Name in data: " + JSON.stringify(data));
				}
				
				console.log("save attributes to plates: " + plate_list + '; prep: ' + prep_id);

				promises.push( Attribute.save('Plate', ids, data["Plate_Attribute"]) );
				promises.push( Attribute.save('Prep', prep_id, data["Prep_Attribute"]) );
				
				promises.push( Container.saveLastPrep(ids, prep_id[0]) );

				q.all( promises )
				.then ( function (Qdata) {
					console.log("ALL PROMISES COMPLETE: " + JSON.stringify(Qdata));
					deferred.resolve(Qdata);
				})
				.catch ( function (Qerr) {
					console.log("Error Completing all actions: " + JSON.stringify(Qerr));
					deferred.reject({ error : "Error completing all actions: " + JSON.stringify(Qerr)}) ;
				});
			})
			.catch (function (err) {
				console.log("Error saving completed Prep Record: " + err);
				deferred.reject({ error : "Error saving Prep Record: " + err} );
			});

		}
		else {
			deferred.reject({ error : " No Plate IDs or Data "} );
		}

		return deferred.promise;
	},

	/** return data on success **/
	'savePrep' : function (data) {
		console.log("savePrep");

		var action = '';
		if (data && data['Prep'] && data['Prep']['Prep_Action']) {
			action = data['Prep']['Prep_Action'];
		} 

		var deferred = q.defer();

		console.log("Complete Prep: " + action);
		if (action == 'Debug') {
			console.log("Form Data:");
			console.log(data);
			//return res.send('Debug only - nothing saved');
			deferred.reject("Debug only - nothing saved");
		}
		
		else if (data && data['Prep']) {
			console.log("Send Prep data: " + JSON.stringify(data['Prep']));

			Record.createNew('Prep', data['Prep'] )
			.then (function (PrepResult) {
				console.log("Added Prep: " + JSON.stringify(PrepResult));

				var ids = [];
				var prepId = PrepResult.insertId;  // Legacy
				var added = PrepResult.affectedRows;

				for (var i=0; i<data['Plate'].length; i++) {
					data['Plate'][i]['FK_Prep__ID'] = prepId;
				}
			
				console.log("Send Plate data: " + JSON.stringify(data['Plate']));

				Record.createNew('Plate_Prep', data['Plate'] )
				.then (function (PlatePrepResult) {				
					console.log("Added Plate_Prep: " + JSON.stringify(PlatePrepResult));
					console.log('transfer if necessary....');
					
					deferred.resolve({ Prep: PrepResult, Plate_Prep: PlatePrepResult});
				})
				.catch (function (err) {
					deferred.reject("Error creating Plate record: " + err);
					//return res.send("ERROR creating Plate record: " + err)
				})
			})
			.catch ( function (err) {
				deferred.reject("Error creating Prep record: " + err);
				//return res.send("ERROR creating Prep record: " + err);				
			});
		}
		else {
			console.log("Prep Data");
			deferred.reject("No data");
			//return res.send('no data');
		}

		return deferred.promise;

	},	

	list : function (input) {
	//
	// Generate list of Protocol objects
	// Optionally provide input: { Plate : [@ids], format : 'id', grp : 'id' }
	//
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
		// accessor for standard validation messages related to lab protocols //
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
		// Load list of Attributes for Lab Protocol given array of input parameters
		// input = array of input field values for list of protocol_step records
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
		// returns { input: [array of input strings], attributes: [array of attributes] }
		var deferred = q.defer();

		var Input = [];
		var Attributes = [];

		var inputArray = [];
		var Plate_attributes = [];
		var Prep_attributes = [];

		var deferred = q.defer();

		var staticInput = ['Split', 'Prep_Comments'];

		console.log("QR: " + JSON.stringify(query_result));

		var list = [];
 		for (i=0; i<query_result.length; i++) {
			var input = query_result[i]['input_options'];
			if (input) { 				var stepInput = input.split(':');
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

