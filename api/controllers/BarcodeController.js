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
				
				console.log('include ' + name);
				List.push({id : id, name: name});
		}

		return res.render('lims/Lab_protocols', { protocols : List} );
		// return res.send();

	    });

	}
};

