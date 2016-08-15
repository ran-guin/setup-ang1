/**
* Container.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var _ = require('underscore-node');

module.exports = {

	tableName: 'Plate',
	migrate: 'safe',
	attributes: {

	},

	alias: function (name) {
		// enable customization of field names if non-standard //
		var alias = { 
			'id' : 'Plate_ID',
			'Parent' : 'FKParent_Plate__ID',
			'qty' : 'Current_Volume',
			'qty_units' : 'Current_Volume_Units',
			'sample_type'  : 'FK_Sample_Type__ID',
			'format' : 'FK_Plate_Format__ID',
			'created' : 'Plate_Created',
			'location' : 'FK_Rack__ID',
			'target_format' : 'FK_Plate_Format__ID',
			'target_sample' : 'FK_Sample_Type__ID',
		}

		var field = alias[name];
		return field;  // return null if no alias defined... 
	},

	track_history: [
		'FK_Rack__ID',
	],

	saveLastPrep : function (plates, prep_id) {
			var deferred = q.defer();
			
			var list = plates.join(',');
				
			Record.update('container', plates, {'FKLast_Prep__ID' : prep_id } )
			.then (function (result) {
					console.log("set last prep id to " + prep_id + ' for ' + list);
					deferred.resolve(result);
			})
			.catch ( function (err) {
				deferred.reject("Error updating last prep id: " + err)
			});

			return deferred.promise;
	},

	loadData : function (ids, condition) {

		var include = 'prep, position, attributes';

		var deferred = q.defer();
			
		ids = Record.cast_to(ids, 'array');

		//var fields = 'Plate_ID as id, Sample_Type as sample_type, Plate_Format_Type as container_format';
		//var query = 'SELECT ' + fields + " FROM Plate LEFT JOIN Sample_Type ON FK_Sample_Type__ID=Sample_Type_ID LEFT JOIN Plate_Format ON FK_Plate_Format__ID=Plate_Format_ID WHERE Plate_ID IN (" + id_list + ')';
		
		var tables = ['Plate'];

		var fields = [
			'Plate_ID as id', 
			'Sample_Type.Sample_Type as sample_type', 
			'Sample_Type_ID as sample_type_id', 
			'Plate_Format_Type as container_format', 
			'Plate_Format_ID as container_format_id',
			'Current_Volume as qty',
			'Current_Volume_Units as qty_units',
			'FKParent_Plate__ID as Parent',
		];

		var left_joins = [
			'Sample_Type ON FK_Sample_Type__ID=Sample_Type_ID',
			'Plate_Format ON FK_Plate_Format__ID=Plate_Format_ID',
		];

		console.log('generate conditions');
		var conditions = [];
		if (condition) { conditions.push(condition) }

		if (ids && ids.length) {
			var id_list = ids.join(',');
			conditions.push('Plate_ID IN (' + id_list + ')');
		}

		console.log("Conditions: " + conditions.join(' AND '));
		if (! conditions.length) {
			console.log('no conditions');
			deferred.reject("no conditions ...");
		}
		else {	
			console.log("continue..");
			if ( include.match(/prep/) ) {
				left_joins.push('Prep ON FKLast_Prep__ID=Prep_ID');
				left_joins.push('lab_protocol ON Prep.FK_Lab_Protocol__ID=lab_protocol.id');
				left_joins.push('protocol_step ON protocol_step.Lab_protocol=lab_protocol.id AND Prep_Name=protocol_step.name');

				fields.push("FK_Lab_Protocol__ID as last_protocol_id")
				fields.push("lab_protocol.name as last_protocol");
				fields.push("MAX(protocol_step.step_number) as last_step_number");
				fields.push("Prep.Prep_Name as last_step");
				fields.push("CASE WHEN Prep.Prep_Name like 'Completed %' THEN 'Completed' WHEN Prep.Prep_Name IS NULL THEN 'N/A' ELSE 'In Process' END as protocol_status");
			}

			if ( include.match(/position/) ) {
				left_joins.push('Rack ON Plate.FK_Rack__ID=Rack.Rack_ID');
				left_joins.push('Rack AS Box ON Rack.FKParent_Rack__ID=Box.Rack_ID');
				fields.push ("case WHEN Box.Rack_Type='Box' THEN Box.Rack_ID ELSE NULL END as box_id");
				fields.push ("case WHEN Box.Rack_Type='Box' THEN Box.Capacity ELSE NULL END as box_size");
				fields.push ("case WHEN Rack.Rack_Type='Slot' THEN Rack.Rack_Name ELSE NULL END as position");
			}

			if ( include.match(/attribute/) ) {
				fields.push("GROUP_CONCAT( CONCAT(Attribute_Name,'=',Attribute_Value) SEPARATOR ';<BR>') as attributes");
				left_joins.push('Plate_Attribute ON Plate_Attribute.FK_Plate__ID=Plate_ID');
				left_joins.push('Attribute ON Plate_Attribute.FK_Attribute__ID=Attribute_ID');
			}

			var query = Record.build_query({tables: tables, fields: fields, left_joins: left_joins, conditions: conditions, group: ['Plate_ID'], debug: true })

		    Record.query(query, function (err, result) {
		    	if (err) {
		    		console.log("error: " + err);
		    		deferred.reject("Error: " + err);
		    	}
		    	else {

		    		for (var i=0; i<result.length; i++) {
		    			if (
		    				result[i].protocol_status == 'In Process' 
		    				&& result[i].last_step && result[i].last_step.constructor === String 
		    				&&  result[i].last_step.match(/^(Aliquot|Extract|Transfer|Pre-Print) /)
		    				&& ! result[i].last_step.match(/ out to /) 
		    				) {
		    					// differentiate internal transfer steps from later (inapplicable) steps 
		    					result[i].protocol_status = 'Completed Transfer';
		    			}
		    		}
		    		// console.log("Loaded DATA: " + JSON.stringify(result));
		    		deferred.resolve(result);
		    	}

		    });
		}

	    return deferred.promise;
		
	},

	target_specs: function (format_id, prep_id) {
		// fields to be reset when item is cloned from an existing container (eg standard transfer)
		var fields = {
			FK_Plate_Format__ID : format_id,
			Plate_Created       : now(),
			FK_Employee__ID     : sails.config.payload.alDenteID,
			FKLast_Prep__ID     : prep_id,	
		}

		return fields;
	},

	standard_transfer : function (ids, target_format_id, prep_id) {


	},

	transfer_Location : function (ids, Transfer) {
		// relocate using WellMapper information (from Transfer hash)
		// Transfer = [{ batch: 0, target_position: "A2", target_box: '' }, { }]

		var deferred = q.defer();

		console.log("Relocating samples : " + ids.join(','));
		console.log(JSON.stringify(Transfer));

		var target_slots   = _.pluck(Transfer,'target_slot');
		console.log("\n** NEW IDS: " + ids);
		console.log("\n** Target slots: " + target_slots.join(','));

		if (target_slots && ids && target_slots.length === ids.length) {
			Record.update('container', ids, { 'FK_Rack__ID' : target_slots })
			.then ( function (result) {
				deferred.resolve(result);
			})
			.catch ( function (err) {
				console.log("Error transferring location: " + err);
				deferred.reject(err);
			});
		}
		else { deferred.resolve() }

		console.log("Transferred targets to applicable slots...");
		return deferred.promise;
	},

	execute_transfer : function (ids, Transfer, Options) {
		//
		// Input: 
		//
		// id: 
		//   = comma-delimited list of id(s)
		//  OR
		// 	 = array of ids
		//  OR 
		//   = array aof hashes: [ { id, ...}. { id: } ...] 
		//             (hashes may contain other sample attributes such as position)
		// 
		// (optionally - if target format, size, position, or # of samples (via splitting) differs)
		// Targets:  array of hashes: [{ 
		//		batch_index, 
		//		source_id, 
		//		source_position, 
		//		target_position,
		//		target_format,
		//		sample_type,
		//		colour_code ?)
		//	},..]
		// Options: hash : { 
		//		transfer_type,
		//		qty: [single value or array]
		//		prep: { prepdata }, 
		// 		/* ?? user, timestamp, extraction_type, target_format, location }    
		//	}
		//
		// Output:
		//
		// Generates records for N x sample transfer:
		//
		// [Optional] Prep record (+ Plate_Prep reccords x N)
		// New Plate records x N
		//  + New MUL Plate records if applicable
		//
		// Updates Source Plate qtys
		// 
		// Returns: create data hash for new Plates.... (need to be able to reset samples attribute within Protocol controller (angular)

		console.log("Executing Container Transfer ... " + Options.transfer_type);
		var deferred = q.defer();

		if (ids && Transfer && Options.transfer_type === 'Move') {
			console.log("only relocating samples");

			Container.transfer_Location(ids, Transfer)
			.then (function (result) {
				console.log("Transferred : " + ids.join(','));
				deferred.resolve( { plate_ids: ids });
			})
			.catch (function (err) {
				console.log("Error relocating samples");
				deferred.reject(err);
			});
		}
		else if (ids) {
			// allow input ids (first parameter) to be either:
			//   - string "1,2,3"
			//   - array [1,2,3]
			//   - array of hashes [{id: 1}, {id: 2}..]
			//

			console.log("\n*** Container.execute_transfer: ***")
			console.log("input IDS:" + JSON.stringify(ids));
			console.log("input Target: " + JSON.stringify(Transfer));
			console.log("input Options: " + JSON.stringify(Options));
			// if (CustomData) { console.log("input CustomData: " + JSON.stringify(CustomData[0]) + '...') }

			Container.get_target_ids(ids, Transfer, Options)
			.then (function (target_ids) {

				console.log("post transfer updates to " + JSON.stringify(target_ids));
				Container.postTransferUpdates(ids, target_ids, Transfer, Options)
				.then (function (finalResponse) {
					console.log("completed transfer");

					Container.transfer_Location(target_ids, Transfer)
					.then (function (result) {
						deferred.resolve( finalResponse );
					})
					.catch (function (err) {
						console.log("Error relocating target samples");
						deferred.reject(err);
					});
				})
				.catch ( function (err) {
					var msg = "problem with post transfer updates ? " + JSON.stringify(err);
					console.log(msg);
					deferred.reject(msg); 
				});
			})
			.catch ( function (err) {
				console.log("problem getting target ids ? " + err);
				deferred.reject("problem getting target ids: " + err);
			});
		}
		else {
			console.log("no ids to transfer");
			deferred.resolve({});
		}
	
		return deferred.promise;
	},

	reset_transfer_data : function (Transfer, Options) {
		// Standard fields that are reset for transferred samples (varies depending upon input options)
		//
		// Returns:
		// reset{
		//	'source' : (hash of changes to source plates)
		//	'target' : (hash of changes to target plates (both for standard transfer, and for final transfer after pre-print process)
		//	'clone' : (hash of changes to clone plates only (will also include reset.target changes)
		//  }

		if (! Transfer) { Transfer = {} }
		if (! Options) { Options = {} }
			
		var deferred = q.defer();

		var target_ids = [];
		
		var resetSource = {};
		var resetTarget = {};

		var resetClone = {
			'Plate_ID' : null,
			'Plate_Status' : 'Active',
			'FKParent_Plate__ID' : '<id>',
			'FK_Rack__ID' : '<NULL>',
			'Plate_Created' : '<now>',
			'FK_Employee__ID' : '<user>' 
		};

		if (Options.prep) {
			resetSource['FKLast_Prep__ID'] = Options.prep;
			resetTarget['FKLast_Prep__ID'] = Options.prep;
		}

		if (Options.transfer_type === 'Pre-Print') {
			resetClone['Current_Volume'] = 0;
			resetClone['Plate_Status'] = 'Pre-Printed';
		}
		else if (Options.transfer_type === 'Transfer' ) {
			resetSource['Plate_Status'] = 'Thrown Out';
		}

		var qtyField = Container.alias('qty');
		var qtyUnits = Container.alias('qty_units');

		if ( ! Options.solution_qty ) { Options.solution_qty = 0 }
		
		if (Transfer[0].qty && Options.transfer_type !== 'Pre-Print') {
			resetTarget[qtyUnits] = Transfer[0].qty_units || Options.transfer_qty_units;
			var quantities = [];
			var adjustments = [];

			for (var i=0; i<Transfer.length; i++) {		
				
				var target_qty = Transfer[i].qty;
				if (Options.solution_qty) {
					var add_qty = Options.solution_qty[i];
					if (add_qty.constructor === String) {
						add_qty = add_qty.parseFloat().toFixed(4);
					}
					target_qty = target_qty + add_qty; // needs to be text to enable comma-delimited list.. 
				}
				quantities.push( target_qty );
				adjustments.push("<" + qtyField + " - " + Transfer[i].qty + ">");		
			}
			resetTarget[qtyField] = quantities;
			resetSource[qtyField] = adjustments;
		}
		else if (Options.solution_qty) {
			resetTarget[qtyField] = Options.solution_qty;
		}

		// Target options 
		if (Transfer[0].Sample_type || Options.Sample_type) {
			resetTarget['FK_Sample_Type__ID'] = Transfer[0].Sample_type || Options.Sample_type;
		}

		if (Transfer[0].Container_format || Options.Container_format) {
			resetTarget['FK_Plate_Format__ID'] = Transfer[0].Container_format || Options.Container_format;
		}	
		
		var extras = Object.keys(Transfer);
		for (var i=0; i<extras.length; i++) {

		}

		var reset = { target: resetTarget, clone: resetClone, source: resetSource}
		deferred.resolve(reset);

		console.log('Reset:  ' + JSON.stringify(reset));
		return deferred.promise;
	},

	get_target_ids: function (ids, Transfer, Options) {

		var deferred = q.defer();
		console.log("get target ids from " + JSON.stringify(ids));
		Container.reset_transfer_data(Transfer, Options)
		.then (function (result) {

			var resetTarget = result.target;
			var resetSource = result.source;
			var resetClone  = result.clone;

			console.log("\n*** Reset Values: " + JSON.stringify(result));

			Container.retrieve_PrePrinted(ids)
			.then (function (retrieved) {
				if (retrieved) {
					console.log("Retrieved: " + JSON.stringify(retrieved));
					// pre-printed plates salvaged

					var parents = retrieved.parents;
					var current_ids = retrieved.ids;

					// also set to Active ...
					resetTarget['Plate_Status'] = 'Active';
					
					Record.update('container', current_ids, resetTarget );

					if (resetSource && Object.keys(resetSource).length) {
						Record.update('container', parents, resetSource)
					}

					deferred.resolve(current_ids);
				}
				else {
					// clone new plates 
					// Add new records to Database //
					var clone_ids = _.pluck(Transfer,'source_id');
					Options['id'] = Container.alias('id');
					console.log("Clone Plates: " + clone_ids.join(','));
					Record.clone('container', clone_ids, _.extend(resetTarget, resetClone), Options)
					.then ( function (cloneData) {
						console.log("Cloned Plates.");

						if (resetSource && Object.keys(resetSource).length) {
							console.log("Update Source: " + JSON.stringify(resetSource));
							Record.update('container', clone_ids, resetSource)
						}

						if (cloneData.data) {
							console.log("\nCreated new record(s) from execute transfer: " + JSON.stringify(cloneData.data[0]) + '...');
						}
						var newIds = cloneData.insertIds;    //'generated list of ids... eg 1,2,3'; // temp testing
						
						Barcode.printLabels('Plate', newIds)
						.then (function (printed) {
							deferred.resolve(newIds);
						})
						.catch (function (err) {
							sails.warning("non-fatal Error encountered printing labels");
							deferred.resolve(newIds);
						});
						
					})
					.catch ( function (err) {
						console.log("Cloning Error: " + JSON.stringify(cloneError));
						deferred.reject( err );						
					});
				}
			})
			.catch ( function (err) {
				console.log("Error checking for pre-printed plates: " + err);
				deferred.reject( err );
			});
		})
		.catch ( function (err) {
			deferred.reject("Error generating reset data: " + err); 
			//return res.render('lims/WellMap', { sources: Sources, errorMsg: "cloning Error"});
		});

		return deferred.promise;
	},

	postTransferUpdates : function (old_ids, new_ids, target, options) {

		var deferred = q.defer();
		console.log('post Transfer updates...');

		if ( ! target ) { target = {} }
		if ( ! options ) { options = {} }

		console.log(JSON.stringify(target));
		console.log(JSON.stringify(options));

		var promises = [];

		if ( options.reset_focus ) {
			console.log("retaining focus on current samples");
		}
		else {
			console.log("load new data");
			promises.push( Container.loadData(new_ids) );
		}

		if (options.solution_qty) {
			console.log("\n*** Need to add solution quantities if applicable ...");
		}


		var returnVal = { plate_ids : new_ids };
		
		q.all(promises)
		.then ( function (results) {
			var Samples;

			if ( !options.reset_focus ) { 
				returnVal['Samples'] = results[0];
			}

			// sails.config.messages.push('Executed Transfer : ' + options.transfer_type);
			console.log("executed transfer: "); //  + JSON.stringify(returnVal));

			//var messages = Record.merge_Messages(results);
			//console.log("\n*** Merged Messages: " + JSON.stringify(messages) );

			deferred.resolve(returnVal);
		})
		.catch ( function (err) {
			console.log("encountered non-fatal error executing Container Promises: " + JSON.stringify(err));
			returnVal['Error'] = 'Promise errors: ' + JSON.stringify(err);
			deferred.reject(returnVal); 
		});

		return deferred.promise;
	},

	retrieve_PrePrinted : function retrievePrePrint(ids) {
		// returns list of pre-printed plates if applicable. 
		var deferred = q.defer();

		var query = "Select Plate_ID as id, FKParent_Plate__ID as parent from Plate WHERE Plate_ID IN (" + ids.join(',') + ") AND Plate_Status = 'Pre-Printed'";
		Record.query_promise(query)
		.then ( function (target_list) {
			console.log("check for pre-printed plates: " + query);
			console.log(JSON.stringify(target_list));

			if (target_list.length == 0) {
				deferred.resolve();
			}
			else {

				var targets = _.pluck(target_list,'id');
				var parents = _.pluck(target_list,'parent');

				if (ids.length && ids.length != targets.length) { 
					sails.config.warnings.push("list of retrieved pre-printed plates is shorter than expected!");
				}
				deferred.resolve({ids: targets, parents: parents});
			}
		})
		.catch ( function (err) {
			console.log("could not retrieve pre-printed plates " + err);
			deferred.reject(err);
		})

		return deferred.promise;
	},

	position : function (id) {
		return ' i' + id;
	},

	transfer : function ( parameters ) {
		// Add logic for custom transfer pattern ... 
		console.log("Execute Transfer: " + JSON.stringify(parameters));
		return {};
	},

	custom_transfer : function ( custom_parameters ) {
		// Add logic for custom transfer pattern ... 
		return ;
	},

	create_daughter : function (id, target_format_id, prep_id) {
		Record.clone( id, Container.target_specs(target_format_id));
		return;
	},

	relocate : function (ids, target) {
		
		var deferred = q.defer();

		if (ids.length && ( target.length == 1 || target.length == ids.length) ) {
			Record.update('container', ids, { 'FK_Rack__ID' : target })
			.then (function (ok) {
				deferred.resolve(ok);
			})
			.catch (function (err) {
				deferred.reject(err);
			});
		}
		else {
			if (ids.length) {
				var msg = "List of Target locations doesn't match length of ids " + JSON.stringify(target);
				deferred.reject(msg);
			}
			else {
				deferred.reject("No ids to move... ");
			}
		}
		
		return deferred.promise;
	},

};

  
