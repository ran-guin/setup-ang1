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

				var preps_added = result.Prep.length;  // may be 2 if "Completed Protocol" Update record is added ... 
				
				var lastPrepResult = result.Prep[preps_added - 1];
				var last_prep_id = [ lastPrepResult.insertId ];
				
				var firstPrepResult = result.Prep[0];
				var first_prep_id = [ firstPrepResult.insertId ];

				console.log("\nPrep ID: (just inserted) " + last_prep_id );
				console.log("Transfer: (supplied by POST) " + JSON.stringify(data['Transfer']));
				console.log("Options: " + JSON.stringify(data['Transfer_Options']));
				//console.log("Custom: " + JSON.stringify(data['CustomData']));

				var transferred;
				if (data['Transfer'] && data['Transfer_Options'] && data['Transfer_Options']['transfer_type']) {
					console.log('\n*** call Container.execute_transfer from Lab_protocol Model');
					promises.push( Container.execute_transfer( ids, data['Transfer'], data['Transfer_Options']) );

					transferred = promises.length; // point to promise index for transfer step (to retrieve appropriate sample ids)
				}
				else {
					console.log("Not a transfer step..." + JSON.stringify(data));
				}
				
				console.log("save attributes to plates: " + plate_list + '; prep: ' + first_prep_id);

				promises.push( Attribute.save('Plate', ids, data["Plate_Attribute"]) );
				promises.push( Attribute.save('Prep', first_prep_id, data["Prep_Attribute"]) );
				
				promises.push( Record.update('Plate:Plate_ID', ids, {'FKLast_Prep__ID' : last_prep_id } ) );

				q.all( promises )
				.then ( function (Qdata) {
					// sails.config.messages.push('Saved step...');

					if (transferred) { 
						returnData = Qdata[transferred-1];
					}
					else { returnData = result }

					// before returning ... check if samples are to be moved ... // test - redundant now that relocation is in execute_transfer ? ...
					/* 
					if (data['Move']) {
						var moveIds = ids;
						var target_location = data['Move'];

						if (transferred) {
							// regardless of reset_focus, move should apply to target plates from transfer
							console.log("\n** Check for target plates in: " + JSON.stringify(Qdata[transferred-1]) );
							moveIds = Qdata[transferred-1].target_ids;
							
							if (!moveIds) {
								var msg = "Error moving target ids - no target ids retrieved";
								console.log(msg);
								sails.config.errors.push(msg);
							}
							else {
								var msg = "MOVE transferred samples: " + moveIds.join(',') + ' TO Loc#(s): ' + target_location;
								console.log(msg);
								sails.config.messages.push(msg);
							}
						}
						else {
							var msg = "MOVE current samples: " + moveIds.join(',') + ' TO Loc#(s): ' + target_location;
							console.log(msg);
							sails.config.messages.push(msg);
						}

						// Move Samples as required
						Container.relocate(moveIds, target_location)
						.then (function () {
							deferred.resolve(returnData);
						})
						.catch ( function (err) {
							deferred.resolve(returnData);  // return successfully, but generate error message for user
						});
					}
					else {
						console.log("No sample relocation requested");
						deferred.resolve(returnData);
					}
					*/
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
					deferred.reject("Error completing all actions: " + Qerr) ;
				});
			})
			.catch (function (err) {
				console.log("Error saving completed Prep Record: " + err);
				deferred.reject({ error : "Error saving Prep Record: " + err} );
			});

		}
		else {
			deferred.reject(" No Plate IDs or Data ");
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
			var promises = [];
			promises.push( Record.createNew('prep', data['Prep'] ) );

			if (data['status'] && data['status'].match(/complete/i)) {
				// Add update record to Prep table indicating that the protocol has been completed ... 
				var lab_protocol_id = data['Prep']['FK_Lab_Protocol__ID'];
				promises.push( 
					Record.createNew('prep',{ 
						Prep_Name : 'Completed Protocol', 
						Prep_Action: 'Completed', 
						FK_Lab_Protocol__ID: lab_protocol_id, 
						Prep_DateTime : '<now>', 
						FK_Employee__ID : '<user>'
					}) 
				);
			}

			//Record.createNew('Prep', data['Prep'] )
			q.all(promises)
			.then (function (result) {
				for (var i=0; i< result.length; i++) {
					console.log("Added Prep(s): " + JSON.stringify(result));

					var PrepResult = result[0];
					var ids = [];
					var prepId = PrepResult.insertId;  // Legacy
					var added = PrepResult.affectedRows;

					// sails.config.messages.push('added Prep: ' + prepId);

					for (var i=0; i<data['Plate'].length; i++) {
						data['Plate'][i]['FK_Prep__ID'] = prepId;
					}
				
					var promises2 = [];
					promises2.push( Record.createNew('plate_prep', data['Plate'] ) )

				}
				
				console.log("Added Plate: " + JSON.stringify(data['Plate'][0] + '...'));

				q.all(promises2)
				//Record.createNew('Plate_Prep', data['Plate'] )
				.then (function (result2) {
					console.log("Added Plate_Prep: " + JSON.stringify(result2[0] + '...'));
					deferred.resolve({ Prep: result, Plate_Prep: result2});
				})
				.catch (function (err) {
					// sails.config.errors.push('Error creating Plate record ' + err);
					deferred.reject("Error creating Plate record: " + err);
					//return res.send("ERROR creating Plate record: " + err)
				});

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

