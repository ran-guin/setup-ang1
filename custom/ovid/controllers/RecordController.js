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

		var table = req.param('table');
		console.log('new ' + table + ' form...');

		Record.query("desc " + table, function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no record results');
				return res.send('');
			}

//			console.log(JSON.stringify(sails.models[table]));

			if ( sails.models[table] && sails.models[table]['attributes']['role'] && sails.models[table]['attributes']['role']['xdesc']) {
				console.log('load extra info...' + sails.models[table]['attributes']['role']['xdesc'])
			}

			var recordModel;
			if (sails.models[table]) {
				console.log(table + ' Access: ' + sails.models[table]['access']);
				console.log("MODEL: " + sails.models[table]);
				recordModel = sails.models[table];
			}

			var access = '';   // store access permissions in database ? ... or in model ... 
			res.render('record/new', { table: table, recordModel: recordModel, fields: result, access: access, action: 'Add'});
		});
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
	},
	
	update: function (req, res) {
		console.log("Update...");
	},

	lookup: function (req, res) {
		var table = req.param('table');
		console.log('generate ' + table + ' lookup');

		var fields = "id, name as label";
		Record.query("Select " + fields + " from " + table, function (err, result) {
			if (err) {
				return res.negotiate(err);
			}
			console.log("Lookup: " + JSON.stringify(result));
			return res.send(result);
		});
	}
	
};

