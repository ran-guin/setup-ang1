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
		console.log("CC transfer prompt");

		var Samples = {};
		var Target = {};
		var Options = {};

		var target_format_id;
		var split;
		var sources = [];
		if (req.body) {
			var samples = req.body['Samples'];
			var target  = req.body['Target'] || "{}";
			var options = req.body['Options'] || "{}";

			Sources = JSON.parse(samples);
			Target  = target;
			Options = JSON.parse(options);

			console.log("BODY: " + JSON.stringify(req.body));
			Sources = JSON.parse(req.body.Samples);
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
			Sources = sources;
			Target = { Format : { id : target_format_id }, rows : ['A','B'] }
		}

		return res.render(
			'lims/WellMap', 
			{ sources: Sources, target: Target, options : { split : split } }
		);
	},

	uploadMatrix : function (req, res) {
		// Expects 8 rows of 12 columns (A1..H12) //
	    res.setTimeout(0);

	    console.log("BODY: ");
	    console.log(JSON.stringify(req.body));

	    req.file('MatrixFile')
	    .upload({
	    	maxBytes: 100000
	    }, function (err, uploadedFiles) {
			if (err) return res.serverError(err);
			else if (uploadedFiles.length == 0) {
				return res.json("Error: No File Uploaded");
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
		console.log("CC completing transfer");
		
		var Sources = req.body['Sources'];
		var targets = req.body['Targets'];
		var Set     = req.body['Set'] || {};
		var Options = req.body['Options'] || {};

/*
		Sources = [ { id : 1}, { id: 2} ];
		Targets = {
			size : 1, 
			size: '2x3', 
			Format : { id : 5}, 
			rows: ['A','B'], 
			cols : [1],
		};
*/

		q.when( Container.execute_transfer(Sources, Targets, { Prep : { id : 7 }}) )
		.then ( function (results) {
			return res.json(results);
		})
		.catch ( function (err) {
			return res.json(err);
		})

	},



};

  