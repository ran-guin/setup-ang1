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
		promises.push( custom_initialize(Model) );

		

	}

	var custom_data_files = ['Plate_Format', 'Sample_Type', 'Attribute', 'lab_protocol', 'protocol_step'];
	var added_custom_data = 0;
	for (var i=0; i<custom_data_files.length; i++) {
		var table = custom_data_files[i];

		var add = Record.uploadFile(table, __dirname + "/data/" + table + '.txt' );
		if (add) { added_custom_data = added_custom_data + 1 }
		else { console.log("** Warning: missing customization file for " + table) }
	}
	console.log("Added data from " + added_custom_data + " custom init files" );
	
	q.all(promises)
	.then ( function (results) {
		for (var i=0; i<results.length; i++) {
			if (results[i].init) {
				console.log(results[i].init);
			}
			if (results[i].errors) {
				console.log("\n*** Warning: " + JSON.stringify(results[i].errors));
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

	function custom_initialize(Model) {
		var deferred = q.defer();

		var Table = Model.tableName;
  		var attributes = Object.keys(Model.attributes);
 
 		var added_enum = 0;
 		var errors = [];

  		// Convert to ENUM Fields in Database if applicable //

  		for (var j=0; j<attributes.length; j++) {
			var att = attributes[j];

			var Atype = Model.attributes[att].type;
			var Aenum =  Model.attributes[att].enum;
		        var defaultsTo = Model.attributes[att].defaultsTo;
			
			if (defaultsTo) { defaultsTo = ' DEFAULT \'' + defaultsTo + '\'' }
			else { defaultsTo = '' }
	
			// console.log(att + " : " + Atype + " " + Aenum);
			if (Aenum) {
				var command = " ALTER TABLE " + Table + " MODIFY " + att + " ENUM('" + Aenum.join("','") + "') " + defaultsTo;
				console.log("* ENUM created: " + command); 

		  		Record.query(command, function (err, result) {
		  			if (err) {
						console.log("ERROR:" + err);
						errors.push(err);
		     		}
		  		});

		  		added_enum++;
		  	}
		}

		// Initialize data if applicable //

		if (Model.initData && Model.initData != 'undefined' && Model.initData.length > 0) {
			Model.count().exec(function (err, count) {
	    		if (err) deferred.reject({ errors: errors, init : err});
	    		if (count > 0) deferred.resolve({ init : Table + " table already initialized (" + count + " records found)"});
				else {
					Model.create(Model.initData)
					.exec( function (err, result) {
						if (err) { deferred.reject({errors: errors, init: err}) }
						else { deferred.resolve({ init: "* Initialized " + Table + " with " + result.length + ' records'}) }
					});
				}
			});
		}
		else { deferred.resolve({}) }

		return deferred.promise;

	}
};
