/**
 * Change_history.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');

module.exports = {

	migrate: 'safe',
	tableName: 'Change_History',
	primaryField: 'Change_History_ID',

	attributes: {
		FK_DBField__ID : { type : 'integer' },
		Old_Value : { type : 'string'},
		New_Value : { type : 'string'},
		FK_Employee__ID : { type : 'integer'},
		Modified_Date : { type : 'time' },
		Record_ID : { type : 'int' },
		Comment : { type : 'text'}
	},

    update_History : function (model, ids, data, track, History, timestamp, payload) {
    	// retrieve values before record is updated  ... run in conjunction with similar call with History set.. 
    	var deferred = q.defer();

    	if (!timestamp) { timestamp = '<NOW>' }

    	ids = Record.cast_to(ids, 'array');

    	console.log('use model ' + model);
    	var Mod = sails.models[model] || {};    	
    	var	table = Mod.tableName || model;

    	var key;
    	track = track || ['FK_Rack__ID'];  // always track Rack_ID changes ... 

    	console.log("\n*** update History with " + JSON.stringify(History));
    	console.log(model);
    	console.log(ids.join(','));
    	console.log(JSON.stringify(track));
 
    	var save = false;

    	if (model && ids && ids.length && data && track && track.length && Mod) {
	    	if (History) { 
	    		key = 'New_Value'
	    		save = true;
	    	}
	    	else { 
	    		History = {};
	    		key = 'Old_Value';
	    	}

	    	if (! History[table]) { History[table] = {} }

    		var idField = Record.alias(model,'id');
			
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

				console.log("Track: " + JSON.stringify(track));
				console.log("FK: " + JSON.stringify(FK));
				console.log("FKT: " + JSON.stringify(FKT));

				console.log(JSON.stringify(result));
				var changed_records = 0;
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
								History[table][id][f]['Modified_Date'] = timestamp;								
								History[table][id][f]['FK_Employee__ID'] = payload.alDenteID;

								changed_records++;

								if (f === 'FK_Rack__ID' || f === 'FKParent_Rack__ID' ) {
									// make more generic !
								    var relocate = {};
								    relocate['Moved_from'] = History[table][id][f]['Old_Value'];
								    relocate['Moved_to'] = result[i][f];
								    relocate['moved'] = timestamp;
								    relocate['Moved_by'] = '<userid>';

								    if (f === 'FK_Rack__ID') {
									relocate['Container'] = id;
								    }
								    else {
									relocate['Rack'] = id;
								    }

								    Relocate.push(relocate);
								}

							}
						}
					}
				}

				if (save && changed_records) {
					Change_history.saveHistory(History, Relocate, payload)
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
    		console.log("no history to save... ");
    		deferred.resolve();
    	}

    	return deferred.promise;
    },

    saveHistory : function (History, Relocate, payload) {
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
	    			// data.FK_Employee__ID = payload.alDenteID;
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
    	console.log("Relocating: " + JSON.stringify(Relocate));
    	deferred.resolve(Data);
    	
    	Record.createNew('Change_History', Data, null, payload)
    	.then ( function (result) {
    		console.log("tracked Change History");
	    	console.log("Relocate: " + JSON.stringify(Relocate));

		if (Relocate && Relocate.length) {
	    		Record.createNew('sample_tracking', Relocate, null, payload)
	    		.then ( function (relocated) {
	    			deferred.resolve(relocated);
	    		})
	 		.catch ( function (err) {
	 			console.log("Error tracking sample history: " + err);
	 			deferred.reject(err);
	 		});   	    	
		}
		else {
			deferred.resolve(result);
		}	
    	})
    	.catch ( function (err) {
    		console.log("Error tracking Change History");
	    	
	    	// perform sample tracking regardless ... if possible... 
	    	Record.createNew('sample_tracking', Relocate, null, payload)
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

}

