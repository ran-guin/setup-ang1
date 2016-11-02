/**
 * Plate_setController
 *
 * @description :: Server-side logic for managing plate_sets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var bodyParser = require('body-parser');
var q = require('q');

var Logger = require('../services/logger');
	
module.exports = {

	'save_next_set' : function (req, res) {
		var body = req.body || {};

		var ids = body.ids || [];
		var parent = body.parent;

		Record.createNew('plate_set', { FK_Employee__ID : '<user>', Plate_Set_Defined : '<NOW>'}, { table: 'Defined_Plate_Set'})
		.then ( function (response) {
			var ps = response.insertId;
	
			var data = [];

			for (var i=0; i<ids.length; i++) {
				data.push({
					'Plate_Set_Number' : ps,
					'FK_Plate__ID'     : ids[i],
					'FKParent_Plate_Set__Number' : parent,
				});
			}

			Record.createNew('plate_set_member', data)
			.then ( function (psm) {
				var affected = psm.affectedRows;
				return res.json( { plate_set: ps, count: ids.length, added : affected });
			})
			.catch ( function (err) {
				Logger.error(err, 'problem creating plate set member', 'save_next_step');
				return res.json({ plate_set: null, error: err});
			});
		})
		.catch ( function (err) {
			console.log("Error generating defined plate set");
			Logger.error(err, 'could not generate set', 'save_next_step');
			return res.json( { plate_set: null, error: err});
		});
	}	
};  