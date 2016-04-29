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
		var ids;

		var barcode = req.body.barcode;

		console.log("Scan: " + JSON.stringify(req.body));

		var Scanned = {};
		if (barcode) { 
			Scanned = Barcode.parse(barcode);
			if (Scanned['Plate'] && Scanned['Plate'].length > 0) {
				model = 'Plate';
				ids = Scanned['Plate'];
			}
		}

		if (model == 'Plate') {
			if (! ids && req.body['ids'] || req.body['plate_ids']) { 
				var id_list = req.body['ids'] || req.body['plate_ids'];
				ids = id_list.split(/\s*,\s*/);
			}

			console.log("IDS: " + JSON.stringify(ids));
			var Protocols = Lab_protocol.list({ 'Plate' : ids} );

			// test data only... //
			var target_formats = [
				{ id : 1, format : '96-well Beckman Coulter'}, 
				{ id : 2, format : 'Data Matrix Tube'}, 
				{ id : 3, format : 'Epindorf Tube'}
			];

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

				console.log('render....');
				return res.render('lims/Container', { 
					plate_ids: sampleList.join(','), 
					//protocols : Protocols, 
					Samples: data , 
					//sampleList : sampleList,
					warningMsg: warningMsg,
					errorMsg : errorMsg,
					//target_formats : target_formats 
				} );
			})
			.catch ( function (err) {
				return res.send("Error: " + err);
			});
	    }
	    else { 
	    	return res.send("Error: Unrecognized barcode");
	    }

	},


};

