/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var fs = require('fs');
var _ = require('underscore-node');

var significant_digits = 4;

module.exports = {

	attributes: {

	},

	isReference : function (model, field) {

		var Mod = sails.models[model];
		var table = model;
		var fk = {};

		if (Mod) {
			fk = Mod.attributes[field];
			table = Mod.tableName || model;
		}

		if (fk && fk.model) { return fk.model}
		else {
			var match = field.match(/^FK[a-zA-Z]*\_(\w+)\_\_ID/);
			if (match && match.length > 1) { return match[1] }
			else { return false } 
		}
	},

	dump : function (model, options) {
		if (!options) { options = {} }

		var deferred = q.defer();

		var table = model;
		var primary = 'id';
		
		var N = options.N;
		var id = options.id;
		var ids = options.ids;
		var iterate = options.iterate;

		if (iterate >10) { 
			iterate = 0;
			console.log("Killing iteration after 10 generations... possible circular logic");
		}

		var Mod;

		if (sails && sails.models && sails.models[model]) {
			Mod = sails.models[model]; 
			table = Mod.tableName || model;
			primary = Mod.primaryField || 'id';
			console.log('reset to ' + table + '.' + primary);
		}
		else {
			console.log(model + ' not official model... ignoring ' + table);
			deferred.resolve({});
		}

		var query = "SELECT * FROM " + table;

		if (id) { query = query + " WHERE " + primary + " >= " + id }
		else if (ids) { query = query + " WHERE " + primary + ' IN (' + ids.join(',') + ')' }
		
		if (N) { query = query + " LIMIT " + N }

		console.log("dump query: " + query);
		console.log("iterating through reference records ?: " + iterate);

		Record.query_promise(query)
		.then ( function (result) {
			console.log("R: " + JSON.stringify(result));
			
			var fields = [];
			var Referenced = {};
			var isReference = {};
			if (result.length) {
				fields = Object.keys(result[0]);
				for (var j=0; j<fields.length; j++) {
					// console.log('check for reference from ' + table + '.' + fields[j]);
					var refTable = Record.isReference(model, fields[j]);
					if (refTable) { 
						Referenced[refTable] = [];
						isReference[fields[j]] = refTable;
					}
				}
			}

			for (var i=0; i<result.length; i++) {
				for (var j=0; j<fields.length; j++) {
					if ( isReference[fields[j]] ) {
						var refid = result[i][fields[j]];
						if (refid) {
							Referenced[isReference[fields[j]]].push(refid);
						}
					}	
				}
			}

			console.log('ref tables: ' + JSON.stringify(isReference));
			console.log("Referenced: " + JSON.stringify(Referenced));

			var refs = Object.keys(Referenced);

			var primaryResult = {};
			primaryResult[model] = result;

			var list = primaryResult;

			console.log("retrieved results for " + model);
			console.log(JSON.stringify(list));

			var promises = [];
			for (var i=0; i< refs.length; i++) {
				if (Referenced[refs[i]].length) {
					console.log("append " + refs[i] + ': ' + Referenced[refs[i]]);
					promises.push(Record.dump(refs[i].toLowerCase(), {ids: Referenced[refs[i]], iterate: iterate+1}));
				}
			}

			console.log('executing ' + promises.length + ' Promises...');

			q.all(promises)
			.then ( function (results) {
				if (results.length) {
					console.log('*** subresults: ' + JSON.stringify(results));
					for (var i=0; i<results.length; i++) {
						var models = Object.keys(results[i]);
						console.log("add models : " + models.join(','));
						for (var j=0; j<models.length; j++) {
							if ( ! list[models[j]] ) { list[models[j]] = [] }
							console.log("Add each of : " + JSON.stringify(results[i][models[j]]));
							for (var k=0; k<results[i][models[j]].length; k++) {
								list[models[j]].push(results[i][models[j]][k]);
							}
						}
					}
				}
				else { console.log('no secondary results for ' + model) }

				deferred.resolve(list);
			})
			.catch (function (err) {
				console.log("Error generating results for " + model);
				deferred.reject(err);
			});

		})
		.catch ( function (err) {
			console.log("Error with primary query for " + model);
			console.log(err);
			deferred.reject(err);
		});

		return deferred.promise;
	},

	get_fields : function (table) {		
		var deferred = q.defer();
		var model = table;

		Record.query_promise("desc " + table)
		.then (function (result) {
			if (result.length == 0 ) {
				var e = new Error("no table found");
				deferred.reject(e);
			}
			else {
				/*
				if ( sails.models[model] && sails.models[model]['attributes']['role'] && sails.models[model]['attributes']['role']['xdesc']) {
					console.log('load extra info...' + sails.models[model]['attributes']['role']['xdesc'])
				}
				*/
				var recordModel;
				console.log("check for model: " + model + " : " + table);
				if (sails.models[model]) {
					console.log(model + ' Access: ' + sails.models[model]['access']);
					console.log("MODEL:cp  " + sails.models[model]);
					recordModel = sails.models[model];
				}

				var Fields = [];
				for (var i=0; i<result.length; i++) {
					var fld = result[i]['Field'];
					var type = result[i]['Type'] || 'undefined';
					var options = [];
					var lookup = {};

					console.log("Field: " + fld + ": " + type);
					if (recordModel && recordModel.attributes  && recordModel.attributes[fld]) {
					    if (recordModel.attributes[fld]['type']) {
		                    if (recordModel.attributes[fld]['enum']) {
		                        type = 'enum';
		                      	options = recordModel.attributes[fld]['enum'];
		                    } 
		                    else if (recordModel.attributes[fld]['type'] == 'boolean') {
		                        type = 'boolean';
		                      	//options = recordModel.attributes[fld]['enum'];
		                    }
		                    else if (recordModel.attributes[fld]['type'] === 'int') {
		                    	type = 'number';
		                    }
		                }
		                else if (recordModel.attributes[fld]['collection']) {
		                    type = 'list link';
		                }
		                else if (recordModel.attributes[fld]['model']) {
		                    type = 'lookup';
		                    options.lookup = recordModel.attributes[fld]['model'];
						} 
					}

					if (fld == 'id' || fld == 'createdAt' || fld == 'updatedAt') {
						type = 'Hidden'
					}

					Fields.push({'Field' : fld, 'Type' : type, 'Options' : options, 'Lookup' : lookup});
				}
				deferred.resolve(Fields);								
			}
		})
		.catch ( function (err) {
			deferred.reject(err);
		});

		return deferred.promise;
	},

	reverse_Map : function (map) {
		var keys = Object.keys(map);

		var reverseMap = {};
		for (var i=0; i<keys.length; i++) {
			var key = keys[i];
			var val = map[key];

			reverseMap[val] = key;
		}

		return reverseMap;
	},

	from_Legacy : function (data, map) {
		// gets data in mew format from legacy data format ... 
		var mapped_keys = Object.keys(map);
		var input_keys  = Object.keys(data);

		var reverse_Map = Record.reverse_Map(map);

		var mapped = {};
		for (var i=0; i<input_keys; i++) {
			var legacy_field = input_keys[i];
			var new_field = reverse_Map[legacy_field];

			if (reverse_Map[legacy_field]) {
				mapped[new_field] = data[legacy_field];
			}
			else {
				mapped[legacy_field] = data[legacy_field];
			}
		}


		return mapped;
	},

	to_Legacy : function (data, map) {
		// gets data in legacy format from new data format ... 
		var mapped_keys = Object.keys(map);
		var input_keys  = Object.keys(data);

		var mapped = {};
		for (var i=0; i<input_keys.length; i++) {
			var new_field = input_keys[i];
			var legacy_field = map[new_field];

			if (map[new_field]) {
				mapped[legacy_field] = data[new_field];
			}
			else {
				mapped[new_field] = data[new_field];
			}
		}

		return mapped;
	},

// Generic methods 

	insert_Ids : function (result) {
		// parse returned value from createNew ...
		var id = result.insertId;
		var count = result.affectedRows;

		var ids = [];
		for (var i=0; i<count; i++) {
			ids.push(id++);
		}
		return ids;
	},

	restore_order : function (data, list, ref) {
		//
		// Input:
		//   data - array of hashes
		//   list - original list (the order of which you want to preserve)
		//   ref - [defaults to 'id'] - the reference key in the hashes corresponding to the values supplied in 'list' 
		//
		// sorts array of hashes into an order based upon an original list that is included in the hash
		//
		// This is particularly useful when trying to sort mySQL results based upon the order of a supplied list.
		// eg.  select * from Plate where Plate_ID IN (3,1,2), will return 1,2,3, but you may wish the results in the original order (eg 3..1..2)
		//

		ref = ref;
		
		var sorted_results;

		if (data.constructor === Array && data.length) {
			if (ref) {
				console.log("restore order of hash " + data[0].constructor);
				sorted_results = _.sortBy(data, function(record) {
				    return list.indexOf(record[ref]);
				});
			}
			else {
				console.log("restore order of array " + data[0].constructor);
				sorted_results = [];

				for (var i=0; i<list.length; i++) {
					var refList = data;

					if (list[i].constructor === String && data[0].constructor === Number) {
						index = refList.indexOf(parseInt(list[i]));
					} 
					else if (list[i].constructor === Number && data[0].constructor === String) {
						index = refList.indexOf(list[i].toString());
					}
					else {
						index = refList.indexOf(list[i]);
					}

					if (index >=0) {
						console.log("push " + index + ': ' + JSON.stringify(data[index]));
						sorted_results.push(data[index])
					}
				}
				console.log("Sorted: " + sorted_results.join(','));
			}
		}
		else {
			console.log("no array to resort...");
			sorted_results = data;
		}

		return sorted_results;
	},


	// Generic methods ... 
	reset_messages : function (type) {
		if (type === 'messages' || !type ) { sails.config.messages = [] }
		if (type === 'warnings' || !type ) { sails.config.warnings = [] }
		if (type === 'errors' || !type ) { sails.config.errors = [] }
	},

	wrap_result : function (result) {
		// append config messages to result returned via api

		var data = {};
		data['data'] = result;
		data['messages'] = sails.config.messages;
		data['warnings'] = sails.config.warnings;
		data['errors']   = sails.config.errors;

		return data;
	},

	build_query: function (options) {

		if (!options) { 
			console.log("cannot build query without options");
			return '';
		}
		
		if (! options.fields || ! options.fields[0]) {
			console.log("no fields requested");
			return '';
		}

		var tables = options.tables || options.table;
		var fields = options.fields;
		var left_joins = options.left_joins;
		var groupBy    = options.group;
		var orderBy    = options.order;
		var limit      = options.limit;
		var debug      = options.debug;

		var conditions = options.conditions;
		
		var query = 'SELECT ' + fields.join(',');

		if (tables) { query = query + ' FROM (' + tables.join(',') + ')' }
		
		if (left_joins && left_joins.length) { query = query + ' LEFT JOIN ' + left_joins.join(' LEFT JOIN ') }
		if (conditions && conditions.length) { query = query + ' WHERE ' + conditions.join(' AND ') }

		if (groupBy && groupBy.length) { query = query + ' GROUP BY ' + groupBy.join(',') }
		if (orderBy && orderBy.length) { query = query + ' ORDER BY ' + orderBy.join(',') }
		if (limit) { query = query + ' LIMIT ' + limit }

		if (debug) { console.log("built query: " + query) }
		return query;
	},

	query_promise: function (query) {
		// Wrapper for standard Record.query returning a promise //	
		var deferred = q.defer();

		Record.query(query, function (err, result) {
			if (err) { 
				console.log("query promise error: " + query);
				console.log(err);

				var parsed_error = Record.parse_standard_error(err);
				console.log("Parsed: " + parsed_error);

				deferred.reject(parsed_error);
			}
			else { deferred.resolve(result) }
		});

		return deferred.promise;	
	},

	cast_to : function (input, target, hashKey ) {

		var returnVal;
		if ( target.match(/array/i) ) {		
			returnVal = [];
			// console.log("casting " + JSON.stringify(input) + ' to ' + target);
			if (input && input.constructor === Array) {
				if (hashKey && input[0] && input[0].constructor === Object && input[0][hashKey]) {
					for (var i=0; i<input.length; i++) {
						returnVal.push(input[i][hashKey]);
					}
				}
				else { returnVal = input }
			}
			else if (input && input.constructor === String)  {
				returnVal = input.split(/\s*,\s*/);
			}
			else if (input && input.constructor === Number ) {
				var number = input.toString();
				returnVal = number.split(/\s*,\s*/);
			}
			else if (input) {
				console.log("not array or string ? " + input.constructor);
			}
		}
		else if (! input) { console.log("Nothing to cast") }
		else { console.log("Logic not yet supplied for target type: " + target) }

		return returnVal;
	},

	merge_Messages: function (results, merged) {
		// retrieve results from multiple promises - primarily intended to retrieve messages / errors / warnings
		// eg console.log( merged_Results(results, messages).join("\n"));
		
		var message_types = ['message', 'warning', 'error'];
		if (!merged) { merged = {} }

		for (var i=0; i<results.length; i++) {
			for (var j=0; j<message_types.length; j++) {
				var mType = message_types[j];
				var mTypes = mType + 's';
				var found = results[i][mType] || results[i][mTypes];
				if (found) {
					if (!merged[mTypes]) { merged[mTypes] = [] }
						// test ... also account for string value ... replace with array ... 
					if ( found.constructor === Array ) {
						for (k=0; k<found.length; k++) {
							merged[mTypes].push(found[k]);   
						}
					}
					else {
						merged[mTypes].push(found);
					}
				}
			}
		}
		console.log(JSON.stringify(merged));
		return merged;
	},

	grab: function (table, condition) {
		// Wrapper for simple extract (similar to waterline findOne but not dependent upon waterline format)
		
		var deferred = q.defer();

		Record.query("SELECT * FROM " + table + " WHERE " + condition, function (err, result) {
			if (err) { 
				console.log("Error grabbing " + table + ' record.'); 
				deferred.reject(err);  
			}
			else if (result.length == 0) {
				console.log("No " + table + " records matching condition: " + condition);
				deferred.resolve([]);
			}
			else {
				deferred.resolve(result);
			}
		});
		return deferred.promise;
	}, 

	upload_SQL_File: function (table, file) {

		var deferred = q.defer();
		try {
			var f = fs.readFileSync(file, {encoding: 'utf-8'} );

			console.log("Upload file: " + file);			
			f = f.split("\n");

			var headers = f.shift().split(/\t/);

			var data = [];
			f.forEach ( function (row) {
				var elements = row.split(/\t/);
				var record = {};

				if (elements[0]) {
					for (var i=0; i<elements.length; i++) {
						record[headers[i]] = elements[i];
	 				}
	 				data.push(record);
	 			}
			})
			console.log("* Added " + data.length + " custom records in " + table);
			// console.log("\nHeaders: " + headers);
			Record.createNew(table, data, {}, { reset: { NULL : "\\N" }} )
			.then ( function (added) {
				sails.config.messages('added ' + table + ' record(s)');

				deferred.resolve(added);
			})
			.catch ( function (err) {
				var msg = "Error adding data to " + table + ":\n" + JSON.stringify(err);
				deferred.reject(err);
			});
		} 
		catch (e) {
			deferred.reject(e);
		}

		return deferred.promise;
	},

	join_data: function (join_to) {   


		//var deferred = q.defer;

	    var rawData = join_to['join'];
	    var to      = join_to['to'];
	    var map     = join_to['map'];  // map primary attributes to new name (eg rename id fields to avoid duplicate references)

	    console.log("Map: " + JSON.stringify(map));
	    var data = [];
	    for (var i=0; i<rawData.length; i++) {

			var Ndata = rawData[i][to];

			var keys = Object.keys(rawData[i]);

			for (j=0; j<keys.length; j++) {
				var key = keys[j];
				if (key != to) {
					var mapkey = key;

					if (map && map[key]) { mapkey = map[key] }
					
					if (map && map[to] && map[to][key]) { Ndata[map[to][key]] = Ndata[key] }
					else { Ndata[mapkey] = rawData[i][key] }
				}
			}

	      	data.push(Ndata);
	    }
	    console.log("joined data: " + JSON.stringify(data));
	    //deferred.resolve(data);
	    return data;
	},

	clone : function (model, ids, resetData, options) {
		// ids = Record.cast_to(ids, 'array', 'id');

		var deferred = q.defer();

		if (! options) { options = {} }
		if (options.debug) {			
			console.log("Cloning " + model + ' : ' + ids.join(','));
			console.log("* RESET: " + JSON.stringify(resetData));
			console.log("* Options: " + JSON.stringify(options));
		}

		var idField = options.id || 'id';
		var table = model;

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;

		var query = "SELECT * from " + table + " WHERE " + idField + ' IN (' + ids.join(',') + ')';	
		
		console.log("\nReset clone data: " + JSON.stringify(resetData));

		Record.query(query, function (err, result) {

			if (err) { console.log("cloning error: " + err); deferred.reject(err);  }
			else if (result.length == 0) {
				console.log("cloned record not found");
				var e = new Error('reference not found');
				deferred.reject(e);
			}
			else {
				var data = result;
				var sourceData = {};

				for (var index=0; index<result.length; index++) {
					var id = result[index][idField];

					sourceData[id] = data[index];
				}

				var newData = [];
				var resetFields = Object.keys(resetData);	

				console.log("Cloning " + ids.length + ' records');
				
				var Index = {};
				for (var i=0; i<ids.length; i++) {
					var id = ids[i];

					if (Index[id] === undefined ) { Index[id] = 0 }
					else { Index[id]++ }

					var addData = _.clone(sourceData[id]);
					for (var j=0; j<resetFields.length; j++) {
						var value = resetData[resetFields[j]];

						var setValue = value;

						if (value === undefined) { setValue = value }
						else if (value && value.constructor === Array ) {
							if (value.length == 1) { setValue = value[0] }
							else { setValue = value[i] }
						}
						else if (value && value.constructor === Object && value[id] )  {
							if (value[id].constructor === Array ) {
								setValue = value[id][Index[id]];  // multiple values supplied ... one for each duplicate ... 
							}
							else {
								setValue = value[id];
							}
						}
						else {
							setValue = value;
						}
						
						if (setValue && setValue.constructor === String) {

							if (setValue == '<id>') { setValue = id }

							else {	
								var parentRefs = setValue.match(/<PARENT\..*>/i);
								if (parentRefs) {
									for (var k=0; k<parentRefs.length; k++) {
										var ref = parentRefs[k].replace(/^<PARENT\./i,'').replace(/>$/,'');

										var val = sourceData[id][ref];
										setValue = setValue.replace(parentRefs[k], val);
									}
								}
							}
						}

						//if (value != undefined) { 
							addData[resetFields[j]] = setValue;
						//}
					}

					if (i==0) {
						console.log(table + ' ' + id + " Cloned : " + JSON.stringify(addData));
					}
					
					newData.push(addData);
				}

				console.log("create clones..." + JSON.stringify(newData));
				Record.createNew(model, newData)
				.then (function (newResponse) {
					console.log('created clone records for ' + model);
					var target_id = newResponse.insertId;
					var target_count = newResponse.affectedRows;
					var target_ids = [];
					if (target_count == ids.length) {
						for (var i=0; i<target_count; i++) {
							var nextId = target_id + i;
							target_ids.push(nextId);
						}

						Attribute.clone(model, ids, target_ids, resetData, options)
						.then (function (data1) {
							console.log("attribute update: " + JSON.stringify(data1));
							deferred.resolve({ data: data, insertIds: target_ids, created: newResponse, attributes: data1});
						})
						.catch ( function (err2) {
							console.log("failed to clone attributes");
							deferred.reject(err2);
						});	
					}
					else if (target_count == 0) {
						console.log("no target records");
						var e = new Error('no target records');
						deferred.reject(e);
					}
					else {
						console.log("targets != sources");
						var e = new Error('target count != source count');
						deferred.reject(e);
					}
				})
				.catch ( function (err3) {
					console.log(err3);
					console.log("Error creating new Clone records");
					// deferred.reject({error: err3, model: model, data: data, reset: resetData});
					deferred.reject(err3);
				});
			}
		});
		return deferred.promise;

	},

	update : function (model, ids, data, options) {
		// Wrapper for updating records in database
		// This also add change history records in database if change_history specified in model attributes.
		// eg:
		//   Record.update('user',[1,2,3], { access : 'Admin'});
		//
		//   Record.update('user', [1,2,3], { name : [ 'Adam','Boris','Clyde'] });
		//  

		var ids = Record.cast_to(ids,'array')
		console.log("Update " + model + ": " + ids.join(','));
		console.log(JSON.stringify(data));
		console.log(JSON.stringify(options));

		// setup History Tracking if applicable
    	var Mod = sails.models[model];
    	var track = [];
    	var History;
    	var data_fields = [];

    	if (model && ids && data && Mod && Mod.track_history) {
    		data_fields = Object.keys(data);
    		console.log("Data Fields: " + data_fields.join(','));
    		var track_fields = Mod.track_history || 'FK_Rack__ID'; // always track location ... 
    		track = _.intersection(track_fields, data_fields);
    		History = {};  // define...
    	}
    	else {
    		console.log("no data history tracking");
    	}

		var deferred = q.defer();

		if (!options) { options = {} }

		var table = model;
		var idField = 'id';
		if (sails.models[model]) {
			var Mod = sails.models[model];
			table = Mod.tableName || model;
			if (Mod.alias && Mod.alias('id')) {
				idField = Mod.alias('id');
				console.log("set id alias to " + idField);
			}
			else {
				console.log("leave id alias to " + idField);
			}
		}
		else {
			// alternate input for non standard tables : update('Plate:Plate_ID', ids, data);
			var splitModel = model.split(':');
			if (splitModel.length > 0 ) { 
				table = splitModel[0];
				idField = splitModel[1];
			}
			else {
				console.log("no " + model + " model :  id alias left as " + idField);
			}
		}		

		var query = "UPDATE " + table;
		var list = ids.join(',');
		
		var conditions = options.conditions || [];

		if (options.include_tables) {
			var tables = Object.keys( options.include_tables );
			var tables = [];
			for (var i=0; i<tables.length; i++) {
				tables.push( tables[i] );
				conditions.push(options.include_tables[tables[i]]);
				console.log('and ' + options.include_tables[tables[i]]);
			}

			query = query + ", " + tables.join(',');
		}
		else {
			conditions.push(idField + " IN (" + list + ")");
		}
		
		var condition = conditions.join(' AND ');
		
		var SetEach = [];
		console.log("set values...");
		if (data && table && idField) {
			var fields = Object.keys(data);
			var Set1 = [];
			for (var i=0; i<fields.length; i++) {
				var setval = data[fields[i]];

				if (setval && setval.constructor === Array) {
					// If value supplied is an array (matching array of applicable ids), then set values one at a time
					// (this may be avoided if all of the array elements are identical in which case values may be set in standard way)
					//

					if (setval.length == ids.length) {
						console.log(fields[i] + " contains multiple values ... adding independently");
						for (var j=0; j<setval.length; j++) {
							if (! SetEach[j] ) { SetEach[j] = {} }
							SetEach[j][fields[i]] = setval[j];
						}
					}
					else if (setval.length == 1) {
						var setVal = Record.parseValue(setval[0], { model : model });
						Set1.push(fields[i] + " = " + setVal );						
					}
					else {
						var msg = "Ignored update to " + fields[i] + " (Length of supplied values != length of id list) " + setval.length + ' != ' + ids.length;
						sails.config.warnings.push(msg);
					}
				}
				else {
					console.log("parse " + setval);
					var setVal = Record.parseValue(setval, { model : model });
					console.log("parsed " + setVal);
					Set1.push(fields[i] + " = " + setVal );
				}
			}
			console.log('update history .. ');

			Record.update_History(model, ids, data, track)
			.then ( function (History) {
				console.log("History: " + JSON.stringify(History));
				var promises = [];

				if (Set1.length) {
					query = query + " SET " + Set1.join(',');
					query = query + " WHERE " + condition;
					console.log("\n** Update: " + query);
					promises.push( Record.query_promise(query) );
				}
				
				if (SetEach.length) {
					console.log("ALSO SET " + JSON.stringify(SetEach));
		
					for (var j=0; j<SetEach.length; j++) {
						var subSet = [];
						var setFields = Object.keys(SetEach[j]); 
						for (var i=0; i<setFields.length; i++) {
							var setVal = Record.parseValue(SetEach[j][setFields[i]], { model: model});
							subSet.push(setFields[i] + ' = ' + setVal);
						}
						
						if (subSet) {
							var subquery = "UPDATE " + table + " SET " + subSet.join(',') + " WHERE " + idField  + ' = ' + ids[j];
							
							if (j === 0 || j === SetEach.length-1) { 
								console.log("subquery: " + subquery + '...') 
							}
							promises.push(Record.query_promise(subquery));
						}
					}
				}

				console.log('run updates...');
				q.all( promises )
				.then (function (results) {
					var setValues = {};
					var updateValues = {};
					console.log("finished updates...");
					console.log(JSON.stringify(results));

					if (Set1.length) { setValues = results[0] }
					if (SetEach.length) { updateValues = results[results.length - 1] }


					if (History) {
						console.log("update History for " + model);
						console.log(JSON.stringify(ids));
						console.log(JSON.stringify(data));
						console.log(JSON.stringify(History));

						Record.update_History(model, ids, data, track, History)
						.then (function (finalHistory) {
							console.log("Saved History after update...");
							console.log(JSON.stringify(finalHistory));
							deferred.resolve({ history: finalHistory, set: setValues, updated: updateValues });
						})
						.catch ( function (err) {
							console.log("Error saving final history: " + err);
							deferred.reject(err);
						});
					}
	//				console.log("updated: " + JSON.stringify(result));				
					else {
						console.log('no History tracking for ' + data_fields.join(','));
						deferred.resolve({ set: setValues, updated: updateValues } );
					}
				})
				.catch ( function (err) {
					console.log("Query Error: " + query);
					err.context = 'updating last prep_id'
					deferred.reject(err);
				});
			})
			.catch ( function (Herr) {
				console.log("Error saving preHistory");
				Herr.context = 'preHistory';
				deferred.reject(Herr);
			});
			
		}
		else {
			console.log("no data or table / idField :" + table + ' / ' + idField);
			deferred.resolve();
		}

		return deferred.promise;
	},	

	createNew : function (model, Tdata, options) {
		// Bypass waterline create method to enable insertion into models in non-standard format //
		var debug = 0;
		var deferred = q.defer();
		//console.log("\ncreate new record(s) in " + table);

		options = options || {};
		var resetData   = options.reset;

		var onDuplicate = '';
		var action = 'INSERT';
		if ( options.onDuplicate) {
			if (options.onDuplicate.match(/replace/i)) {
				action = 'REPLACE';
			}
			else {
				onDuplicate = ' ON DUPLICATE KEY ' + options.onDuplicate;
			}
		}

		var Mod = sails.models[model] || {};

		var table = Mod.tableName || options.table || model; // default to model name ... 

		if (Tdata === undefined) { 
			var e = new Error('no data');
			deferred.reject(e); 
			return deferred.promise;
		}

		var data = [];
		if (Tdata.constructor === Object) { data = [Tdata] }
		else if (Tdata.constructor === Array ) { data = Tdata }
		else {  
			var e = new Error('no data');
			deferred.reject(e);  
			return deferred.promise;
		}


		var fields = [];
		if (data.length) { fields = Object.keys(data[0]) || [] }

		var Values = [];

		console.log(model + ' : ' + Mod + ' -> ' + Mod.tableName + '=' + table);
		console.log("insertion data: " + JSON.stringify(data[0]) + '...');
		
		for (var index=0; index<data.length; index++) {
			var Vi = [];
			for (var f=0; f<fields.length; f++) {
				var input_value = data[index][fields[f]];

				var value = Record.parseValue(input_value, { model: model, field: fields[f] });

				if (resetData && resetData[fields[f]]) {
					var resetValue = Record.parseValue( resetData[fields[f]], { model: model, field: fields[f], defaultTo : value });
					Vi.push(resetValue);
				}
				else {
					Vi.push(value);
				}
			}
			// if (table === model) { Vi.push('NOW()') }
			Values.push( "(" + Vi.join(", ") + ")");
		}
		// if (table === model) { fields.push('createdAt') }

		var createString = action + " INTO " + table + " (" + fields.join(',') + ") VALUES " + Values.join(', ') + onDuplicate;
		console.log("\n** Insert SQL: \n" + createString); 

		Record.query_promise(createString)
		.then ( function (result) {
			console.log("Result: " + JSON.stringify(result));
			var insertId = result.insertId;
			var added    = result.affectedRows;

			var msg = added + ' ' + table + ' record(s) added: id(s) from ' + insertId;
			console.log(msg);

			if (Mod.tableType && Mod.tableType.match(/lookup/i) ) { }
			// else { sails.config.messages.push(msg) }
			console.log("successfully created new " + table + ' record(s)');

			var ids = Record.insert_Ids(result);

			result['model'] = model;
			result['table'] = table;
			result['ids'] = ids;

			if (ids && ids.length) {
				console.log("Call barcode method");
				Barcode.print_Labels(model, ids);
			}

			Record.add_meta_records(model, ids)
			.then ( function (meta) {
				console.log("checked for meta records for " + model);
				deferred.resolve(result);
			})
			.catch ( function (err) {
				console.log("Error generating meta records");
				deferred.reject(err);
			})
		})
		.catch ( function (err) {
			console.log("Error creating Record in " + table);
			// console.log(JSON.stringify(err));
			deferred.reject(err); 
		});

		return deferred.promise;
	},

	add_meta_records : function (model, ids) {
	// add meta records if appliable (records with 1-1 relationship with <model> records)  
	// Usage (model should have attribute: 'metaRecord' of format:
	//          metaRecord: { 'relatedTableName' : { refField: '<ID>'} }
	//
	//   where <ID> is a reference o the original record id in the <model> table.
	//	
		var Mod = sails.models[model] || {};

		var deferred = q.defer();

		if (Mod && Mod.metaRecord) {
			var meta = Mod.metaRecord;
			var metaTables = Object.keys(meta);

			var promises = [];

			for (var t=0; t<metaTables.length; t++) {
				var metaTable = metaTables[t];
				var metaFields = Object.keys(meta[metaTable]);

				var data = [];
				for (var n=0; n<ids.length; n++) {
					data.push(_.clone(meta[metaTable]));
				}

				console.log("Add meta data for records: " + ids.join(','));
				for (var i=0; i<metaFields.length; i++) {
					var f = metaFields[i];
					var v = meta[metaTable][f];
					if ( v && v.match(/\<ID\>/i) ) {
						for (var n=0; n<ids.length; n++) {
							data[n][f] = ids[n];
						}
					}
					else { 
						console.log(v + ' does not match ID');
					}
				}
				console.log("metadata table appended: " + metaTable);
				console.log(JSON.stringify(data));
				promises.push( Record.createNew(metaTable, data) );
			}

			q.all(promises)
			.then ( function (metadata) {
				console.log("Added metadata");
				deferred.resolve();
			})
			.catch ( function (err) {
				console.log("Error adding meta records");
				deferred.reject(err);
			});
		}
		else {
			// console.log('no meta records for ' + model); 
			deferred.resolve();
		}

		return deferred.promise;

	},

	uploadData : function (model, headers, data, reference) {

		var deferred = q.defer();
		
		var user;
		var timestamp = 'CURDATE()';

		if (sails.config && sails.config.payload) {
			var payload = sails.config.payload;
			user = payload.userid;
		}
		else {
			deferred.reject('payload with user credentials unavailable');
		}

		Record.parseMetaFields(model, headers)
		.then ( function (metaFields) {
			var fields = metaFields.fields;
			var attributes = metaFields.attributes;
			var ids   = metaFields.ids;
					
			var id_index = ids.index || 0;
			var idField = headers[id_index];
			idField = idField.replace(/ /g,'_');

			var field_count = Object.keys(fields).length;
			var attribute_count = Object.keys(attributes).length;
			console.log("\n** MetaFields: " + JSON.stringify(metaFields));

			var idCol = 0;

			// data has additional index value ... 
			if (data.length && data[0].length === headers.length+1 &&  field_count + attribute_count === headers.length) {

				var promises = [];
				var update_attributes = [];
				for (var row=0; row<data.length; row++) {
					var fieldData = {};

					var id;
					var condition;
					var conditions = [];
					var include_tables;
					if ('index' in ids) {
						id = data[row][id_index+1];
					}
					else if (reference) {
						id = reference[data[row][1]];  // data 0 is simply a row # ... 
					}
					else {
						// enable conditional field to act as id (first column must be associated with unique record) 
						if (fields[idField]) {
							condition = headers[0] + " = '" + data[row][1] + "'";
						}
						else if (attributes[idField] && attributes[idField].id) {
							var att_id = attributes[idField].id;
							condition = "Attribute_Value = '" + data[row][1] + "'";
							include_tables = {'Plate_Attribute' : "FK_Plate__ID=Plate_ID AND FK_Attribute__ID = " + att_id };
						}
					}

					console.log(ids.index + ' id = ' + id);
					console.log("ref " + JSON.stringify(reference));

					for (var col=1; col<=headers.length; col++) {
						var header = headers[col-1];
						header = header.replace(/ /g,'_');

						var value = data[row][col]; // Record.parseValue(data[row][col]);

						if (header === idField) {
							// skip 
							if (condition) { id_condition = condition + " = '" + value + "'" }
							console.log("skip " + header);
						}
						else if (fields[header]) {
							fieldData[fields[header]] = value;
							console.log("set fieldData for " + header);
						}
						else if (attributes[header]) {
							var att_id = attributes[header].id;
							console.log("set attribute for " + header);
							update_attributes.push( Attribute.insertHash(model, id, att_id, value, user, timestamp) );
						}
						else {
							console.log(header + ' not identified ??');
						}
						
					}
					
					if (condition) { conditions.push(condition) }

					if (Object.keys(fields).length) {
						promises.push( Record.update(model, id, fieldData, { conditions: conditions, include_tables: include_tables }) );
						console.log("\n** Update Fields: " + id + JSON.stringify(fieldData));
					}
				}

				if (update_attributes.length) {
					promises.push( Record.createNew('Plate_Attribute', update_attributes) );
					console.log("\n** Update Attributes: " + JSON.stringify(update_attributes)  );
				}

				q.all(promises)
				.then ( function (result) {
					deferred.resolve(result);
				})
				.catch ( function (err) {
					var msg = Record.parse_standard_error(err);
					console.log("Error uploading data: " + msg);
					console.log(JSON.stringify(err));  // parse_error
					err.context = 'upload Data';
					deferred.reject(msg);
				})
			}
			else {
				var msg = "Data: " + data[0].length + '; headers: ' + headers.length + '; F: ' + Object.keys(fields).length + '; A: ' + Object.keys(attributes).length;
				console.log(msg);
				var e = new Error('missing data or headers');
				deferred.reject(e);
			}
		})
		.catch ( function (err) {
			deferred.reject(err);
		});

		return deferred.promise;
	},

	parseMetaFields : function (model, headers) {
	// parses meta fields (used to determine what headers apply to fields and/or attributes in uploaded file.  also returns index to id field if found)
		var deferred = q.defer();

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;

		var fields = {};
		var attributes = {};
		var ids = {};

		console.log("parse " + model + ': ' + headers.join(','));

		var check_attributes = [];
		for (var i=0; i<headers.length; i++) {
			var header = headers[i];
			var alias;
			if (header) { alias = header.replace(/ /g,'_') }

			if (Mod.alias && alias && Mod.alias(alias)) {
				fields[alias] = Mod.alias(alias);
			}
			else if (alias && Mod.attributes && Mod.attributes[alias]) {
				fields[alias] = header;

				if (header === 'id') {
				ids = { alias : alias, index: i};
				}
				else if (Mod.alias && Mod.alias('id') === alias) {
				ids = { alias : alias, index: i};
				}
			}
			else {
				check_attributes.push(i);
			}
			
			if (header === 'id' || header === 'ID' || header === table || alias === table + '_ID') {
				ids = { alias : alias, index: i};
			}
		}

		if (check_attributes.length) {

			var query = "Select Attribute_Name, Attribute_ID FROM Attribute WHERE Attribute_Class = '" + table + "'";
			Record.query_promise(query)
			.then (function (result) {
				var names = _.pluck(result,'Attribute_Name');
				var att_ids   = _.pluck(result,'Attribute_ID');

				for (var i=0; i<check_attributes.length; i++) {
					var att = headers[check_attributes[i]];
					var alias = att.replace(/ /g,'_');

					var index = names.indexOf(alias);
					if (index >=0 ) {
						attributes[alias] = {id: att_ids[index], name: names[index], index: check_attributes[i]};
					}
					else {
						console.log(" Not recognized as either a field or a header");
					}
				}

				deferred.resolve( { fields: fields, attributes: attributes, ids: ids });
			})
			.catch ( function (err) {
				deferred.reject(err);
			})
		}
		else {
			deferred.resolve( { fields: fields, attributes: [], ids: ids});
		}

		return deferred.promise;
	},

	parseValue : function (value, options) {
		// parses values that may be formatted for specific purposes (eg '<today>, '<id>','<SQL_statement>' ...)

		if (! options ) { options = {} }

		var defaultTo = options.defaultTo;
		var model = options.model;  // used for <id> values (retrieves id field name)
		var field = options.field;  // used for <increment> values
		var debug = options.debug;
		var index = options.index;
		var action  = options.action;  // action eg insert or update (eg affects <increment>) 

		var Mod = {};
		if (sails && sails.models && sails.models[model]) { Mod = sails.models[model] }

		if (value === null || value === 'NULL' ||  value === undefined || value === '<NULL>') {
			value = null;
		}
		else if (value.constructor === Array ) {
			console.log("retrieve " + index + " element from array");
			if (! index) { index = 0 }
			value = value[index];
		}

		var noQuote = 0;

		if (typeof value == 'number') { 
			// round to 4 significant digits to avoid saving infinitesimal floating point variations
			// var round_value = value.toPrecision(significant_digits); 
			// console.log("Round " + value + ' to ' + round_value);
			// value = round_value.toString();
		}

		var onDuplicate;
		
		if (value == null) { }			
		else if (value.constructor === String) {
			if (value.match(/^<user>$/i)) {
				if (sails.config.payload) { value = sails.config.payload.alDenteID || 0 }
				if (debug) console.log("replacing <user> with " + value);
			}
			else if (value.match(/^<increment>$/i) ) {
				if (action === 'insert') {  }  // leave onDuplicate set in createNew function
				else if (field) { value = field + " + 1 " }
				else { console.log('should supply field if updating, or insert action') }
				
				if (debug) { console.log("V: increment") }
				// NOTE:  Requires setting out onDuplicate OUTSIDE OF THIS Function !!!! (onDuplicate is left hanging here... )
				/*	
				value = 1; 
				if (field) {
					value = '<increment>';  // leave so it can be parsed out in 'createNew'
					onDuplicate = " ON DUPLICATE KEY UPDATE " + field + "=" + field + " + 1";
					console.log("replacing <increment> with SQL ");
				}
				else {
					console.log("No field specified to increment");
					sails.config.errors.push("no field specfied for increment");
				}
				*/
			}
			else if (value.match(/^<now>$/i)) {
				value = 'NOW()'; 
				if (debug) console.log("replacing <now> with " + value);
				noQuote = 1;
			}
			else if (value.match(/^<today>$/i)) {
				value = 'CURDATE()'; 
				if (debug) console.log("replacing <today> with " + value);
				noQuote = 1;
				if (debug) { console.log('using current data: ' + value) }
			}
			else if (value.match(/^<id>$/i)) { 
				var idField = 'id';
				if (Mod.alias && Mod.alias('id')) {
					idField = Mod.alias('id');
				}
				value = idField;
				if (debug) { console.log('using id field: ' + value) }
			}
			else if (value.match(/^<.*>$/)) {
				value = value.replace(/^</,'');
				value = value.replace(/>$/,'');
				console.log("SQL statement value detected: " + value);
				noQuote = 1;
			}

			// account for redundant quotes ... 

			if (value.constructor === String && value.match(/^\"/) && value.match(/\"$/)) {
				noQuote = 1;
			}
		}
		else if (value && value.constructor === Date) {
			value = JSON.stringify(value);
			noQuote=1;
		}

		if (value === undefined) {
			value = null;
			console.log('switched undef to null');
		}


		if (value === null && defaultTo) {
			return defaultTo;
		}
		else if (value === null) {
			return 'null';					
		}
		else if (noQuote) {
			return value;
		}
		else {
			// leave booleans unquoted... //
			if (value.constructor == Boolean) {  
				console.log('pass boolean: ' + value);
				return value;
			}
			else {
				return "\"" + value + "\"";
			}
		}
	},

	parse_standard_error : function (err) {
        // Convert warning / error errs into more readable format
        // (if <match> is included in value, then the regexp of the key will be evaluated and the match replaced in the value string)
        //   eg 'Error creating \\w+' : "<match> - no record created" -> yields "Error creating Employee - no record created" 
        //
        var Map = {
            "Duplicate entry \'.+\' encountered" : "<match>",
            'Unknown column'  : "Unrecognized column in database (?) - please inform LIMS administrator",
            "Error saving \\w+" : "<match>",
        };

        console.log("Parse " + err.constructor + ' err ' + err);

        if (err.constructor === Object) {
        	err = JSON.stringify(err);
        }
        else if (err.constructor === Array ) {
        	err = err.join('; ');
        }
        else if (err.constructor === String) {

        }
        else { 
        	var string = err.toString();
        	err = string;
        }

		console.log("\nStringified error: \n" + err);        

        var strings = Object.keys(Map);

        var errors = [];
        for (var i=0; i<strings.length; i++) {
            
            var test = strings[i];
            if (Map[strings[i]].match(/<match>/)) {
                test = new RegExp(test);
                console.log("Checking errors for regexp :" + test);
            }

            var found = err.match(test);
            if (found) {
                console.log("match found for " + test);
                var err = Map[strings[i]].replace('<match>', found);
                errors.push( err );
            }
        }

        console.log("Parsed Error: " + err);
        console.log(JSON.stringify(errors));
        if (! errors.length) { errors.push(err) }
        return errors;
    },

    update_History : function (model, ids, data, track, History) {
    	// retrieve values before record is updated  ... run in conjunction with similar call with History set.. 
    	var deferred = q.defer();

    	ids = Record.cast_to(ids, 'array');

    	console.log('use model ' + model);
    	var Mod = sails.models[model] || {};    	
    	var	table = Mod.tableName || model;

    	var key;
    	track = track || ['FK_Rack__ID'];  // always track Rack_ID changes ... 

    	console.log("\n*** update History with " + JSON.stringify(History));
    	console.log(model);
    	console.log(ids.join(','));
    	console.log(track.length);
 
    	var save = false;

    	if (model && ids && data && track && track.length && Mod) {
	    	if (History) { 
	    		key = 'New_Value'
	    		save = true;
	    	}
	    	else { 
	    		History = {};
	    		key = 'Old_Value';
	    	}

	    	if (! History[table]) { History[table] = {} }

    		var idField = 'id';
    		if (Mod && Mod.alias && Mod.alias('id')) { idField = Mod.alias('id') }
			
			var query = "SELECT " + idField + ' as id, ' + track.join(',') + " FROM " + table + " WHERE " + idField + " IN (" + ids.join(',') + ')';

			var Relocate = [];

			console.log(query);
			var promises = [];
			promises.push( Record.query_promise(query) )
			promises.push( Record.load_FK(table, track) );

			q.all(promises)
			.then (function (results) {
				var result = results[0];
				var FK = results[1];
				var FKT = FK[table];

				console.log("FK: " + JSON.stringify(FK));

				console.log(JSON.stringify(result));
				for (var i=0; i<result.length; i++) {
					for (var j=0; j<track.length; j++) {
						var f = track[j];
						var id = result[i].id;
						var fk = FKT[f];

						if (! History[table][id] ) { History[table][id] = {} }
						if (! History[table][id][f] ) { History[table][id][f] = {} }

						if (key === 'New_Value' && History[table][id][f]['Old_Value'] === result[i][f]) {
							console.log(f + ' value unchanged...');
							delete History[table][id][f];
						}
						else {
							History[table][id][f][key] = result[i][f];	

							console.log("Tracked History: " + JSON.stringify(History[table][id][f]) );

							if (key === 'New_Value') {
								History[table][id][f]['Record_ID'] = id;
								History[table][id][f]['FK_DBField__ID'] = fk;
								History[table][id][f]['Modified_Date'] = '<NOW>';
								
								if (sails && sails.config && sails.config.payload) {
									History[table][id][f]['FK_Employee__ID'] = sails.config.payload.alDenteID;
								}

								if (f === 'FK_Rack__ID') {
									var relocate = {};
									// relocate['class'] = table;
									relocate['Container'] = id;
									// relocate['field'] = f;
									relocate['Moved_from'] = History[table][id][f]['Old_Value'];
									relocate['Moved_to'] = result[i][f];
									relocate['moved'] = '<NOW>';
									relocate['Moved_by'] = '<user>';
									Relocate.push(relocate);
								}

							}
						}
					}
				}

				if (save) {
					Record.saveHistory(History, Relocate)
					.then ( function (response) {
						console.log("Saved History: " + JSON.stringify(response));
						deferred.resolve(History);
					})
					.catch ( function (err) {
						console.log("Error saving History");
						deferred.reject(err);
					});
				}
				else { 
					deferred.resolve(History);
				}

			})
			.catch (function (err) {
				console.log("Error saving preHistory: " + err);
				deferred.reject(err);
			});
    	}
    	else { 
    		deferred.resolve();
    	}

    	return deferred.promise;
    },

    saveHistory : function (History, Relocate) {
    	var deferred = q.defer();

    	History = History || {};
    	var Data = [];
    	
    	console.log("build data...");
    	console.log("History: " + JSON.stringify(History));

    	var tables = Object.keys(History);
    	for (var i=0; i<tables.length; i++) {
    		var ids = Object.keys(History[tables[i]]);
    		for (var j=0; j<ids.length; j++) {
    			var update = History[tables[i]][ids[j]];
    			var fields = Object.keys(update);
    			for (var k=0; k<fields.length; k++) {
    				var data = update[fields[k]];
	    			// data.FK_Employee__ID = sails.config.payload.alDenteID;
    				// data.FK_DBField__ID  = FK[tables[i]][fields[k]];
    				// data.Modified_Date   = 'NOW()';
    				if (data.FK_DBField__ID) {
    					Data.push( data );
    				}
    				else {
    					console.log("Skipping " + tables[i] + '.' + fields[k] + ' (no DBField record found)');
    				}
    			}
    		}
    	}
    	console.log("History Data: " + JSON.stringify(Data));
    	console.log("Relocate: " + JSON.stringify(Relocate));
    	deferred.resolve(Data);
    	
    	Record.createNew('Change_History', Data)
    	.then ( function (result) {
    		console.log("tracked Change History");
	    	console.log("Relocate: " + JSON.stringify(Relocate));
	    	Record.createNew('sample_tracking', Relocate)
	    	.then ( function (relocated) {
	    		deferred.resolve(relocated);
	    	})
	 		.catch ( function (err) {
	 			console.log("Error tracking sample history: " + err);
	 			deferred.reject(err);
	 		});   	    		
    	})
    	.catch ( function (err) {
    		console.log("Error tracking Change History");
	    	
	    	// perform sample tracking regardless ... if possible... 
	    	Record.createNew('sample_tracking', Relocate)
	    	.then ( function (relocated) {
	    		console.log("Tracked sample movement (update Change History)");
	    		deferred.resolve(relocated);
	    	})
	 		.catch ( function (err) {
	 			console.log("Error tracking sample history as well: " + err);
	 			deferred.reject(err);
	 		});       		
    	})
    	
    	return deferred.promise;
    },

    load_FK : function (table, fields) {
    	// Legacy 
    	var deferred = q.defer();

    	var FK = {};
    	FK[table] = {};

    	var field_list = fields.join("','");
    	var query = "SELECT DBField_ID as fk, Field_Name as field, DBTable_Name as dbtable FROM DBField,DBTable WHERE FK_DBTable__ID=DBTable_ID AND Field_Name IN ('" + field_list + "') AND DBTable_Name = '" + table + "'";
    	console.log(query);
    	Record.query_promise(query)
    	.then (function (result) {
    		for (var i=0; i<result.length; i++) {
    			var table = result[i].dbtable;
    			var field = result[i].field;
    			var ref = result[i].fk;
    			
    			FK[table][field] = ref;
    		}
    		deferred.resolve(FK);
    	})
    	.catch ( function (err) {
    		console.log("could not get FK values");
    		deferred.reject(err);
    	});

    	return deferred.promise;
    }
};


