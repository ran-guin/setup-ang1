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
		console.log("transfer prompt");

		// TEST DATA
		var starter = 200;
		var container = 1000;

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
			
		if (1) { return res.render('lims/WellMap', { sources: sources, target: { wells: 96, max_row: 'A', max_col: 12 }, options : { split: 1 }}) }
	},

	completeTransfer : function (req, res ) {
		console.log("completing transfer");
		
		// Input: 
		//
		// Sources: array of hashes [ { id, ...}. { id: } ...] - may contain other sample attributes
		// Target:  array of hashes: [{ source_index, source_id, source_position, target_index, target_position, volume, units, colour_code ?)},..]
		// Options: hash : { prep: { prepdata }, user, timestamp, extraction_type, target_format, location }    
		//
		// Output:
		//
		// Generates records for N x sample transfer:
		//
		// [Optional] Prep record (+ Plate_Prep reccords x N)
		// New Plate records x N
		//  + New MUL Plate records if applicable
		//
		// Updates Source Plate volumes
		// 
		// Returns: create data hash for new Plates.... (need to be able to reset samples attribute within Protocol controller (angular)


		// req.body = { size : 1, target_size: '3x6', target_format : 5, prep_id : 7, target_rows: ['A','B','C','D'], target_cols : [1,2,3,4,5,6] }; // test
		
		var Targets = req.body.Targets || [];
		var Sources = req.body.Sources || [];
		var Set     = req.body.Set || {};

		console.log("BODY: " + JSON.stringify(req.body));

		var id = req.body.id || '';
		var ids = id.split(/\s*,\s*/);

		var size = req.body.size || '1-well'; // || Container.get_size(ids);
		var target_size   = req.body.target_size || 1;
		var target_format = req.body.target_format;
		var prep_id = req.body.prep_id;
		var target_cols = req.body.target_cols;
		var target_rows = req.body.target_rows;

//		for (var i-=0; i<Targets.length; i++) {
		var reset = { 'volume' : 'Current_Volume', 'volume_units' : 'Current_Volume_Units', 'sample_type' : 'FK_Plate_Format__ID'};

		console.log(Targets.length + " target samples to be created...");
		for (var i=0; i<Targets.length; i++) {
			var resetData = { 'FKParent_Plate__ID' : Sources[i].id};
			var keys = Object.keys(reset);
			for (j=0; j<keys.length; j++) {
				var val = Targets[i][keys[j]] || Set[keys[j]] || null;
				resetData[reset[keys[j]]] = val;
				console.log(keys[j] + " :  try resetting " + reset[keys[j]] + ' to ' + val);
			}
			console.log("Clone sample: id=" + Sources[0].id + "; reset: " + JSON.stringify(resetData));

			Record.clone('Plate', Sources[i].id, resetData)
			.then( function (cloneData) {
				Record.create('Plate', cloneData)
				.then( function (ids) {

				});
			});
		}

		if (size == target_size) {
			// Standard direct transfer 
			Container.standard_transfer( Sources, target_format )
			.then ( function (barcodes) {
				Barcode.generate(barcodes);
				return res.send('Transfer Success'); 
			})
			.catch ( function (err) {
				return res.send('Transfer Error');
			});
		}
		else {
			if (1) { return res.render('lims/WellMap', { sources: Sources, Targets: Targets, target: { wells: 96, max_row: 'A', max_col: 12 }, options : { split: 1 }}) }

			/*
			var params = { id: sources, target_format_id: target_format, prep_id : prep_id, target_size: target_size, target_cols : target_cols, target_rows : target_rows}; // TEST
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
				return res.render('lims/WellMap', { sources: sources, Map : map, rows: rows, cols: cols, targets : targets}); 
			})
			.catch ( function (err) {
				return res.send('Rearray Error');
			});
			*/		
		}
	},

};

  