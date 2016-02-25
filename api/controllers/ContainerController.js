/**
 * ContainerController
 *
 * @description :: Server-side logic for managing containers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');

module.exports = {
	
	transfer : function (req, res ) {
		req.body = { size : 1, target_size: '3x6', target_format : 5, prep_id : 7}; // test
		
		var id = req.body.id || '';
		var ids = id.split(/\s*,\s*/);

		var size = req.body.size || Container.get_size(ids);
		var target_size   = req.body.target_size || 1;
		var target_format = req.body.target_format;
		var prep_id = req.body.prep_id;

		ids = [];
		for (var i=3; i<=303; i++) {
			ids.push(i);
		} // test

		if (size == target_size) {
			// Standard direct transfer 
			Container.standard_transfer( ids, target_format )
			.then ( function (barcodes) {
				Barcode.generate(barcodes);
				return res.send('Transfer Success'); 
			})
			.catch ( function (err) {
				return res.send('Transfer Error');
			});
		}
		else {
			var params = { id: ids, target_format_id: target_format, prep_id : prep_id, target_size: target_size}; // TEST
			// Track transfer as rearray (track individual well movement)
			Container.rearray_transfer( params )
			.then ( function (barcodes) {
//				Barcode.generate(barcodes);
				return res.send('Rearray Success: ' + JSON.stringify(barcodes)); 
			})
			.catch ( function (err) {
				return res.send('Rearray Error');
			});		
		}
	}
};

 