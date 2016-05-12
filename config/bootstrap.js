/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var q = require('q');
var fs = require('fs');
var path = require('path');

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  // sails.sql_helper = require('./../custom_modules/sql-helper.js');

	sails.config.root = process.env.LITMUS_ROOT;

	var models = Object.keys(sails.models);

	if (process.env.MYSQL_HOST) {
		console.log("Connection:\n******************\n");
		console.log("Host: \t" + process.env.MYSQL_HOST + "\n");
		console.log("DB: \t" + process.env.DEFAULT_MYSQL_DATABASE + "\n");
		console.log("User: \t" + process.env.DEFAULT_MYSQL_USER + "\n\n");
	}
	else {
		console.log("Connection parameters undefined");
		cb("Define database connection variables in config/local.js");
	}

	// console.log("Models:\n* " + models.join("\n* ") );

	var errors = [];
	var added_enum = 0;

	var promises = [];
	for (var i=0; i< models.length; i++) {

  		var Model = sails.models[models[i]];
		promises.push( fix_enums(Model) );
		promises.push( initialize_table(Model) );
	}
	
	q.all(promises)
	.then ( function (results) {
		for (var i=0; i<results.length; i++) {
			if (results[i]) {
				if (results[i].message) { console.log(results[i].message) }
			}
		}
		console.log("\n** Initialization completed successfully **");
		console.log("\n- Auto-corrected ENUM Fields\n - Initialized data\n");
		cb('',results);
	})
	.catch ( function (err) {
		console.log("Err: " + JSON.stringify(err));
		cb(err);
	});
}

function fix_enums (Model) {
	var deferred = q.defer();

	var table = Model.tableName;
		var attributes = Object.keys(Model.attributes);

		var added_enum = 0;
		var errors = [];

		// Convert to ENUM Fields in Database if applicable //

		var enumPromises = [];
		for (var j=0; j<attributes.length; j++) {
		var att = attributes[j];

		var Atype = Model.attributes[att].type;
		var Aenum =  Model.attributes[att].enum;
	        var defaultsTo = Model.attributes[att].defaultsTo;
		
		if (defaultsTo) { defaultsTo = ' DEFAULT \'' + defaultsTo + '\'' }
		else { defaultsTo = '' }

		// console.log(att + " : " + Atype + " " + Aenum);
		if (Aenum && Aenum != 'undefined') {
			var command = " ALTER TABLE " + table + " MODIFY " + att + " ENUM('" + Aenum.join("','") + "') " + defaultsTo;
			console.log("* ENUM created: " + command); 

		  	enumPromises.push( Record.query_promise(command) );
	  		added_enum++;
	  	}
	}

	if (enumPromises.length > 0) {
		q.all(enumPromises)
		. then ( function (results) {
			console.log("Corrected " + results.length + " ENUM fields in " + table);
			deferred.resolve({ message: "corrected " + results.length + " ENUM fields in " + table});
		})
		. catch ( function (err) {
			deferred.reject({error: err})
		})
	}
	else { deferred.resolve({}) }

	return deferred.promise;
}

function initialize_table (Model) {
	// Initialize data if applicable //

	var deferred = q.defer();
	var table = Model.tableName;
		
	Record.query_promise("SELECT count(*) as count FROM " + table)
	.then ( function (result) {

		var count = result[0].count;

		if (count > 0) {
			deferred.resolve({message: count + " records found in " + table });
		}
		else {
			if (Model.initData && Model.initData != 'undefined' && Model.initData.length > 0) {
				console.log(table + ' initData defined');
				Model.create(Model.initData)
				.exec( function (err, result) {
					if (err) { deferred.reject(err) }
					else { 
						console.log("* Initialized " + table + " with " + result.length + ' records');
						q.when( load_custom_data(Model) )
						.then (function (msg) {
							deferred.resolve(msg)
						})
						.catch (function (err) {
							deferred.reject(msg);
						});
					}
				});
			}
			else {
				load_custom_data(Model)
				.then (function (msg) {
					deferred.resolve(msg);
				})
				.catch (function (err) {
					deferred.reject(msg);
				});
			}
		}
	})
	.catch ( function (err) {
		
		var msg = 'Could not count ' + table + ' records (run once with migrate = alter if table not yet created)'
		deferred.reject(msg);
	});

	return deferred.promise;
}

function load_custom_data (Model) {

	var table = Model.tableName;
	var deferred = q.defer();

	var file = __dirname + "/data/" + table + '.txt';

	Record.uploadFile(table, file )
	.then ( function (add) {
		if (add) {
			var id = add.insertId;
			var added = add.affectedRows;
			var msg = "* Added " + added + ' custom ' + table + " records : " + id + '...' + id+added-1;
			deferred.resolve({ message: msg});
		}
		deferred.resolve();
	})
	.catch ( function (err) {

		deferred.resolve();
	});	

	return deferred.promise;
}
