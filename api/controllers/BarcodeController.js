/**
 * BarcodeController
 *
 * @description :: Server-side logic for managing barcodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');

module.exports = {
	
	scan: function (req, res) {

		var barcode = req.body.barcode;
		var Scanned = Barcode.parse(barcode);

		if (Scanned['Plate']) {

			var ids = Scanned['Plate'];

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

				var sampleList = [];
				if (data.length == 0) {
					errorMsg = "expecting ids: " + ids.join(', ') + "<P>... but No Containers Found (?)";
				}	
				else {
					for (var i=0; i<data.length; i++) {
						sampleList.push(data[i].id);
					}
				}	
				return res.render('lims/Container', { 
					ids: ids.join(','), 
					protocols : Protocols, 
					samples: data , 
					sampleList : sampleList,
					errorMsg : errorMsg,
					target_formats : target_formats 
				} );
			})
			.catch ( function (err) {
				return res.send("Error: " + err);
			});
	    }

	},


};

