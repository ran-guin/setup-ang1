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

		//
			
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
	                        options.lookup = recordModel.attributes[fld]['model'];

//	                        var refmodel = recordModel.attributes[fld]['model'];
//	                       	if (refmodel && sails.models[refmodel]) {
//	                        	options.lookup = sails.models[refmodel].tableName || refmodel;
//	                        }

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
	
	update: function (req, res) {
		console.log("Update...");
	},

	enum: function (req, res) {
		var model = req.param('model');
		var field = req.param('field');

		var Mod = sails.models[model];
		if (Mod) {
			var table = Mod.tablename || model;

			var field_atts = Mod.attributes[field];
			if (field_atts && field_atts.enum) {
				var options = field_atts.enum;

				var identifier = field;
				console.log("Enum: " + options.join(','));
				var data = [];
				for (var i=0; i<options.length; i++) {
					data[i] = {};
					data[i].id = i;
					data[i].label = options[i];
				}
				console.log("Data: " + JSON.stringify(data));
				return res.render('core/lookup', { table: table, identifier : identifier, data : data, prompt: field })
			}
			else { return res.json('not an enum') }
		}
		else { return res.json("Model " + model + ' not defined') }
	},

	lookup: function (req, res) {
		// Simple accessor to generate lookup table
		// Options: 
		// model = Sample_type, condition = '..' -> lookup table of Sample type options
		//
		// model = 'Rack', field = 'Capacity'  -> lookup table containing distinct values ... 

		var model = req.param('model') || req.param('table');
		//var fields = req.param('fields') || '';
		var prompt = req.param('prompt');
		var condition = req.param('condition') || 1;
		var defaultTo = req.param('default') || 'ml';
		var field     = req.param('field');
		var label     = req.param('labal');
		var table = req.param('table');

		var idField = 'id';
		var nameField = 'name';
		var identifier = model;

		var select;

		if (sails.models[model]) {
			var Mod = sails.models[model];
			table = table || Mod.tableName || model;

			if (Mod.lookupCondition) {
				condition = condition + ' AND ' + Mod.lookupCondition;
			}

			if (Mod.alias) {
				idField = Mod.alias.id || 'id';
				nameField = Mod.alias.name || 'name';	

				console.log(table + " Set idField to alias: " + idField);	
			}  

			
			if (!prompt) { 
				if (Mod.tableAlias) { prompt = '-- Select ' + Mod.tableAlias + ' --' }
				else { prompt = '-- Select ' + model }
			}
			
			if (field && Mod.attributes[field] && Mod.attributes[field].enum) {
				var options = Mod.attributes[field].enum;
				return res.render('core/lookup', { table: table, identifier : identifier, data : { label : options}, prompt: field })
			}
			else if (field) {
				// retrieve distinct list of options from a particular field ... or ...
				table = table || model;
				select = " DISTINCT " + field + ' as label';
			}
			else {
				// select all values from specified table as lookup .. 
				select = idField + ' as id, ' + nameField + ' as label';
			}
		}

		console.log('generate ' + table + ' lookup');
		/*
		fields = fields + '::';  // extend to ensure array has at least elements..

		console.log("LABELS: " + fields);
		var extract = fields.split(':');
*/

		var query = "Select " + select + " from " + table + " WHERE " + condition;

		console.log("Lookup Query: " + query);

		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			
			//console.log("Lookup: " + JSON.stringify(result));
			return res.render('core/lookup', { table : table, identifier : identifier, data : result, prompt: prompt, defaultTo: defaultTo });
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

				return res.render('record/view', { table : table, id: id, fields : fields, data : result });
			}
			else {
				return res.send("No data");
			}
		});

	},

	search : function (req, res) {

		var string = req.body.search;
		var scope = req.body.scope;
		var condition = req.body.condition || {}

		if (! scope ) {
			// Generic Search 
			scope = { 
				'user' : ['email', 'username'] 
			};
		}

		console.log("Condition: " + JSON.stringify(condition));
		var deferred = q.defer();

		var promises = [];

		var tables = Object.keys(scope);
		for (var i=0; i< tables.length; i++) {
			var fields = scope[tables[i]];
			var query = "SELECT " + fields.join(',') + " FROM " + tables[i];
			
			if (condition &&  condition.constructor === Object && condition[tables[i]] )  { query = query + " WHERE " + condition[tables[i]] }
			else if (condition && condition.constructor === String) { query = query + " WHERE " + condition }

			console.log("\n** Search: " + query);
			promises.push( Record.query_promise(query));
		}

		q.all(promises) 
		.then ( function ( results ) {
			for (var i=0; i<results.length; i++) {
				console.log(i + ': ' + JSON.stringify(results[i]));
			}
			return res.json(results);
		});

	},

	save : function (req, res) {
		var body = req.body;

		var model = req.param('model') || body.model;
		var data  = body.data;

		Record.createNew(model, data)
		.then ( function (result ) {
			return res.json(result);
		})
		.catch ( function (err) {
			return res.json(err);
		});
	},

	parseMetaFields : function (req, res) {
		var body = req.body;

		if (!body) { body = {} }
		var model   = body.model || req.param('model') ;
		var headers = body.headers || req.param('headers').split(',');

		console.log("Parse " + model + ' : ' + JSON.stringify(headers) );

		var parsedFields = Record.parseMetaFields(model, headers)
		.then ( function (result) {
			console.log("parsed meta fields ");
			return res.json(result);
		})
		.catch ( function (err) {
			console.log("ERROR PARSING: " + err);
			return res.json(err);
		});
	},

	uploadData : function (req, res) {
		var body = req.body;

		var model   = body.model;
		var headers = body.headers;
		var data    = body.data;

		console.log("UPLOAD DATA");
		console.log("model : " + model);
		console.log("headers: " + JSON.stringify(headers));
		console.log("data: " + JSON.stringify(data));

		Record.uploadData(model, headers, data)
		.then ( function (result) {
			sails.config.messages.push("uploaded");
			console.log("Uploaded");
		})
		.catch (function (err) {
			console.log("Error uploading: " + err);
			sails.config.errors.push(err);
			return res.render('customize/private_home');
		});
	},
};

