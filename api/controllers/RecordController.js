/**
 * RecordController
 *
 * @description :: Server-side logic for managing Generic records
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var q = require('q');

module.exports = {

	// get custom attributes from models to ensure specifications remain centralized

	// eg model access control, field descriptions .... anything not handled intrisically by the existing model 


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
					var type = result[i]['Type'];
					var options = [];
					var lookup = {};

					console.log("Field: " + fld + ": " + type);
					if (recordModel && recordModel.attributes  && recordModel.attributes[fld]) {
					    if (recordModel.attributes[fld]['type']) {
	                        if (recordModel.attributes[fld]['enum']) {
	                            type = 'enum';
	                          	options = recordModel.attributes[fld]['enum'];
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

	edit: function (req, res) {
		console.log("Edit...");
		return res.send("EDIT FORM");
	},
	
	update: function (req, res) {
		console.log("Update...");
	},

	lookup: function (req, res) {
		var table = req.param('table');
		var fields = req.param('fields') || 'id:name';
		var prompt = req.param('prompt') || 'Select:';
		var condition = req.param('condition') || 1;

		if (fields == 'undefined') { fields = 'id:name' }
			
		console.log('generate ' + table + ' lookup');
		console.log("using: " + fields);

		var extract = fields.split(':');

		if (extract.length == 1) { extract[1] = extract[0] }

		var select = extract[0] + ' as id, ' + extract[1] + ' as label';
		var query = "Select " + select + " from " + table + " WHERE " + condition;
		console.log("Query: " + query);

		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			console.log("Lookup: " + JSON.stringify(result));
			//return res.send(result);
			return res.render('core/lookup', { table : table, data : result, prompt: prompt });
		});
	},

	list : function (req, res) {
		var table;
		var condition = '1';

		if (req.param && req.param('model')) { table = req.param('model'); console.log('param: ') + table }
		else if (req.body) { 
			table = req.body.model || req.body['model-label']; 
			if (req.body.condition) { condition = req.body.condition }
			console.log("body: " + JSON.stringify(req.body));
		}
		else { console.log('table = ' + table) }

		var query = "Select * from " + table;
		console.log("Generate list of " + table + ' records: ' + query);

		var model = sails.models[table] || {};
		var fields = model.viewFields;

		var query = "Select * from " + table + " WHERE " + condition;
		console.log("Generate list of " + table + ' records: ' + query);

		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			console.log("Data: " + JSON.stringify(result));

			if (result.length) {
				if (!fields) { fields = Object.keys(result[0]) }
				return res.render('record/list', { table : table, fields : fields, data : result });
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
			console.log("Data: " + JSON.stringify(result));

			if (result.length) {
				if (!fields) { fields = Object.keys(result[0]) }
				console.log("Fields: " + fields.join(','));

				return res.render('record/view', { table : table, fields : fields, data : result });
			}
			else {
				return res.send("No data");
			}
		});

	}
	
};

