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

		if (groupBy) { query = query + ' GROUP BY ' + groupBy.join(',') }
		if (orderBy) { query = query + ' ORDER BY ' + orderBy.join(',') }
		if (limit) { query = query + ' LIMIT ' + limit }

		console.log("built query: " + query);
		return query;
	},

	query_promise: function (query) {
		// Wrapper for standard Record.query returning a promise //	
		var deferred = q.defer();

		Record.query(query, function (err, result) {
			if (err) { deferred.reject(err) }
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
		
		var attributes = ['message', 'warning', 'error'];
		if (!merged) { merged = {} }

		for (var i=0; i<results.length; i++) {
			for (var j=0; j<attributes.length; j++) {
				var att = attributes[j];
				var atts = att + 's';
				var found = results[i][att] || results[i][atts];
				if (found) {
					if (!merged[atts]) { merged[atts] = [] }
						// test ... also account for string value ... replace with array ... 
					if ( found.constructor === Array ) {
						for (k=0; k<found.length; k++) {
							merged[atts].push(found[k]);   
						}
					}
					else {
						merged[atts].push(found);
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
						var value = resetData[resetFields[j]] || '';
						console.log(Index[id] + " v: " + resetFields[j] + ' = ' + value);
						var setValue = value;


						if (value && value.constructor === Object && value[id] )  {
							if (value[id].constructor === Array ) {
								setValue = value[id][Index[id]];  // multiple values supplied ... one for each duplicate ... 
							}
							else {
								setValue = value[id];
							}
						}
						else if ( value == '<id>' ) {
							setValue = id;
						}
						else if (value.constructor === String ) {
							setValue = value;
							console.log('(constant)');
						}

						addData[resetFields[j]] = setValue;
						console.log(id + ': ** Record RESET ' + resetFields[j] + ' to ' + setValue);
					}

					console.log(id + " Cloned : " + JSON.stringify(addData));
					newData.push(addData);
				}

				console.log("\nNew Data: " + JSON.stringify(newData));

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
		deferred.resolve({ warnings: 'Need to add method... also store change history if applicable'});

		return deferred.promise;
	},	

	createNew : function (table, Tdata, resetData) {
		// Bypass waterline create method to enable insertion into models in non-standard format //
		
		var deferred = q.defer();
		//console.log("\ncreate new record(s) in " + table);

		if (Tdata == 'undefined') { deferred.reject('no data'); return deferred.promise }

		var data = [];
		if (Tdata.length == undefined) { data = [Tdata] }
		else { data = Tdata }

		var fields = Object.keys(data[0]);

		var Values = [];
		var onDuplicate = '';

		for (var index=0; index<data.length; index++) {
			var Vi = [];
			for (var f=0; f<fields.length; f++) {
				var value = data[index][fields[f]];
				if (value === 'NULL') {
					value = null;
				}

				var noQuote = 0;
				if (typeof value == 'number') { value = value.toString() }

				if (value == null) {}
				else if (value.match(/^<user>$/i)) {
					value = sails.config.payload.userid; 
					console.log("replacing <user> with " + value);
				}
				else if (value.match(/^<increment>$/i)) {
					value = 1;
					onDuplicate = " ON DUPLICATE KEY UPDATE " + fields[f] + "=" + fields[f] + " + 1";
					console.log("replacing <increment> with SQL ");
				}
				else if (value.match(/^<now>$/i)) {
					value = 'NOW()'; 
					console.log("replacing <now> with " + value);
					noQuote = 1;
				}
				else if (value.match(/^<today>$/i)) {
					value = 'CURDATE()'; 
					console.log("replacing <today> with " + value);
					noQuote = 1;
				}

				if (resetData && resetData[fields[f]]) {
					var resetValue = resetData[fields[f]];
					console.log("** RESET (std) " + fields[f] + " to " + resetValue); 

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
		console.log("\nInsert String: " + createString);

		Record.query(createString, function (err, result) {
			if (err) { deferred.resolve({error : "Error creating new record(s): " + err}) }
			else {
				var insertId = result.insertId;
				deferred.resolve(result);
			}
		});
		
		return deferred.promise;
	},

};
