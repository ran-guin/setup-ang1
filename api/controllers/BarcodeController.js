/**
 * BarcodeController
 *
 * @description :: Server-side logic for managing barcodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var _ = require('underscore-node');
var q = require('q');

var Logger = require('../services/logger');

module.exports = {
	
	scan: function (req, res) {

		var body = req.body || {};

		var barcode = body.barcode || req.param('barcode');
		var search  = body.search;

		Record.reset_messages();
		
		console.log("Scan: " + JSON.stringify(req.body));

		Barcode.custom_scan(barcode)
		.then (function (result) {
			if (result.found) {
				console.log("Rendering results for " + result.found);
				var view = 'lims/' + result.found;
				res.render(view, result);
			}
			else {
				console.log('nothing found...');
				console.log(JSON.stringify(result));
				res.render('customize/private_home', result);
			}
		})
		.catch ( function (err) {
			if (search) {
				// if explicit barcode not entered ... try db search
				Record.search({scope : scope, search : search, condition: condition})
				.then (function (result) {
					return res.json(result);
				})
				.catch ( function (err) {
					return res.json(err);
				});				
			}
			else {
				console.log("scan error");
				console.log(JSON.stringify(err));
				res.render('customize/private_home', err);
			}
		});

	},

	print_Labels : function (req, res) {
		var body = req.body || {};
		var model = body.model;
		var ids   = body.ids || body.id;
		var printer = body.printer;
		var code = body.code;

		var returnVal = body;
		console.log("Print Labels for " + JSON.stringify(body));
		
		Barcode.print_Labels(model, ids, printer)
		.then ( function (response) {
			console.log("Printed barcodes");

			returnVal.success = true;
			return res.json(returnVal);
		})
		.catch ( function (err) {
			Logger.error(err, 'Error printing barcodes');			
			return res.json(returnVal);

		});

	}


};

