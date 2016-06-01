/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var fs = require('fs');
var _ = require('underscore');

module.exports = {

	attributes: {

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

		var conditions = options.conditions;
		
		var query = 'SELECT ' + fields.join(',');

		if (tables) { query = query + ' FROM (' + tables.join(',') + ')' }
		
		if (left_joins) { query = query + ' LEFT JOIN ' + left_joins.join(' LEFT JOIN ') }
		if (conditions) { query = query + ' WHERE ' + conditions.join(' AND ') }

		if (groupBy && groupBy.length) { query = query + ' GROUP BY ' + groupBy.join(',') }
		if (orderBy && orderBy.length) { query = query + ' ORDER BY ' + orderBy.join(',') }
		if (limit) { query = query + ' LIMIT ' + limit }

		console.log("built query: " + query);
		return query;
	},

	query_promise: function (query) {
		// Wrapper for standard Record.query returning a promise //	
		var deferred = q.defer();

		Record.query(query, function (err, result) {
			if (err) { 
				console.log("query promise error: " + query);
				console.log(err);
				deferred.reject(err);
			}
			else { deferred.resolve(result) }
		});

		return deferred.promise;	
	},

	cast_to : function (input, target, hashKey ) {

		var returnVal;
		if ( target.match(/array/i) ) {		
			returnVal = [];
			console.log("casting " + JSON.stringify(input) + ' to ' + target);
			if (input && input.constructor === Array) {
				if (hashKey && input[0] && input[0].constructor === Object && input[0][hashKey]) {
					for (var i=0; i<input.length; i++) {
						returnVal.push(input[i][hashKey]);
					}
				}
				else { returnVal = input }
			}
			else if (input && input.constructor === String) {
				returnVal = input.split(/\s*,\s*/);
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

	uploadFile: function (table, file) {

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
			Record.createNew(table, data, {}, { NULL : "\\N" } )
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
	    console.log("RETURN: " + JSON.stringify(data));
	    //deferred.resolve(data);
	    return data;
	},

	clone : function (table, ids, resetData, options) {

		ids = Record.cast_to(ids, 'array', 'id');
		var id_list = ids.join(',');
		console.log("Cloning: " + id_list);
		console.log("* RESET: " + JSON.stringify(resetData));
		console.log("* Options: " + JSON.stringify(options));

		var deferred = q.defer();

		if (! options) { options = {} }
		var idField = options.id || 'id';

		var query = "SELECT * from " + table + " WHERE " + idField + ' IN (' + id_list + ')';	
		console.log("q: " + query);
		console.log("\nReset: " + JSON.stringify(resetData));

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

					console.log(table + ' ' + id + " Cloned : " + JSON.stringify(addData));
					newData.push(addData);
				}

				Record.createNew(table, newData)
				.then (function (newResponse) {
					var target_id = newResponse.insertId;
					var target_count = newResponse.affectedRows;
					var target_ids = [];
					if (target_count == ids.length) {
						for (var i=0; i<target_count; i++) {
							var nextId = target_id + i;
							target_ids.push(nextId);
						}
						Attribute.clone(table, ids, target_ids)
						.then (function (data1) {
							console.log("attribute update: " + JSON.stringify(data1));
							deferred.resolve({ data: data, insertIds: target_ids, created: newResponse, attributes: data1});
						})
						.catch ( function (err2) {
							deferred.reject({error :err2, table: table, ids: ids, target_ids: target_ids});
						});	
					}
					else if (target_count == 0) {
						deferred.reject({ error: "No target records created", response: newResponse });
					}
					else {
						deferred.reject({error: "Target count != Source count", sources: ids, targets: target_ids});
					}
				})
				.catch ( function (err3) {
					deferred.reject({error: err3, table: table, data: data, reset: resetData});
				});
			}
		});
		return deferred.promise;

	},

	update : function (model, ids, data) {
		console.log("Update " + model + ": " + ids);
		console.log(JSON.stringify(data));

		var deferred = q.defer();
		
		var list = ids.join(',');
		
		var query = "UPDATE " + model;
		
		if (data) {
			var fields = Object.keys(data);
			var Set = [];
			for (var i=0; i<fields.length; i++) {
				
				//reformat_data(data[fields[i]]);

				Set.push(fields[i] + " = '" + data[fields[i]] + "'");
			}
			if (Set.length) {
				query = query + " SET " + Set.join(',');
			}			
			query = query + " WHERE Plate_ID IN (" + list + ")";
			
			Record.query_promise( query )
			.then (function (result) {
				deferred.resolve(result);				
			})
			.catch ( function (err) {
				console.log("Query Error: " + query);
				deferred.reject("Error updating last prep id: " + err);
			});

		}
		else {
			console.log("nothing to update");
			deferred.resolve();
		}

		return deferred.promise;
	},	

	createNew : function (table, Tdata, resetData) {
		// Bypass waterline create method to enable insertion into models in non-standard format //
		var debug = 0;
		var deferred = q.defer();
		//console.log("\ncreate new record(s) in " + table);

		if (Tdata === undefined) { deferred.reject('no data'); return deferred.promise }

		var data = [];
		if (Tdata.constructor === Object) { data = [Tdata] }
		else { data = Tdata }

		var fields = Object.keys(data[0]);

		var Values = [];
		var onDuplicate = '';

		console.log("insertion data: " + JSON.stringify(data));
		
		for (var index=0; index<data.length; index++) {
			var Vi = [];
			for (var f=0; f<fields.length; f++) {
				var value = data[index][fields[f]];
				if (value === 'NULL' ||  value === undefined) {
					value = null;
				}
			
				var noQuote = 0;
				if (typeof value == 'number') { value = value.toString() }

				if (value === null) { }			
				else if (value.constructor === String) {
					if (value.match(/^<user>$/i)) {
						value = sails.config.payload.userid; 
						if (debug) console.log("replacing <user> with " + value);
					}
					else if (value.match(/^<increment>$/i)) {
						value = 1;
						onDuplicate = " ON DUPLICATE KEY UPDATE " + fields[f] + "=" + fields[f] + " + 1";
						if (debug) console.log("replacing <increment> with SQL ");
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
					else if (value.match(/^<.*>$/)) {
						value = value.replace(/^</,'');
						value = value.replace(/>$/,'');
						if (debug) { console.log("SQL statement detected: " + value) }
						noQuote = 1;
					}
				}
				else if (value && value.constructor === Date) {
					value = JSON.stringify(value);
					noQuote=1;
				}

				if (resetData && resetData[fields[f]]) {
					var resetValue = resetData[fields[f]];

					if (resetValue == '<NULL>') {
						Vi.push('null');
					}
					if (resetValue == '<ID>') {
						Vi.push(idField);
					}
					else if (resetValue == null) {					
						Vi.push("\"" + value + "\"");
					}
					else {
						Vi.push("\"" + resetValue + "\"");
					}
				}						
				else if (value == null) {
					Vi.push('null');					
				}
				else if (noQuote) {
					Vi.push(value);
				}
				else {
					Vi.push("\"" + value + "\"");
				}
			}
			Values.push( "(" + Vi.join(", ") + ")");
		}

		var createString = "INSERT INTO " + table + " (" + fields.join(',') + ") VALUES " + Values.join(', ') + onDuplicate;
		console.log("\nNew Insert String: " + createString);

		Record.query_promise(createString)
		.then ( function (result) {
			var insertId = result.insertId;
			sails.config.messages.push(table + ' record added: ' + insertId);
			deferred.resolve(result);
		})
		.catch ( function (err) {
			console.log("Cloning error: " + err);
			deferred.reject({error : "Error creating new record(s): " + err}) 

		});

		return deferred.promise;
	},

};
