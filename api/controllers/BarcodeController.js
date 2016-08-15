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

		console.log("Scan: " + JSON.stringify(req.body));

		Barcode.interpret(barcode)
		.then ( function (Scanned) {

			console.log("Scanned: " + JSON.stringify(Scanned));

			var plate_ids = [];
			var condition = '';
			var promises = [];

			if ( Scanned['Plate'].length) {
				plate_ids = Scanned['Plate'];
			}
			else if ( Scanned['Rack'].length ) {
				var boxes = Scanned['Rack'].join(',');
				condition = "Box.Rack_ID IN (" + boxes + ')';
				console.log("condition: " + condition);
			}
			else if ( Scanned['Set'].length ) {
				var sets = Scanned['Set'];
				promises.push( Record.query_promise("Select GROUP_CONCAT(FK_Plate__ID) as ids from Plate_Set WHERE Plate_Set_Number IN (" + sets.join(',') + ")") );
			}

			q.all( promises )
			.then ( function (result) {
				
			    var errors = Scanned['Errors'] || [];
			    var warnings = [];

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

					Container.loadData(plate_ids, condition)
					.then (function (data) {

						var sampleList = [];
						if (data.length == 0) {
							if (plate_ids.length) {
								errors.push("expecting ids: " + plate_ids.join(', '));
								return res.render('customize/private_home');
							}
							else if (Scanned['Rack'].length) {
								sails.config.messages.push("Scanned Loc#s: " + Scanned['Rack'].join(', '));
								sails.config.warnings.push("Use alDente for handling Racks other than boxes (eg Inventory, Storage Tracking)");
								sails.config.warnings.push("LITMUS is for sample processing and only reads Boxes containing samples.");
							} 
							sails.config.warnings.push("No useable records retrieved");
							return res.render('customize/private_home');
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

							return res.render('lims/Container', { 
								plate_ids: plate_ids.join(','), 
								last_step : last_step, 
								Samples: data , 
								//sampleList : sampleList,
								message : 'loaded Matrix Tube(s)',
								warnings : warnings,
								errors : errors,
								//target_formats : target_formats 
							});
						}

					})
					.catch (function (err) {
						errors.push(err);
						return res.render('customize/private_home', {errors : errors });
					});			
				}
				else {
			    	errors.push("Unrecognized barcode: " + barcode); 
			    	return res.render("customize/private_home", { errors: errors });
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
		var body = req.body;

		console.log("Print Labels for " + JSON.stringify(body));
		return res.json(body);
	}


};

