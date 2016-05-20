/**
 * BarcodeController
 *
 * @description :: Server-side logic for managing barcodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');

module.exports = {
	
	scan: function (req, res) {

		var model = req.body.model;
		//var alt_param = model.toLowerCase + '_ids';
		var ids = [];

		var barcode = req.body.barcode;

		console.log("Scan: " + JSON.stringify(req.body));

		Barcode.interpret(barcode)
		.then ( function (Scanned) {
			if (Scanned['Plate'].length) {
				var ids = Scanned['Plate'];
				Container.loadData(ids)
				.then (function (data) {

					var errorMsg;
					var warningMsg;

					var sampleList = [];
					if (data.length == 0) {
						errorMsg = "expecting ids: " + ids.join(', ') + "<P>... but No Containers Found (?)";
					}	
					else {
						for (var i=0; i<data.length; i++) {
							sampleList.push(data[i].id);
						}
					}	

					if (sampleList.length < ids.length) { 
						warningMsg = "Scanned " + ids.length + " records but only found " + sampleList.length;
					}

					return res.render('lims/Container', { 
						plate_ids: ids.join(','), 
						//protocols : Protocols, 
						Samples: data , 
						//sampleList : sampleList,
						message : 'loaded Matrix Tube(s)',
						warningMsg: warningMsg,
						errorMsg : errorMsg,
						//target_formats : target_formats 
					});
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

