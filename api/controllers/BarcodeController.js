/**
 * BarcodeController
 *
 * @description :: Server-side logic for managing barcodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var _ = require('underscore-node');
var q = require('q');

module.exports = {
	
	scan: function (req, res) {

		var body = req.body || {};

		var barcode = body.barcode || req.param('barcode');

		Record.reset_messages();
		
		console.log("Scan: " + JSON.stringify(req.body));

		Barcode.interpret(barcode)
		.then ( function (Scanned) {

			console.log("Scanned: " + JSON.stringify(Scanned));

			var plate_ids = [];
			var condition = '';
			var promises = [];
			var box_order;

			if ( Scanned['Plate'].length) {
				plate_ids = Scanned['Plate'];
			}
			else if ( Scanned['Rack'].length ) {
				var boxes = Scanned['Rack'].join(',');
				condition = "Box.Rack_ID IN (" + boxes + ')';
				console.log("condition: " + condition);
				box_order = Scanned['Rack'];
			}
			else if ( Scanned['Set'].length ) {
				var sets = Scanned['Set'];
				var query = "Select GROUP_CONCAT(FK_Plate__ID) as ids from Plate_Set WHERE Plate_Set_Number IN (" + sets.join(',') + ")";
				console.log('query: ' + query);
				promises.push( Record.query_promise(query) );
			}

			q.all( promises )
			.then ( function (result) {
				
				console.log("done");
			    var errors = Scanned['Errors'] || [];
			    var warnings = [];
			    var messages = [];

				if (result && result[0] && result[0].length && result[0][0].ids) {
					var ids = result[0][0].ids;
					condition = "Plate.Plate_ID IN (" + ids + ")";
				}
				else if (result && result[0] && result[0].length ) {
					errors.push("Nothing found in Set(s) " + sets);
				}

				console.log(plate_ids + ' OR ' + condition);
		
				if (plate_ids || condition) {
					console.log("Load: " + plate_ids.join(',') + ' samples from box(es) ' + boxes);

					Container.loadData(plate_ids, condition, { box_order: box_order})
					.then (function (data) {
						console.log("loaded data " + JSON.stringify(data));
						var sampleList = [];
						if (data.length == 0) {
							if (plate_ids.length) {
								warnings.push("expecting ids: " + plate_ids.join(', '));
								// return res.render('customize/private_home', { warnings : warnings} );
							}
							else if (Scanned['Rack'].length) {
								messages.push("Scanned Loc#s: " + Scanned['Rack'].join(', '));
								warnings.push("No Box Contenst Detected");
								warnings.push("(Note: Rack / Shelf types are ignored... or Boxes may be full)");
							} 
							else {
								warnings.push("nothing found (?)");
							}
							warnings.push("No useable records retrieved");
							return res.render('customize/private_home', { messages: messages, warnings: warnings });
						}	
						else {
							for (var i=0; i<data.length; i++) {
								sampleList.push(data[i].id);
							}

							if (sampleList.length < plate_ids.length) { 
								warnings.push("Scanned " + plate_ids.length + " records but only found " + sampleList.length);
							}

							var get_last_step = Protocol_step.parse_last_step(data);
							var last_step = get_last_step.last_step;
							if (get_last_step.warning) { warnings.push(get_last_step.warning) }

							messages.push('loaded Matrix Tube(s)');

							return res.render('lims/Container', { 
								plate_ids: plate_ids.join(','), 
								last_step : last_step, 
								Samples: data , 
								//sampleList : sampleList,
								messages : messages,
								warnings : warnings,
								errors : errors,
								//target_formats : target_formats 
							});
						}

					})
					.catch (function (err) {
						errors.push(err);
						return res.render('customize/private_home', {messages: messages, warnings: warnings, errors : errors });
					});			
				}
				else {
					console.log("nothing found...");
			    	warnings.push("Unrecognized barcode: " + barcode); 
			    	return res.render("customize/private_home", { errors: errors, warnings: warnings });
			    }
			})
			.catch ( function (err) {
				errors.push("Error retrieving set");
				return res.render('customize/private_home', { errors : errors } );
			})
		})
		.catch ( function (err) {
			console.log(err);
			errors.push('Error interpretting barcode: ' + barcode);
			errors.push(err);
			res.render('customize/private_home', { errors: errors } );
		});

	},

	print_Labels : function (req, res) {
		var body = req.body || {};
		var model = body.model;
		var ids   = body.ids;
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
			console.log("Error printing barcodes: " + err);
			returnVal.errors = err;
			return res.json(returnVal);

		});

	}


};

