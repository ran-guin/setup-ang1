/**
 * Record_APIController
 *
 * @description :: Server-side logic for managing record_apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');

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
			console.log("Error: " + err);
			return res.json(err);
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

	uploadData : function (req, res) {
		var body = req.body;

		var model   = body.model;
		var headers = body.headers;
		var data    = body.data;
		var reference = body.reference;

		console.log("UPLOAD DATA");
		console.log("model : " + model);
		console.log("headers: " + JSON.stringify(headers));
		console.log("data: " + JSON.stringify(data));

		Record.uploadData(model, headers, data, reference)
		.then ( function (result) {
			sails.config.messages.push("uploaded");
			console.log("Uploaded");
			return res.json(result);
		})
		.catch (function (err) {
			console.log("Error uploading: " + err);
			return res.json({error: err});
			// sails.config.errors.push(err);
			// return res.render('customize/private_home');
		});
	},

// The following accessors are set up for usage as an API but actually return HTML:

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
				console.log("Enum Data: " + JSON.stringify(data));
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
		var render = req.param('render') || false;

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
		}

		console.log('generate ' + table + ' lookup ' + '; Render: ' + render);
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
			if (render) {
				return res.render('core/lookup', { table : table, identifier : identifier, data : result, prompt: prompt, defaultTo: defaultTo });
			}
			else {
				return res.json(result);
			}
		});
	},

};

