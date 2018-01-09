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
			console.log('ran custom scan');
			if (result.found) {
				var view = 'lims/' + result.found;
				console.log("Rendering results for " + view + '=' + result.found);
				console.log(JSON.stringify(result));
				// return res.send(result);
				res.render(view, result);
			}
			else {
				console.log('nothing found...');
				console.log(JSON.stringify(result));
				// return res.send(result);
				res.render('customize/private_home', result);
			}
		})
		.catch ( function (err) {
			console.log("scan error");
			console.log(JSON.stringify(err));
			
			if (search) {
				console.log("aborted custom scan... ");
				// if explicit barcode not entered ... try db search
				Record.search({scope : scope, search : search, condition: condition})
				.then (function (result) {
					console.log('got result ' + JSON.stringify(result));
					return res.json(result);
				})
				.catch ( function (err2) {
					console.log('result err');
					return res.json(err2);
				});				
			}
			else {
				// return res.send('scanning error');
				return res.render('customize/private_home', err);
			}
		});

	},

	print_Labels : function (req, res) {
		var body = req.body || {};
		var model = body.model;
		var ids   = body.ids || body.id;
		var printer = body.printer;
		var code = body.code;

		var payload = req.session.payload || {};

		var returnVal = body;
		console.log("Print Labels for " + JSON.stringify(body));
		
		Barcode.print_Labels(model, ids, printer, payload)
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

