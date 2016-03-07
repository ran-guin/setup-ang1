/**
 * ContainerController
 *
 * @description :: Server-side logic for managing containers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');

module.exports = {
	
	transfer : function (req, res ) {
		console.log("transferring samples");
		req.body = { size : 1, target_size: '3x6', target_format : 5, prep_id : 7, target_rows: ['A','B','C','D'], target_cols : [1,2,3,4,5,6] }; // test
		
		var id = req.body.id || '';
		var ids = id.split(/\s*,\s*/);

		var size = req.body.size || Container.get_size(ids);
		var target_size   = req.body.target_size || 1;
		var target_format = req.body.target_format;
		var prep_id = req.body.prep_id;
		var target_cols = req.body.target_cols;
		var target_rows = req.body.target_rows;
		// TEST 
		ids = [];
		for (var i=1; i<=300; i++) {
			ids.push(i )+ 300;
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
			var params = { id: ids, target_format_id: target_format, prep_id : prep_id, target_size: target_size, target_cols : target_cols, target_rows : target_rows}; // TEST
			// Track transfer as rearray (track individual well movement)

			console.log('test rearray transfer');
			Container.rearray_transfer( params )
			.then ( function (data) {
//				Barcode.generate(barcodes);
				var map = data.map;
				var rows = data.rows;
				var cols = data.cols;
				var targets = data.targets;

				console.log("rows: " + JSON.stringify(rows));
				return res.render('lims/WellMap', { Map : map, rows: rows, cols: cols, targets : targets}); 
			})
			.catch ( function (err) {
				return res.send('Rearray Error');
			});		
		}
	}
};

  