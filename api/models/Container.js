/**
* Container.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {

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

	saveLastPrep : function (plates, prep_id) {
		var deferred = q.defer();
		
		var list = plates.join(',');
		
		var query = "UPDATE Plate SET FKLast_Prep__ID = "
			+ prep_id + " WHERE Plate_ID IN (" + list + ")";
			
		Record.query( query, function (err, result) {	
			if (err) { deferred.reject("Error updating last prep id: " + err) }
			else {
				console.log("set last prep id to " + prep_id + ' for ' + list);
				deferred.resolve(result);
			}
		});

		return deferred.promise;
	},

	loadData : function (ids) {

		var include = 'prep, position, attributes';

		ids = Record.cast_to(ids, 'array');
		id_list = ids.join(',');

		var deferred = q.defer();

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
		];

		var left_joins = [
			'Sample_Type ON FK_Sample_Type__ID=Sample_Type_ID',
			'Plate_Format ON FK_Plate_Format__ID=Plate_Format_ID'
		];

		var conditions = [
			'Plate_ID IN (' + id_list + ')'
		];


		if ( include.match(/prep/) ) {
			left_joins.push('Prep ON FKLast_Prep__ID=Prep_ID');
			left_joins.push('lab_protocol ON Prep.FK_Lab_Protocol__ID=lab_protocol.id');

			fields.push("FK_Lab_Protocol__ID as last_protocol_id")
			fields.push("lab_protocol.name as last_protocol");
			fields.push("Prep.Prep_Name as last_step");
			fields.push("CASE WHEN Prep.Prep_Name like 'Completed %' THEN 'Completed' WHEN Prep.Prep_Name IS NULL THEN 'N/A' ELSE 'In Process' END as protocol_status");
		}

		if ( include.match(/position/) ) {
			left_joins.push('Rack ON Plate.FK_Rack__ID=Rack_ID');
			fields.push ("case WHEN Rack_Type='Slot' THEN Rack_Name ELSE NULL END as position");
		}

		if ( include.match(/attribute/) ) {
			fields.push("GROUP_CONCAT( CONCAT(Attribute_Name,'=',Attribute_Value) SEPARATOR '; ') as attributes");
			left_joins.push('Plate_Attribute ON Plate_Attribute.FK_Plate__ID=Plate_ID');
			left_joins.push('Attribute ON Plate_Attribute.FK_Attribute__ID=Attribute_ID');
		}

		var query = Record.build_query({tables: tables, fields: fields, left_joins: left_joins, conditions: conditions, group: ['Plate_ID'] })

		console.log("SQL: " + query);
	    Record.query(query, function (err, result) {
	    	if (err) {
	    		console.log("error: " + err);
	    		deferred.reject("Error: " + err);
	    	}
	    	else {
	    		console.log("Loaded DATA: " + JSON.stringify(result));
	    		deferred.resolve(result);
	    	}

	    });
	    	
	    return deferred.promise;
		
	},

	target_specs: function (format_id, prep_id) {
		// fields to be reset when item is cloned from an existing container (eg standard transfer)
		var fields = {
			FK_Plate_Format__ID : format_id,
			Plate_Created       : now(),
			FK_Employee__ID     : sails.config.userid,
			FKLast_Prep__ID     : prep_id,	
		}

		return fields;
	},

	standard_transfer : function (ids, target_format_id, prep_id) {


	},

	execute_transfer : function (ids, target, options, CustomData) {
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

		console.log("Executing Container Transfer ... ");
		var deferred = q.defer();

		if (ids) {
			// allow input ids (first parameter) to be either:
			//   - string "1,2,3"
			//   - array [1,2,3]
			//   - array of hashes [{id: 1}, {id: 2}..]
			//

			console.log("\n*** Container.execute_transfer: ***")
			console.log("input IDS:" + JSON.stringify(ids));
			console.log("input Target: " + JSON.stringify(target));
			console.log("input Options: " + JSON.stringify(options));
			console.log("input CustomData: " + JSON.stringify(CustomData));

			var resetData = {
				'Plate_ID' : '',
				'FKParent_Plate__ID' : '<id>',
				'FK_Rack__ID' : '<NULL>',
				'Plate_Created' : '<now>',
				'FK_Employee__ID' : '<user>' 
			};

			// Update Volumes if applicable (default to entire qty) 
			if (options.qty) {
				//resetData['Current_Volume'] = options.qty;
				resetData['Current_Volume_Units'] = options.qty_units;

				console.log("track removal of " + options.qty + options.qty_units);
				//Container.updateVolume(ids, -options.qty, options.qty_units, { prep : options.prep_id});
			}

			if (options.prep) {
				resetData['FKLast_Prep__ID'] = options.prep;
			}
			if (options.transfer_type === 'Pre-Print') {
				resetData['Plate_Status'] = 'Pre-Printed';
			}

			if (target.sample_type) {
				resetData['FK_Sample_Type__ID'] = target.sample_type;
			}

			if (target.format) {
				resetData['FK_Plate_Format__ID'] = target.format;
			}

			var custom_ids = [];
			//var customReset = {};
			if (CustomData) {

				console.log("Custom Data: ");
				var resetKeys = Object.keys(CustomData[0]);
/*
				for (var i=0; i<CustomData.length; i++) {
					custom_ids.push(CustomData[i].source_id);
				}
*/
				for (var i=1; i<resetKeys.length; i++) {
					var key = resetKeys[i];
					var list = Record.cast_to(CustomData, 'Array', key);

					console.log("check for alias for " + key);
					if (key == 'source_id') { custom_ids = list }
					else {
						var field = Container.alias(key);
						console.log("Alias = " + field);
						if (field) { 
							for (var j=0; j<CustomData.length; j++) {
								var ref = CustomData[j]['source_id'];
								var reset = CustomData[j][key];

								if (! resetData[field] ) { resetData[field] = {} }
								
								if (resetData[field][ref] && resetData[field][ref].constructor === String ) {
									resetData[field][ref] = [resetData[field][ref], reset];
								}
								else if (resetData[field][ref] && resetData[field][ref].constructor === Array) {
									resetData[field][ref].push(reset);
								} 
								else { resetData[field][ref] = reset }

								console.log(field + ' : ' + ref + '=' + JSON.stringify(resetData[field][ref]) );
							}
							console.log("Reset Custom Data: " + field + ' = ' + resetData[field] );
						}
					}
				}
				console.log("regenerated id list: " + custom_ids + '. Reset:  ' + JSON.stringify(resetData));
				//console.log("Custom: " + JSON.stringify(customReset));
				// Set ResetData to ResetData[source_id][field] = (array of values for each source_id cloned ... )
			}
			else {
				custom_ids = ids;
			}

			console.log("\n*** Clone Plates *** Reset: " + JSON.stringify(resetData));

			// Add new records to Database //
			Record.clone('Plate', custom_ids, resetData, { id: Container.alias('id') })
			.then ( function (cloneData) {

				var returnVal = { Cloned: cloneData };

				console.log("\nCreated new record(s): " + JSON.stringify(cloneData));
				var newIds = cloneData.insertIds;    //'generated list of ids... eg 1,2,3'; // temp testing
				
				Barcode.printLabels('Plate', newIds);
				
				var promises = [];

				if (options.transfer_type != 'Pre-Print') {
					promises.push( Container.loadData(newIds) );
				}

				if (options.transfer_type === 'Transfer') {
//					promises.push( Record.update('Plate',ids, { Plate_Status: 'Thrown Out', FK_Rack__ID: Rack.garbage() } ));  test
				}	

				//if (options.solution_qty) {
					console.log("\n*** Need to add solution quantities if applicable ...");
				//}
				
				q.all(promises)
				.then ( function (results) {
					var Samples;

					if (target.transfer_type != 'Pre-Print') { 
						returnVal['Samples'] = results[0];
					}

					sails.config.messages.push('Executed Transfer');

					console.log("executed transfer: " + JSON.stringify(returnVal));
					var messages = Record.merge_Messages(results);
					console.log("\n*** Merged Messages: " + JSON.stringify(messages) );

					deferred.resolve(returnVal);
				})
				.catch ( function (err) {
					console.log("encountered error executing Container Promises");
					returnVal['Error'] = 'Promise errors: ' + JSON.stringify(err);
					deferred.reject(returnVal);
				});

			})
			.catch ( function (cloneError) {
				console.log("Cloning Error: " + JSON.stringify(cloneError));
				deferred.reject( {error: cloneError});
				//return res.render('lims/WellMap', { sources: Sources, errorMsg: "cloning Error"});
			});
		}
		else { deferred.reject({error: "No ids to transfer indicated"}) }

		return deferred.promise;
	},

	rearray_transfer : function ( sources, target, options) {

		var deferred = q.defer();

		// input parameters: id [], target_format_id, prep_id, target_size, target_rows, target_cols
		var ids = sources[0].id;   // test

		var target_format_id = target.format;
		var prep_id = options.prep_id;
		var target_size = target.size || 1;

		var target_dimensions = target.size.split('\s*x\s*');  // 8 x 12 -> [8,12]

		var rows = target.Max_Row || ['A'];
		var cols = target.Max_Col || [1];

		var x_min = rows[0];
		var x_max = rows[rows.length-1];
		var y_min = cols[0];
		var y_max = cols[cols.length-1];

		if (target_dimensions.length>1) {
			x_size = target_dimensions[0];
			y_size = target_dimensions[1];
		}
		else { 
			x_size = 1;
			y_size = 1;
		}

		var fill_by = 'column';  //  add row option later...

		var x = x_min;  
		var y = 1;  

		var array = [];
		var rearray = [];
		var preserve_x = 8;

		var map = {};

		var target_index = 0;
		var target_position = x_min + y_min.toString();
		var targets = [111]; // CUSTOM TEST

		array.push(targets[target_index], target_position);  // store mul plate record... 

		for (var i=0; i<ids.length; i++) {
			var posn = sources[i].position || Container.position(ids[i]);
			rearray.push([ids[i], posn, targets[target_index], target_position]);

			if (fill_by == 'row') {
				y++;
				if (y > y_max) {
					y = 1;
										
					if (x == x_max) {
						x=x_min;
						y = y_min;
						target_index++;       // next plate ... 
					}
					else {
						x = String.fromCharCode(x.charCodeAt(0) + 1);
					}
				}
			}
			else {
				if (x == x_max) {
					x=x_min;
					if (y >= y_max) {
						y=y_min;
						target_index++;       // next plate ... 
						targets.push('PLA' + target_index );
					}
					else {
						y++;
					}
				}	
				else {
					x = String.fromCharCode(x.charCodeAt(0) + 1);
				}

			}

			var target_position = x + y.toString();
			console.log(target_position);
			
			array.push(targets[target_index], target_position);  // store mul plate record... 

			var index = targets[target_index] + ':' + target_position;
			map[index] = ids[i];

			rearray.push([ids[i], Container.position(ids[i]), targets[target_index], target_position]);
		}
		console.log("Map to " + JSON.stringify(targets));
		var data = { map : map, targets : targets, rows : rows,  cols : cols };
		console.log("xfer data: " + JSON.stringify(data));

		deferred.resolve(data);
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

	transfer_samples : function ( sources, target, options ) {
		// Input: 
		//
		// id: comma-delimited list of id(s)
		// Sources: array of hashes [ { id, ...}. { id: } ...] - may contain other sample attributes
		// Targets:  array of hashes: [{ source_index, source_id, source_position, target_index, target_position, qty, units, colour_code ?)},..]
		// Options: hash : { prep: { prepdata }, user, timestamp, extraction_type, target_format, location }    
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
		
		q.when( Container.rearray_transfer(sources, target, options) )
		.then ( function (map) {
			console.log("Map: " + JSON.stringify(map));

			var Targets = map.Targets || [];   // array of targets (hashes)
			//var Sources = map.Sources || [];   // array of sources (hashes)
			var Set     = map.Set || map.Options || {};       // optional specs: format, sample_type

			var id = map.id || '';
			var ids = id.split(/\s*,\s*/);

			var size = Set.size || '1-well'; // || Container.get_size(ids);
			var target_size   = Set.target_size || 1;
			var target_format = Set.target_format;
			var prep_id = Set.prep_id;
			var target_cols = Set.target_cols;
			var target_rows = Set.target_rows;

			// ? for (var i=0; i<Sources.length; i++) {
			var input = ['qty', 'qty_units'];

			var optional_input = Object.keys(Set);

			// resetData is comprised of a potential combination of standard field resets:
			var resetData = {'id' : '<NULL>', 'location' : '<NULL>'};
			// ... and item specific resets (keyed on id) as set below
			// eg resetData = { 15: { parent_id = 7 }, 'Plate_ID' : '<NULL>'}

			for (var j=0; j<optional_input.length; j++) {
				var opt = optional_input[j];
				var fld = Container.alias(opt) || opt; // map standard names to custom aliases
				if (Set[opt]) { resetData[fld] = Set[opt] };
				console.log("optionally set " + opt + " to " + Set[opt]);
			}

			console.log(Targets.length + " target samples to be created...");
			var clone_ids = [];
			for (var i=0; i<Targets.length; i++) {
				var thisId = Targets[i].source_id;
				clone_ids.push(thisId);
				resetData[thisId] = { };

				var parent = Container.alias('Parent') || 'Parent';
				resetData[thisId][parent] = thisId;

				for (j=0; j<input.length; j++) {
					var fld = Container.alias(input[j]) || input[j];
					var val = Targets[i][input[j]] || Set[input[j]] || null;
					resetData[thisId][fld] = val;
					console.log("Reset " + input[j] + ' / ' + fld + ' -> ' + val);
				}
				console.log("\n*** Clone sample: id=" + thisId );
			}

			console.log("\n*** Clone RESET: " + JSON.stringify(resetData));

			Record.clone('Plate', clone_ids, resetData, { id: 'Plate_ID' })
			.then ( function (cloneData) {
				console.log("\nCreated new record(s): " + JSON.stringify(cloneData));
				return res,json(cloneData);
				//return res.render('lims/WellMap', { sources: Sources, Targets: Targets, target: { wells: 96, max_row: 'A', max_col: 12 }, options : { split: 1 }});
			})
			.catch ( function (cloneError) {
				console.log("Cloning Error: " + cloneError);
				return res.send('error2');
				//return res.render('lims/WellMap', { sources: Sources, errorMsg: "cloning Error"});
			});


		//if (1) { return res.render('lims/WellMap', { sources: Sources, Targets: Targets, target: { wells: 96, max_row: 'A', max_col: 12 }, options : { split: 1 }}) }

			/*
			var params = { id: sources, target_format_id: target_format, prep_id : prep_id, target_size: target_size, target_cols : target_cols, target_rows : target_rows}; // TEST
			// Track transfer as rearray (track individual well movement)

			console.log('test rearray transfer');
			Container.rearray_transfer( params )
			.then ( function (data) {
				Barcode.generate(barcodes);
				var map = data.map;
				var rows = data.rows;
				var cols = data.cols;
				var targets = data.targets;

				console.log("rows: " + JSON.stringify(rows));
				return res.render('lims/WellMap', { sources: sources, Map : map, rows: rows, cols: cols, targets : targets}); 
			})
			.catch ( function (err) {
				return res.send('Rearray Error');
			});
		}
			*/
		});		
	},

};

  