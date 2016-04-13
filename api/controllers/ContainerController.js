/**
 * ContainerController
 *
 * @description :: Server-side logic for managing containers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//var bodyParser = require('body-parser');
var q = require('q');

//var XLSX = require('xlsx');
//var express = require('express');
//var app = express();
//app.use(require('skipper')());

var xlsx = require('node-xlsx');

module.exports = {
	
	transfer : function (req, res ) {
		console.log("transfer prompt");

		// TEST DATA
		var starter = 200;
		var container = 1000;
		var target_format = 4;

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

		Record.grab('Plate_Format', "Plate_Format_ID=" + target_format)
		.then (function (target) {
			console.log("retrived target info: " + JSON.stringify(target));
			return res.render(
				'lims/WellMap', 
				{ sources: sources, target: target, options : { split: 1 }}
			);
		})
		.catch (function (err) {
			console.log("ERROR retrieving target Plate_Format");
			return res.send("Error: " + err);
		});
	},

	uploadDataMatrix : function (req, res) {
		// Expects 8 rows of 12 columns (A1..H12) //
	    res.setTimeout(0);

	    req.file('dataMatrix')
	    .upload({
	    	maxBytes: 100000
	    }, function (err, uploadedFiles) {
			if (err) return res.serverError(err);
			else if (uploadedFiles.length == 0) {
				return res.json("No File Uploaded");
			}
			else {
				// assume only one file for now, but may easily enable multiple files if required... 

				var f = 0; // file index

				var matrix = uploadedFiles[f].fd
				var obj = xlsx.parse(matrix);

				var f = 0;
				var rows = obj[f].data.length;
				var cols = obj[f].data[f].length;

				columns = ['A','B','C','D','E','F','G','H'];

				var map = {};
				for (var i=1; i<=rows; i++) {
					for (var j=0; j<cols; j++) {
					
						var posn =  columns[j];
						//if (i<10) { posn = posn + '0' }
						posn = posn + i.toString();

						map[posn] = obj[f].data[i-1][j];
					}

				}

					return res.json({
				    files: uploadedFiles,
				    textParams: req.allParams(),
				    map: map,
				    //workbook: workbook,
				});
	     	}
	    });
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
		
		var Targets = req.body.Targets || [];   // array of targets (hashes)
		var Sources = req.body.Sources || [];   // array of sources (hashes)
		var Set     = req.body.Set || {};       // optional specs: format, sample_type

		console.log("BODY: " + JSON.stringify(req.body));

		var id = req.body.id || '';
		var ids = id.split(/\s*,\s*/);

		var size = req.body.size || '1-well'; // || Container.get_size(ids);
		var target_size   = req.body.target_size || 1;
		var target_format = req.body.target_format;
		var prep_id = req.body.prep_id;
		var target_cols = req.body.target_cols;
		var target_rows = req.body.target_rows;

		for (var i=0; i<Sources.length; i++) {
		var input = ['volume', 'volume_units'];

		var optional_input = Object.keys(Set);

		// resetData is comprised of a potential combination of standard field resets:
		var resetData = {'Plate_ID' : '<NULL>', 'FK_Rack__ID' : '<NULL>'};
		// ... and item specific resets (keyed on id) as set below
		// eg resetData = { 15: { parent_id = 7 }, 'Plate_ID' : '<NULL>'}

		for (var j=0; j<optional_input.length; j++) {
			var opt = optional_input[j];
			var fld = Container.alias(opt) || opt;
			if (Set[opt]) { resetData[fld] = Set[opt] };
			console.log("optionally set " + opt + " to " + Set[opt]);
		}

		console.log(Targets.length + " target samples to be created...");
		var clone_ids = [];
		for (var i=0; i<Targets.length; i++) {
			var thisId = Sources[i].id;
			clone_ids.push(thisId);

			resetData[thisId] = { 'FKParent_Plate__ID' : Sources[i].id };

			for (j=0; j<input.length; j++) {
				var fld = Container.alias(input[j]) || input[j];
				var val = Targets[i][input[j]] || Set[input[j]] || null;
				resetData[thisId][fld] = val;
			}
			console.log("Clone sample: id=" + Sources[0].id + "; reset: " + JSON.stringify(resetData));
		}

		Record.clone('Plate', clone_ids, resetData, { id: 'Plate_ID' })
		.then ( function (cloneData) {
			console.log("Created new record(s): " + JSON.stringify(cloneData));
			return res.send('okay1');
			//return res.render('lims/WellMap', { sources: Sources, Targets: Targets, target: { wells: 96, max_row: 'A', max_col: 12 }, options : { split: 1 }});
		})
		.catch ( function (cloneError) {
			console.log("Cloning Error: " + cloneError);
			return res.send('error2');
			//return res.render('lims/WellMap', { sources: Sources, errorMsg: "cloning Error"});
		});


		//if (1) { return res.render('lims/WellMap', { sources: Sources, Targets: Targets, target: { wells: 96, max_row: 'A', max_col: 12 }, options : { split: 1 }}) }

			/*
			var params = { id: sources, target_format_id: target_format, prep_id : prep_id, target_size: target_size, target_cols : target_cols, target_rows : target_rows}; // TEST
			// Track transfer as rearray (track individual well movement)

			console.log('test rearray transfer');
			Container.rearray_transfer( params )
			.then ( function (data) {
				Barcode.generate(barcodes);
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

  