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

	clone : function (table, id, resetData) {
		console.log("CLONING " + id);

		var deferred = q.defer();
	
		var query = "SELECT * from Plate where Plate_ID = " + id;	
		console.log("q: " + query);

		Record.query(query, function (err, result) {

			if (err) { console.log("cloning error: " + err); deferred.reject(err);  }
			else if (result.length == 0) {
				console.log("cloned record not found");
				deferred.reject("reference record not found");
			}
			else {
				var data = result;
				for (var index=0; index<result.length; index++) {
					var resetFields = Object.keys(resetData);

					for (var i=0; i<resetFields.length; i++) {
						var value = resetData[resetFields[i]] || null;
						data[index][resetFields[i]] = value;
						console.log('reset ' + resetFields[i] + ' to ' + value);
					}
				}

				console.log('generate new records...');
				Record.createNew(table, data)
				.then (function (target_id) {
					Record.clone_attributes(table, target_id)
					.then (function (data1) {
						console.log('data1');
					})
					.catch ( function (err2) {
						deferred.reject('err1');
					});	
				})
			}
		});
		return deferred.promise;

	},

	createNew : function (table, data) {
		// Bypass waterline create method to enable insertion into models in non-standard format //
		var deferred = q.defer();
		console.log("create new record(s) in " + table + ": " + JSON.stringify(data));
		
		var resetData = {'Plate_ID' : 'null', 'Plate_Created' : '2001-01-01', FKParent_Plate__ID : '123' };

		var Values = [];
		for (index=0; index<data.length; index++) {
			var Vi = [];
			var F = [];
			var fields = Object.keys(data[index]);
			for (var f=0; f<fields.length; f++) {
				var value = data[index][fields[f]];

				F.push(fields[f]);
				if (resetData[fields[f]]) {
					Vi.push(resetData[fields[f]]);
				}
				else if (value == null) { 
					Vi.push('null');
				}
				else {
					Vi.push("\"" + value + "\"");
				}
			}
			Values.push( "(" + Vi.join(", ") + ")");
		}
		var createString = "INSERT INTO " + table + " (" + F.join(',') + ") VALUES " + Values.join(', ');
		console.log("CREATE: " + createString);

		setTimeout(function(){
    		console.log("Waited...");
    		deferred.resolve({'newdata' : 'abc'});
		}, 3000);
		
		return deferred.promise;
	},

	clone_attributes : function (table, target_id) {
		var deferred = q.defer();
		console.log('clone attributes for ' + table + target_id);
		deferred.resolve({'att1' : 123});
		return deferred.promise;
	}
};

