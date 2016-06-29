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

		var model = req.body.model;
		var barcode = req.body.barcode;

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
				var sets = Scanned['Set'].join(',');
				promises.push( Record_query("Select GROUP_CONCAT(Plate__ID) as ids from Plate_Set WHERE Plate_Set_Number IN (" + sets.join(',') + ")") );
			}

			q.all( promises )
			.then ( function (result) {
				if (result && result.length) {
					var ids = result[0].id;
					condition = "Plate.Plate_ID IN (" + ids + ")";
				}

				console.log(plate_ids + ' OR ' + condition);
		
				if (plate_ids || condition) {
					console.log("Load: " + plate_ids.join(',') + ' samples from box(es) ' + boxes);

					Container.loadData(plate_ids, condition)
					.then (function (data) {

						var errorMsg;
						var warningMsg;

						var sampleList = [];
						if (data.length == 0) {
							if (plate_ids.length) {
								errorMsg = "expecting ids: " + plate_ids.join(', ');
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
				return res.render('customize/private_home', { errorMsg : "Error retrieving set"} );
			})
		})
		.catch ( function (err) {
			console.log(err);
			res.render('customize/private_home', { errors: ['Error interpretting barcode: ' + barcode + " : " + err] } );
		});

	},


};

