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

	search : function (req, res) {

		var body = req.body || {};
		console.log("Search API");

		var scope = body.scope;
		var condition = body.condition || {};
		var search    = body.search || '';

		if (! scope ) {
			// Generic Search 
			scope = { 
				'user' : ['email', 'name'],
				'container' : []
			};
		}

		Record.search({scope : scope, search : search, condition: condition})
		.then (function (result) {
			var keys = Object.keys(result);
			if (!result || !keys.length) {
				sails.warning("Nothing found");
				return res.render('customize/private_home');
			}
			else if (keys.length == 1 && result[keys[0]].length == 1) {
				console.log(JSON.stringify(result));

				// Go to single page if applicable .. 
				if (keys[0] == 'container') {
					var ids = _.pluck(list,'Plate_ID');
					
					console.log('load view...');
					Container.loadViewData(ids)
					.then (function (viewData) {
						console.log("Found container data");
						console.log(JSON.stringify(viewData));
						
						viewData.messages = [];
						viewData.warnings = [];
						viewData.errors = [];
						viewData.found = 'Container';

						// return res.send("render container");
						return res.render('lims/Container', viewData);
					})
			        .catch (function (err) {
			        	console.log("error loading plate data");
			        	// return res.send("error loading data");
						return res.render('customize/private_home');
			        });
				}
				else {
					console.log('not recognized type');
					return res.render('customize/private_home');
				}
			}
			else {
				console.log("Generate Search Results");
				console.log(JSON.stringify(result));

				return res.render('customize/private_home');
			}
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
			Logger.error(err, 'parsing error', 'remote parse')
			return res.json(err);
		});
	},


	save : function (req, res) {
		var body = req.body || {};

		var model = body.model || req.param('model');
		var data  = body.data;

		console.log("Remote create " + model);
		console.log(JSON.stringify(data));

		Record.createNew(model, data)
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

		Record.uploadData(body)
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
		var label     = req.param('labal');
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

