/**
 * RecordController
 *
 * @description :: Server-side logic for managing Generic records
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var q = require('q');

var Logger = require('../services/logger');

module.exports = {

	// get custom attributes from models to ensure specifications remain centralized

	// eg model access control, field descriptions .... anything not handled intrisically by the existing model 

/*
	new: function (req, res) { 
		var model = req.param('model');

		console.log("retrieving " + model + ' model');
		var table = sails.models[model].tableName || model;

		Record.query("desc " + table, 
			function (err, result) {
				if (err) {
					return res.negotiate(err);
	     		}

				if (!result) {
					console.log('no record results');
					return res.send('');
				}

				if ( sails.models[model] && sails.models[model]['attributes']['role'] && sails.models[model]['attributes']['role']['xdesc']) {
					console.log('load extra info...' + sails.models[model]['attributes']['role']['xdesc'])
				}

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

	                    }
	                    else if (recordModel.attributes[fld]['collection']) {
	                        type = 'list link';
	                    }
	                    else if (recordModel.attributes[fld]['model']) {
	                        type = 'lookup';
	                    	lookup = {'1' : '123', '2' : '456'};	
						} 
					}

					if (fld == 'id' || fld == 'createdAt' || fld == 'updatedAt') {
						type = 'Hidden'
					}

					Fields.push({'Field' : fld, 'Type' : type, 'Options' : options, 'Lookup' : lookup});
				}

				var access = '';   // store access permissions in database ? ... or in model ... 
				var data = { table: table, fields: Fields, access: access, action: 'Add'};
				console.log("Render form with " + JSON.stringify(data));
				res.render('record/form', data);
			}
		);
	},
/*
	add: function (req, res) {
		
		var table;
		if (req.param && req.param('table')) { table = req.param('table') }
		else if (req.body && req.body.table) { table = req.body.table }

		console.log('add ' + table + ' record...');

		Record.query("desc " + table, function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			console.log("fields: " + JSON.stringify(result));
			var keys = result.keys;
			console.log('K: ' + JSON.stringify(keys));
			
			var data = {};
			for (var i=0; i< results.length; i++) {
				var field = results[i]["Field"];

				data[field] = req.param(field);
			}
			console.log('Data: ' + JSON.stringify(data));
		});
	},
*/

	// same as new ... should combine... 
	form: function (req, res) {
		var model = req.param('model');

		console.log("Edit " + model);
		// Record specific data 
		var table = req.param('table') || model;
		var id    = req.param('id');
		var condition = req.param('condition') || '1';

		if (id) { condition = condition + " AND " + table + '.id' + "=" + id }
			
		console.log("retrieving " + model + ' model');
		var table = sails.models[model].tableName || model;

		console.log('get fields...');
		Record.get_fields(table)
		.then ( function (result) {
			console.log("parsed fields from table: " + JSON.stringify(result));
				var promises = [];
				var edit = 1;

				if (edit) {
					promises.push( Record.query_promise("SELECT * FROM " + table + " WHERE " + condition) );
				}

				q.all(promises)
				.then (function (data) {
					console.log("DATA: " + JSON.stringify(data));

					var Fields = result;

					var access = '';   // store access permissions in database ? ... or in model ... 
					var input = { table: table, fields: Fields, access: access, action: 'Add', data: data};
					console.log("Render form with " + JSON.stringify(input));
					return res.render('record/form', input);
				})
				.catch (function (err) {
					Logger.error('could not load data in promises', 'form');
					console.log("Error loading data: " + err);
					return res.negotiate(err);
				});
			}
		);
	},

	update: function (req, res) {
		console.log("Update...");
		return res.json({ results: [ { 'id' : 1, 'name' : 'Ran'} ] });
	},

	list : function (req, res) {
		var table;
		var condition = '1';

		var body = req.body || {};

		if (req.param && req.param('model')) {}
		if (body.model || body.table) { 
			table = req.body.model || req.table; 
			if (body.condition) { condition = body.condition }
			console.log("body: " + JSON.stringify(body));
		}
		else if (req.param('body') || req.param('table') ) {
			table = req.param('model') || req.param('table');
		}

		var fields = body.fields || '*';
		var element = body.element || req.param('element') || 'injectedData';  // match default in CommonController
		
		var iconify = body.iconify;

		console.log('table = ' + table);

		var query = "Select " + fields + " from " + table;
		console.log("Generate list of " + table + ' records: ' + query);

		var model = sails.models[table] || {};
		var fields = model.viewFields;

		var query = "Select * from " + table + " WHERE " + condition;
		console.log("Generate list of " + table + ' records: ' + query);

		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			console.log("List Data: " + JSON.stringify(result));

			if (result.length) {
				if (!fields) { fields = Object.keys(result[0]) }
				// return res.render('record/embedded_list', { table : table, fields : fields, data : result });
				return res.render('customize/injectedData', { table : table, fields : fields, data : result, element: element, iconify: iconify});
			}
			else {
				return res.send("No data");
			}
		});
	},

	view : function (req, res) {
		var table = req.param('model');
		var id    = req.param('id');
		var condition = req.param('condition') || '1';

		if (id) { condition = condition + " AND " + table + '.id' + "=" + id }

		var model = sails.models[table] || {};
		var fields = model.viewFields;

		var query = "Select * from " + table + " WHERE " + condition;
		console.log("Generate list of " + table + ' records: ' + query);

		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			console.log("View Data: " + JSON.stringify(result));

			if (result.length) {
				if (!fields) { fields = Object.keys(result[0]) }
				console.log("Fields: " + fields.join(','));

				return res.render('record/view', { table : table, id: id, fields : fields, data : result });
			}
			else {
				return res.send("No data");
			}
		});

	},

	record_dump : function (req, res) {
		// generate a dump of N existing data records from a seed table, 
		// automatically including any referenced records from other tables
		var body = req.body || {};
		var model = body.model || req.param('model');
		var N = body.N;
		var id = body.id || 1;
		var iterate = body.iterate || 1;

		var t = req.param('model');
		console.log("model: " + t);
		
		console.log('body: ' + JSON.stringify(body));

		Record.dump(model, { id: id, iterate: iterate, N: N })
		.then ( function (result) {
			return res.json(result);
		})
		.catch (function (err) {
			return res.json(err);
		});

	},

	build_FK : function (req, res) {

		Record.build_FK('Plate')
		.then ( function (result) {
			console.log("build FK");
			console.log(JSON.stringify(result));	
			res.json(result);
		})
		.catch ( function (err) {
			console.log("Error building FK");
			res.json(err);
		});
	}

};

