/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {

	attributes: {

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
			console.log("PULLED: " + JSON.stringify(result));
			console.log("RESET: " + JSON.stringify(resetData));
			if (err) { console.log("cloning error: " + err); deferred.reject(err);  }
			else if (result.length == 0) {
				console.log("cloned record not found");
				deferred.reject("reference record not found");
			}
			else {
				var data = result;
				
				for (var index=0; index<result.length; index++) {
					var id = result[index][idField];
					var resetFields = Object.keys(resetData[id]);

					for (var i=0; i<resetFields.length; i++) {
						var value = resetData[id][resetFields[i]] || null;
						data[index][resetFields[i]] = value;
						console.log('** RESET ' + id + ':' + resetFields[i] + ' to ' + value);
					}
				}
				
				Record.createNew(table, data, resetData)
				.then (function (newResponse) {
					console.log("createNew response: " + JSON.stringify(newResponse));
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
							deferred.reject('atterr2' + err2); //{error :err2, table: table, ids: ids, target_ids: target_ids});
						});	
					}
					else if (target_count == 0) {
						deferred.reject('atterr0'); //error: "No target records created", response: newResponse });
					}
					else {
						deferred.reject('atterr00: ' + ids + ':' + target_ids); //{error: "Target count != Source count", sources: ids, targets: target_ids});
					}
				})
				.catch ( function (err3) {
					deferred.reject('atterr3'+err3); //{error: err3, table: table, data: data, reset: resetData});
				});
			}
		});
		return deferred.promise;

	},

	createNew : function (table, Tdata, resetData) {
		// Bypass waterline create method to enable insertion into models in non-standard format //
		
		console.log("**** CALL createNew WRAPPER *****");
		var deferred = q.defer();
		console.log("create new record(s) in " + table + ": " + JSON.stringify(Tdata));

		if (Tdata == 'undefined') { deferred.reject('no data'); return deferred.promise }
		
		console.log('type: ' + typeof Tdata.length);
		//var F = [];
		var dtype = typeof Tdata.length;

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

				if (typeof value == 'number') { value = value.toString() }

				console.log("check " + value);
				if (value.match(/^<user>$/i)) {
					value = 7;
				}
				else if (value.match(/^<increment>$/i)) {
					value = 1;
					onDuplicate = " ON DUPLICATE KEY UPDATE " + fields[f] + "=" + fields[f] + " + 1";
				}
				else if (value.match(/^<now>$/i)) {
					value = '2016-01-01'; 
				}

				if (resetData && resetData[fields[f]]) {
					var resetValue = resetData[fields[f]];
					console.log("** RESET (std) " + fields[f] + " to " + resetValue); 

					if (resetValue == '<NULL>') {
						Vi.push('null');
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
		console.log("INSERT STRING: " + createString);

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

