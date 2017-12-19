/**
 * Record_APIController
 *
 * @description :: Server-side logic for managing record_apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');

var Logger = require('../services/logger');

module.exports = {


	remoteQuery : function ( req, res ) {
		var body = req.body;

		var query = body.query;

		console.log("q: " + query);
		Record.query_promise(query)
		.then ( function (result) {
			console.log("Remote Query Result: " + JSON.stringify(result));
			return res.json(result);
		})
		.catch ( function (err) {
			Logger.error(err, 'query error', 'remoteQuery');
			console.log("Error: " + err);
			return res.json(err);
		});
	},

	fields: function (req, res) {
		var body = req.body || {};

		var table = body.table || req.param('table');

		if (table) {
			Record.query_promise("SELECT Field_Name as name, Field_Type as type from DBField where Field_Table='" + table + "'")
			.then (function (result) {
				return res.json(result);
			})
			.catch ( function (err) {
				console.log("Error in search: " + err);
				return res.json(err);
			});
		}
		else {
			return res.json();
		}
	},

	search : function (req, res) {
		var body = req.body || {};
		console.log("Search API");

		var scope = body.scope;
		var condition = body.condition || req.param('condition') || 1;  // may be string or object with scope table as keys 
		var group     = body.group;
		var search    = body.search || req.param('search');
		var idField   = body.idField || '';
		var table = body.table || req.param('table');
		var link = body.link || req.param('link');

		if (! scope ) {
			// Generic Search 
			scope = { 
				'user' : ['email', 'name'],
				'staff' : ['alias', 'role'],
				'container' : ['comments'],
				'equipment' : ['name', 'serial_number'],
				'stock' : [ 'PO_Number', 'notes', 'Requisition_Number', 'lot_number'],
				'prep'  : [ 'comments'],
				'shipment' : ['waybill_number', 'comments'],
				'lab_protocol' : ['name'],
				'protocol_step' : ['name', 'message'],
				'disease' : ['name'],
				'vaccine' : ['name','code'],
				'custom_view' : ['custom_name'],
				'country' : ['name', 'country', 'region', 'subregion'],
				'coverage': ['vaccine', 'code', 'coverage']
			};
		}

		if (table && scope[table]) {
			var newscope = {};
			newscope[table] = scope[table];
			
			var conditions = [];
			if (condition) { conditions.push(condition) }

			if (link && scope[link]) {
				for (var i=0; i<scope[link].length; i++) {
					var fld = scope[link][i];
					newscope[table].push(fld);
				}
			}

			console.log('check for ' + table + ' conditions');
			for (var i=0; i<scope[table].length; i++) {
				var fld = scope[table][i];
				var test = body[fld] || body[table + '.' + fld] || req.param(fld) || req.param(table + '.' + fld);
				console.log(fld + ' ? : ' + test);
				if (test) {
					test = test.replace('*','%');
					conditions.push(table + '.' + scope[table][i] + " LIKE '" + test + "%'");
				}
			}

			condition = conditions.join(' AND ');

			scope = newscope;
			console.log("SCOPE IS" + JSON.stringify(scope));
			console.log('and ' + link + ' and ' + JSON.stringify(newscope))
		
			console.log("Condition: " + condition);

			Record.search({scope : scope, link: link, search : search, condition: condition, group: group, idField: idField})
			.then (function (result) {
				return res.json(result);
			})
			.catch ( function (err) {
				console.log("Error in search: " + err);
				return res.render({})
			});
		}
		else {
			return res.json({error: 'Scope restricted'});
		}
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
			Logger.error(err, 'parsing error', 'remote parse')
			return res.json(err);
		});
	},


	save : function (req, res) {
		var body = req.body || {};

		var model = body.model || req.param('model');
		var data  = body.data;

		var payload= req.session.payload || {};

		console.log("Remote create " + model);
		console.log(JSON.stringify(data));

		Record.createNew(model, data, null, payload)
		.then ( function (result ) {
			return res.json(result);
		})
		.catch ( function (err) {
			Logger.error(err, 'error creating ' + model, 'remote save')
			return res.json(err);
		});
	},

	uploadData : function (req, res) {
		var body = req.body;

		var payload= req.session.payload || {};

		Record.uploadData(body, payload)
		.then ( function (result) {
			sails.config.messages.push("uploaded");
			console.log("Uploaded");
			console.log(JSON.stringify(result));
			return res.json(result);
		})
		.catch (function (err) {
			console.log("Error uploading: " + err);
			Logger.error(err, 'upload error', 'remote uploadData');
			return res.json({error: err});
			// sails.config.errors.push(err);
			// return res.render('customize/private_home');
		});
	},

// The following accessors are set up for usage as an API but actually return HTML:

	enum: function (req, res) {
		var model = req.param('model');
		var field = req.param('field');
		var render = req.param('render') || false;

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
				console.log("Enum Data: " + JSON.stringify(data));
				if (render) {
					return res.render('core/lookup', { table: table, identifier : identifier, data : data, prompt: field })
				}
				else {
					return res.json(data);
				}
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
		var label     = req.param('label');
		var table = req.param('table');
		var render = req.param('render') || false;

		var select;
		
		var Mod = sails.models[model] || {};
		
		table = table || Mod.tableName || model;

		var idField = Mod.idField || 'id';
		var nameField = Mod.nameField || 'name';
		var identifier = model;


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
		
		// table = table.toLowerCase();

		if (field && Mod.attributes[field] && Mod.attributes[field].enum) {
			var options = Mod.attributes[field].enum;
			if (render) {
				return res.render('core/lookup', { table: table, identifier : identifier, data : { label : options}, prompt: field })
			}
			else {
				return res.json(result);
			}
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

		console.log('generate ' + table + ' lookup ' + '; Render: ' + render);
		/*
		fields = fields + '::';  // extend to ensure array has at least elements..

		console.log("LABELS: " + fields);
		var extract = fields.split(':');
*/

		var query = "Select " + select + " FROM " + table + " WHERE " + condition;

		console.log("Lookup Query: " + query);

		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			
			//console.log("Lookup: " + JSON.stringify(result));
			if (render) {
				return res.render('core/lookup', { table : table, identifier : identifier, data : result, prompt: prompt, defaultTo: defaultTo });
			}
			else {
				return res.json(result);
			}
		});
	},

	validate: function (req, res) {
		var body = req.body || {};

		var barcode = body.barcode || req.param('barcode');

		var model = body.model || req.param('model');	
		var select = body.select || req.param('select') || 'id';
		var value = body.value || req.param('value') || '';
		var field = body.field || req.param('field') || 'id'; // use name to validate based on name
		var list = body.list || req.param('list') || '';
		var prefix = body.prefix || req.param('prefix');   // strip id prefix (optional)
		var reference = body.reference || req.param('reference');  // validate via attribute identifier
		var grid = body.grid;

		if (list.constructor === String) {
			list = list.split(/,\s*/);
		}

		var specs = {
			ids: list,
			grid: grid,
			field: field,
			barcode: barcode,
			attribute: reference
		};

		console.log("*** Record validation...");
		console.log(model + ': ' + JSON.stringify(specs));
		
		Record.validate(model, specs)
		.then (function (result) {
			return res.json(result);
		})
		.catch ( function (err) {
			console.log("encountered validation error");
			return res.json(err);
		});
	},

};

