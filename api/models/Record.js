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

			if (err) { console.log("cloning error"); deferred.reject(err);  }

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
				});
			})
			.then (function (data2) {
				console.log('data2');
				deferred.resolve(data);
			});
		});
		return deferred.promise;

	},

	createNew : function (table, data) {
		var deferred = q.defer();
		console.log("create new record(s) in " + table + ": " + JSON.stringify(data));

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

