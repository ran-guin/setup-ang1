/**
 * BarcodeController
 *
 * @description :: Server-side logic for managing barcodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var _ = require('underscore-node');

module.exports = {
	
	scan: function (req, res) {

		var model = req.body.model;
		var barcode = req.body.barcode;

		console.log("Scan: " + JSON.stringify(req.body));

		Barcode.interpret(barcode)
		.then ( function (Scanned) {

			console.log("Scanned: " + JSON.stringify(Scanned));

			var plate_ids = [];
			var box_condition = '';
			if ( Scanned['Plate'].length) {
				plate_ids = Scanned['Plate'];
			}
			else if ( Scanned['Rack'].length ) {
			console.log("D");
				var boxes = Scanned['Rack'].join(',');
			console.log("C");
				box_condition = "Box.Rack_ID IN (" + boxes + ')';
			console.log("B");
				console.log("condition: " + box_condition);
			}

			console.log(plate_ids + ' OR ' + box_condition);
	
			if (plate_ids || box_condition) {
				console.log("Load: " + plate_ids.join(',') + ' samples from box(es) ' + boxes);

				Container.loadData(plate_ids, box_condition)
				.then (function (data) {

					var errorMsg;
					var warningMsg;

					var sampleList = [];
					if (data.length == 0) {
						if (Scanned['Rack'].length) {
							
						}
						else {
							if (plate_ids.length) {
								errorMsg = "expecting ids: " + plate_ids.join(', ');
								return res.render('customize/private_home');
							}
							else if (Scanned['Rack'].length) {
								sails.config.messages.push("Scanned Loc#s: " + Scanned['Rack'].join(', '));
								sails.config.warnings.push("Use alDente for handling Rack Locations.  LITMUS only reads Boxes containing samples.");
							} 
							return res.render('customize/private_home');
						}
					}	
					else {
						for (var i=0; i<data.length; i++) {
							sampleList.push(data[i].id);
						}

						if (sampleList.length < plate_ids.length) { 
							warningMsg = "Scanned " + plate_ids.length + " records but only found " + sampleList.length;
						}

						var get_last_step = Protocol_step.parse_last_step(data);
						var last_step = get_last_step.last_step;
						if (get_last_step.warning) { warningMsg = get_last_step.warning }

						return res.render('lims/Container', { 
							plate_ids: plate_ids.join(','), 
							last_step : last_step, 
							Samples: data , 
							//sampleList : sampleList,
							message : 'loaded Matrix Tube(s)',
							warningMsg: warningMsg,
							errorMsg : errorMsg,
							//target_formats : target_formats 
						});
					}

				})
				.catch (function (err) {
					return res.render('customize/private_home', {errorMsg: JSON.stringify(err) });
				});			
			}
			else {
		    	var errors = Scanned['Errors'];
		    	errors.push("Unrecognized barcode: " + barcode); 
		    	return res.render("customize/private_home", { errors: errors });
		    }
		})
		.catch ( function (err) {
			res.render('customize/private_home', { errors: ['Error interpretting barcode: ' + barcode]} );
		});

	},


};

