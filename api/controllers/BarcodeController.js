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
		
		var format = '';

		var q = "SELECT * FROM Lab_Protocol";

	    console.log("QUERY: " + q + ':' + barcode);

	    Record.query(q, function (err, result) {
	    	if (err) {

	    	    console.log("ASYNC Error in q post request: " + err);
	            console.log("Q: " + q);
	 //           res.status(500).send("Error generating Request Page");

				return res.negotiate(err);
     		}

		if (!result) {
				console.log('no results');
				return res.send('');
		}

		var List = [];

		console.log("Found " + result.length + " active Protocols");

		for (var i=0; i<result.length; i++) {
				var name = result[i]['Lab_Protocol_Name'];
				var id   = result[i]['Lab_Protocol_ID'];
				
				//console.log('include ' + name);
				List.push({id : id, name: name});
		}


		// test data only 
		var Samples = [];
		sampleList = [];
		var offset = 0;
		var ids = [];
		var rows = ['A','B','C','D','E','F','G','H'];
		for (row = 0; row < rows.length; row++) {
			for (var i = 0; i< 12; i++) {
				var sample = { id : 300 + i + offset, container_format : 'Epindorf', position : rows[row] + i.toString(), sample_type : 'Blood'}
				Samples.push(sample);
				sampleList.push(300+i+offset);

				ids.push(300+i+offset);
			}
			offset = offset + 12;
		}
		// end of test data... 

		var target_formats = [
			{ id : 1, format : '96-well Beckman Coulter'}, 
			{ id : 2, format : 'Data Matrix Tube'}, 
			{ id : 3, format : 'Epindorf Tube'}
		];

		return res.render('lims/Container', { ids: ids.join(','), protocols : List, samples: Samples , target_formats : target_formats } );
		// return res.send();

	    });

	}
};

