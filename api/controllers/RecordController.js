/**
 * RecordController
 *
 * @description :: Server-side logic for managing Generic records
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// get custom attributes from models to ensure specifications remain centralized

	// eg model access control, field descriptions .... anything not handled intrisically by the existing model 


	new: function (req, res) { 

		var model = req.param('model');

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
				res.render('record/form', { table: table, fields: Fields, access: access, action: 'Add'});
			}
		);
	},

	add: function (req, res) {
		
		var table = req.param('table');
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

		console.log('generate ' + table + ' lookup');
		console.log("using: " + fields);

		var extract = fields.split(':');

		if (extract.length == 1) { extract[1] = extract[0] }

		var select = extract[0] + ' as id, ' + extract[1] + ' as label';
		console.log("Select: " + select);
		Record.query("Select " + select + " from " + table, function (err, result) {
			if (err) {
				return res.negotiate(err);
			}
			console.log("Lookup: " + JSON.stringify(result));
			//return res.send(result);
			return res.render('core/lookup', { table : table, data : result });
		});
	}
	
};

