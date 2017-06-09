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
			'enum' : ['Active','Archived','Under Development', 'External']
		},

		description : { type : 'text'},

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

		console.log("\n*** COMPLETE Lab Protocol ***");
		// console.log(JSON.stringify(data));
		
		var ids = data['ids'] || data['plate_ids'];  // array version of same list ...
		console.log("\n* IDS: " + JSON.stringify(ids));

		ids = Record.cast_to(ids, 'array');
		var plate_list = ids.join(',');

		if (ids.length > 0) {

			Lab_protocol.savePrep(data)
			.then ( function (result) {

				var promises = [];
				console.log("Added Single Prep: " + JSON.stringify(result));

				var preps_added = result.length;  // may be 2 if "Completed Protocol" Update record is added ... 
				var lastIndex = preps_added - 1;
				var lastPrepResult = result[lastIndex].Prep;

				var first_prep_id = [ result[0].Prep.insertId ];           
				var last_prep_id = [ result[lastIndex].Prep.insertId ];		// may be the same as last prep unless 'Completed Protocol'.		

				console.log("\nPrep ID: (just inserted) " + last_prep_id );
				console.log("Transfer: (supplied by POST) " + JSON.stringify(data['Transfer']));
				console.log("Options: " + JSON.stringify(data['Transfer_Options']));
				console.log("Plate: " + JSON.stringify(data.Plate));
				//console.log("Custom: " + JSON.stringify(data['CustomData']));

				var transferred;
				if (data['Transfer'] && data['Transfer_Options'] && data['Transfer_Options']['transfer_type']) {

					data['Transfer_Options']['Prep'] = last_prep_id;
					promises.push( Container.execute_transfer( ids, data['Transfer'], data['Transfer_Options']) );

					transferred = promises.length; // point to promise index for transfer step (to retrieve appropriate sample ids)
				}
				else {
					console.log("Not a transfer step..." + JSON.stringify(data));
					
					var qty = _.pluck(data.Plate,'Solution_Quantity');

					if (qty) {
						var qty_units = _.pluck(data.Plate,'Solution_Quantity_Units');
						console.log("update current volume: add " + qty.join(',') + qty_units);
						Record.adjust_volumes('container', ids, qty, qty_units);						
					}
				}
				
				// Update Solution quantities if applicable ... 
				var sol_ids = _.pluck(data.Plate, 'FK_Solution__ID');
				var sol_qty = _.pluck(data.Plate, 'Solution_Quantity');
				var sol_qty_units = _.pluck(data.Plate, 'Solution_Quantity_Units');

				if (sol_ids[0]) {
					console.log("adjust reagent volumes for: " + sol_ids.join(','));
					promises.push( Record.adjust_volumes('solution', sol_ids, sol_qty, sol_qty_units, { subtract: true }) );
				}

				console.log("save attributes to plates: " + plate_list + '; prep: ' + first_prep_id);

				promises.push( Attribute.save('Plate', ids, data["Plate_Attribute"]) );
				promises.push( Attribute.save('Prep', first_prep_id, data["Prep_Attribute"]) );
				
				promises.push( Record.update('Plate:Plate_ID', ids, {'FKLast_Prep__ID' : last_prep_id } ) );

				q.all( promises )
				.then ( function (Qdata) {
					// sails.config.messages.push('Saved step...');

					if (transferred) { 
						returnData = Qdata[transferred-1];  // return data from execute_transfer promise
					}
					else { returnData = result }            // result not typically used unless transferred.. 

					deferred.resolve(returnData);
				})
				.catch ( function (Qerr) {
					// sails.config.warnings.push('There was a glitch somewhere in the step saving process');
					console.log("Error Completing all actions: " + JSON.stringify(Qerr));
					if (Qerr.constructor === Array) {
						for (var i=0; i<Qerr.length; i++) {
							console.log("\n** " + i + " Error: " + Qerr[i]);
							console.log(JSON.stringify(Qerr[0]));
						} 
					}
					Qerr.message = "Error completing all actions: ";
					deferred.reject(Qerr) ;
				});
			})
			.catch (function (err) {
				console.log("Error saving completed Prep Record: " + err);
				err.context('Prep Record');
				deferred.reject(err);
			});

		}
		else {
			var e = new Error("no container ids or data");
			deferred.reject(e);
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
			var e = new Error('Debug only - nothing saved');
			deferred.reject(e);
		}
		
		else if (data && data['Prep']) {
			var promises = [];

			promises.push(Prep.save_Prep(data['Prep'], data['Plate']));

			if (data['status'] && data['status'].match(/complete/i)) {
				var completion_data = { 	
						Prep_Name : 'Completed Protocol', 
						Prep_Action: 'Completed', 
						FK_Lab_Protocol__ID: lab_protocol_id, 
						Prep_DateTime : '<now>', 
						FK_Employee__ID : '<user>'
					};

				promises.push(Prep.save_Prep(completion_data, data['Plate']));
			}

			q.all(promises)
			.then (function (result) {
				deferred.resolve(result);				
			})
			.catch ( function (err) {
				err.context = 'creating prep record';
				deferred.reject(err);
			});
		}
		else {
			console.log("Prep Data");
			var e = new Error('no data');
			deferred.reject(e);
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
				console.log("Found " + result.length + " Active Protocols");

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
};

