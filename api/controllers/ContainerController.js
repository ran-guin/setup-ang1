/**
 * ContainerController
 *
 * @description :: Server-side logic for managing containers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var q = require('q');

module.exports = {
	
	transfer : function (req, res ) {
		console.log("CC transfer prompt");

		var target_format_id;
		var split;
		var sources = [];
		if (req.body) {
			console.log("BODY: " + JSON.stringify(req.body));
			sources = JSON.parse(req.body.Samples);
			target_format_id = req.body['Plate_Format-id'];
			split = req.body.split;
		}
		else { 
			console.log("use test data for now...")
			// TEST DATA
			var starter = 200;
			var container = 1000;

			target_format_id = 4;

			for (var i=0; i<8; i++) {

				var sources = [];
				var posn = i*12 + starter;
				sources.push( 	{ id : posn, position : 'A1', container : container },
								{ id : posn+1, position : 'A2', container : container },
								{ id : posn+2, position : 'A3', container : container },
								{ id : posn+3, position : 'B1', container : container },
								{ id : posn+4, position : 'B2', container : container },
								{ id : posn+5, position : 'B3', container : container },
								{ id : posn+6, position : 'C1', container : container },
								{ id : posn+7, position : 'C2', container : container },
								{ id : posn+8, position : 'C3', container : container },
								{ id : posn+9, position : 'D1', container : container },
								{ id : posn+10, position : 'D2', container : container },
								{ id : posn+11, position : 'D3', container : container }
				);
				container++;
			}
		}
		var target =  { Format : { id : target_format_id}, rows : ['A','B'] };

		return res.render(
			'lims/WellMap', 
			{ sources: sources, target: target, options : { split : split } }
		);
	},

	completeTransfer : function (req, res ) {
		console.log("CC completing transfer");
		
		var sources = [ { id : 1}, { id: 2} ];
		var target = {
			size : 1, 
			size: '2x3', 
			Format : { id : 5}, 
			rows: ['A','B'], 
			cols : [1],
		}; // test
		
		//		q.when( Container.transfer_samples(test_data) )
		q.when( Container.rearray_transfer(sources, target, { Prep : { id : 7 }}) )
		.then ( function (results) {
			return res.json(results);
		})
		.catch ( function (err) {
			return res.json(err);
		})

	},



};

  