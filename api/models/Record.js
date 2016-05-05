/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var fs = require('fs');

module.exports = {

	attributes: {

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
				for (var i=0; i<elements.length; i++) {
					record[headers[i]] = elements[i];
	 			}
	 			data.push(record);
			})
			console.log("* Added " + data.length + " custom records in " + table);
			// console.log("\nHeaders: " + headers);
			Record.createNew(table, data, {}, { NULL : "\\N" } )
			.then ( function (added) {
				deferred.resolve(added);
			})
			.catch ( function (err) {
				var msg = "Error adding data to " + table + ":\n" + JSON.stringify(data);
				deferred.reject(msg);
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
		var id_list = ids.join(',');
		console.log("CLONING " + id_list);

		var deferred = q.defer();

		if (! options) { options = {} }
		var idField = options.id || 'id';

		var query = "SELECT * from " + table + " WHERE " + idField + ' IN (' + id_list + ')';	
		console.log("q: " + query);

		Record.query(query, function (err, result) {

			if (err) { console.log("cloning error: " + err); deferred.reject(err);  }
			else if (result.length == 0) {
				console.log("cloned record not found");
				deferred.reject("reference record not found");
			}
			else {
				var data = result;
			
				var resetFields = Object.keys(resetData);	
				for (var index=0; index<result.length; index++) {
					var id = result[index][idField];

					for (var i=0; i<resetFields.length; i++) {
						var value = resetData[resetFields[i]];
						if (typeof value == 'object')  {
							value = resetData[resetFields[i]][index];
						}
						else if ( value == '<id>' ) {
							value = id;
						}
						else {
							value = resetData[resetFields[i]];
						}

						data[index][resetFields[i]] = value;
						console.log('** RESET ' + resetFields[i] + ' to ' + value);
					}
				}

				console.log("\nNew Record: " + JSON.stringify(data));
				console.log("Reset: " + JSON.stringify(resetData));

				Record.createNew(table, data)
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
							deferred.resolve({ data: data, created: newResponse, attributes: data1});
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

				if (typeof value == 'number') { value = value.toString() }

				if (value == null) {}
				else if (value.match(/^<user>$/i)) {
					value = sails.config.userid; 
					console.log("replacing <user> with " + value);
				}
				else if (value.match(/^<increment>$/i)) {
					value = 1;
					onDuplicate = " ON DUPLICATE KEY UPDATE " + fields[f] + "=" + fields[f] + " + 1";
					console.log("replacing <increment> with SQL ");
				}
				else if (value.match(/^<now>$/i)) {
					value = '2016-01-01'; 
					console.log("replacing <now> with " + value);
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
				else if (value == null){
					Vi.push('null');					
				}
				else {
					Vi.push("\"" + value + "\"");
				}
			}
			Values.push( "(" + Vi.join(", ") + ")");
		}

		var createString = "INSERT INTO " + table + " (" + fields.join(',') + ") VALUES " + Values.join(', ') + onDuplicate;
		//console.log("\nInsert String: " + createString);

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

