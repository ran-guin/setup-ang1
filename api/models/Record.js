/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var fs = require('fs');
var _ = require('underscore-node');

module.exports = {

	attributes: {

	},

	get_fields : function (table) {		
		var deferred = q.defer();
		var model = table;

		Record.query_promise("desc " + table)
		.then (function (result) {
			if (result.length == 0 ) {
				deferred.reject("no table found");
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
		
		if (left_joins) { query = query + ' LEFT JOIN ' + left_joins.join(' LEFT JOIN ') }
		if (conditions) { query = query + ' WHERE ' + conditions.join(' AND ') }

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
			deferred.reject();
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
				deferred.reject("reference record not found");
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
						deferred.reject("No target records created");
					}
					else {
						console.log("targets != sources");
						deferred.reject("Target count != Source count");
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
		console.log("Update " + model + ": " + ids);
		console.log(JSON.stringify(data));

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
			}

			query = query + ", " + tables.join(',');
		}
		else {
			conditions.push(idField + " IN (" + list + ")");
		}
		
		var condition = conditions.join(' AND ');
		
		var SetEach = [];
		if (data && table && idField) {
			var fields = Object.keys(data);
			var Set = [];
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
						Set.push(fields[i] + " = " + setVal );						
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
					Set.push(fields[i] + " = " + setVal );
				}
			}

			var promises = [];

			promises.push( Record.preChangeHistory(model, ids, data));

			if (Set.length) {
				query = query + " SET " + Set.join(',');
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
						
						if (j === 0 || j === SetEach.length-1) { console.log("subquery: " + subquery + '...') }
						promises.push(Record.query_promise(subquery));
					}
				}
			}			
			
			promises.push(Record.postChangeHistory(model, ids, data));

			console.log(promises.length + ' update queries...');

			q.all( promises )
			.then (function (result) {
				console.log("updated: " + JSON.stringify(result));				
				deferred.resolve(result[0]);								
			})
			.catch ( function (err) {
				console.log("Query Error: " + query);
				deferred.reject("Error updating last prep id: " + err);
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

		var table = Mod.tableName || model; // default to model name ... 

		if (Tdata === undefined) { deferred.reject('no data'); return deferred.promise }

		var data = [];
		if (Tdata.constructor === Object) { data = [Tdata] }
		else if (Tdata.constructor === Array ) { data = Tdata }
		else {  deferred.reject('no data');  return deferred.promise }


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
			Values.push( "(" + Vi.join(", ") + ")");
		}

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
			deferred.resolve(result);
		})
		.catch ( function (err) {
			console.log("Error creating Record in " + table);
			console.log(JSON.stringify(err));
			deferred.reject(err); 
		});

		return deferred.promise;
	},

	uploadData : function (model, headers, data, reference) {

		var deferred = q.defer();

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
					var include_tables;
					if (ids.index) {
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
							update_attributes.push( Attribute.insertHash(model, id, att_id, value) );
						}
						else {
							console.log(header + ' not identified ??');
						}
						
					}
					if (Object.keys(fields).length) {
						promises.push( Record.update(model, id, fieldData, { conditions: [condition], include_tables: include_tables }) );
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
					deferred.reject("Error in uploadData: " + err);
				})
			}
			else {
				var msg = "Data: " + data[0].length + '; headers: ' + headers.length + '; F: ' + Object.keys(fields).length + '; A: ' + Object.keys(attributes).length;
				console.log(msg);
				deferred.reject(msg);
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

		if (typeof value == 'number') { value = value.toString() }

		var onDuplicate;

		if (value === null) { }			
		else if (value.constructor === String) {
			if (value.match(/^<user>$/i)) {
				if (sails.config.payload) { value = sails.config.payload.alDenteID }
				if (debug) console.log("replacing <user> with " + value);
			}
			else if (value.match(/^<increment>$/i) ) {
				if (action === 'insert') {  }  // leave onDuplicate set in createNew function
				else if (field) { value = field + " + 1 " }
				else { console.log('should supply field if updating, or insert action') }
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
			}
			else if (value.match(/^<id>$/i)) { 
				var idField = 'id';
				if (Mod.alias && Mod.alias('id')) {
					idField = Mod.alias('id');
				}
				value = idField;
			}
			else if (value.match(/^<.*>$/)) {
				value = value.replace(/^</,'');
				value = value.replace(/>$/,'');
				if (debug) { console.log("SQL statement detected: " + value) }
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
			return "\"" + value + "\"";
		}
	},

	parse_standard_error : function (message) {
        // Convert warning / error messages into more readable format
        // (if <match> is included in value, then the regexp of the key will be evaluated and the match replaced in the value string)
        //   eg 'Error creating \\w+' : "<match> - no record created" -> yields "Error creating Employee - no record created" 
        //
        var Map = {
            "Duplicate entry \'.+\' encountered" : "<match>",
            'Unknown column'  : "Unrecognized column in database (?) - please inform LIMS administrator",
            "Error saving \\w+" : "<match>",
        };

        console.log("Parse " + message.constructor + ' message ' + message);

        if (message.constructor === Object) {
        	message = JSON.stringify(message);
        }
        else if (message.constructor === Array ) {
        	message = message.join('; ');
        }
        else if (message.constructor === String) {

        }
        else { 
        	var string = message.toString();
        	message = string;
        }

		console.log(message);        

        var strings = Object.keys(Map);

        var errors = [];
        for (var i=0; i<strings.length; i++) {
            
            var test = strings[i];
            if (Map[strings[i]].match(/<match>/)) {
                test = new RegExp(test);
                console.log("Testing regexp :" + test);
            }

            var found = message.match(test);
            if (found) {
                console.log("match found for " + test);
                var err = Map[strings[i]].replace('<match>', found);
                errors.push( err );
            }
        }

        console.log("Parsed Error: " + message);
        if (! errors.length) { errors.push(message) }
        return errors;
    },

    preChangeHistory : function (model, ids, data) {
    	// retrieve values before record is updated  ... run in conjunction with postChangeHistory 
    	var deferred = q.defer();

    	ids = Record.cast_to(ids, 'array');
    	var fields = Object.keys(data);
    	var Mod = sails.models[model];

    	if (model && ids && data && Mod && fields.length) {
    		var track = _.intersection(Mod.track_history, fields);

    		var table = Mod.tableName || model;
    		var idField = 'id';

    		if (Mod && Mod.alias && Mod.alias('id')) { idField = Mod.alias('id') }

    		if (track && track.length) {
    			var query = "SELECT " + idField + ' as id, ' + track.join(',') + " FROM " + table + " WHERE " + idField + " IN (" + ids.join(',') + ')';
    			console.log(query);
    			Record.query_promise(query)
    			.then (function (result) {
    				Record.save_preHistory(table, result)
    				.then (function (ok) {
    					deferred.resolve(result);
    				})
    				.catch (function (err) {
    					console.log("Error saving preHistory");
    					deferred.reject(err);
    				})
    			})
    			.catch ( function (err) {
 		   			deferred.reject(err);    				
    			})
    		}
    		else { deferred.resolve() }
    	}
    	else { deferred.resolve() }

    	return deferred.promise;
    },

   postChangeHistory : function (model, ids, data) {
    	// retrieve values before record is updated  ... run in conjunction with postChangeHistory 

    	var deferred = q.defer();

    	var fields = Object.keys(data);
    	var Mod = sails.models[model];

    	if (Mod && fields.length && Mod.track_history) {
    		var track = _.union(Mod.track_history, fields);

    		var table = Mod.tableName || model;
    		var idField = 'id';
    		if (Mod.alias && Mod.alias('id')) { idField = Mod.alias('id') }

    		if (track.length ) {
    			var query = "SELECT " + idField + ', ' + track.join(',') + " FROM " + table + " WHERE " + idField + " IN (" + ids.join(',') + ')';
    			
    			console.log(query);
    			Record.query_promise(query)
    			.then (function (result) {
    				Record.save_postHistory(table, result)
    				.then (function (ok) {
    					deferred.resolve(result);
    				})
    				.catch (function (err) {
    					console.log("Error saving postHistory");
    					deferred.reject(err);
    				})
    			})
    			.catch ( function (err) {
 		   			deferred.reject(err);    				
    			})
			}
    		else {
 				console.log('no history tracking required');   		 
    			deferred.resolve();
    		}
    	}
    	else {
    		console.log('no history tracking required'); 
    		deferred.resolve();
    	}
    	
    	return deferred.promise;	
    },

    save_preHistory : function (table, data) {
    	console.log('save preHistory');

    	var deferred = q.defer();

    	if (data.length) {

	    	for (var i=0; i<data.length; i++) {

	    	}
    	}
    	else { 
    		console.log("nothing saved (ok)");
    		deferred.resolve();
    	}

    	return deferred.promise;
    },

    save_postHistory : function (table, data) {
    	console.log('save postHistory');
    	var deferred = q.defer();


   		if (data.length) {
	    	var update = { 
	    		User : sails.config.payload.userid, 
	    		changed: '<now>',
	    	};

	    	for (var i=0; i<data.length; i++) {
					    		
	    	}
    	}
    	else { 
    		console.log("nothing saved (ok)");
    		deferred.resolve();
    	}

    	return deferred.promise;

    },

};


