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
	
	history : function (req, res) {
		var ids = req.param('ids');
		var element = req.param('element') || 'injectedHistory';  // match default in CommonController

		var fields = ['Count(DISTINCT Plate_ID) as Samples', 'Prep_Name as Step', 'Prep_DateTime as Completed', 'Employee_Name as Completed_By'];
		fields.push("CASE WHEN Attribute_ID IS NULL THEN '' ELSE GROUP_CONCAT( DISTINCT CONCAT(Attribute_Name,'=',Attribute_Value) SEPARATOR ';<BR>') END as attributes");
		fields.push('Prep_Comments as Comments');

		var query = "SELECT " + fields.join(',') + " FROM Plate, Plate_Prep, Prep";

		query = query + " LEFT JOIN Prep_Attribute ON Prep.Prep_ID=Prep_Attribute.FK_Prep__ID";
		query = query + " LEFT JOIN Employee ON Prep.FK_Employee__ID=Employee_ID";
		query = query + " LEFT JOIN Attribute ON Prep_Attribute.FK_Attribute__ID=Attribute_ID";
		
		query = query + " WHERE FK_Plate__ID=Plate_ID AND Plate_Prep.FK_Prep__ID=Prep_ID AND Plate_ID IN (" + ids + ')';

		query = query + " GROUP BY Prep_ID DESC";

		console.log("Q: " + query);
		Record.query_promise(query)
		.then ( function (result) {
			console.log("got data: " + JSON.stringify(result));

			return res.render('customize/injectedData', { fields : fields, data : result, title: 'Sample History', element: element});
		})
		.catch ( function (err) {
			return res.json("error injecting data");
		})

	}, 

	summary : function (req, res) { 
		var ids = req.param('ids');
		var element = req.param('element') || 'injectedData';   // match default in CommonController

		var flds = ['id', 'Parent', 'box_id', 'box_size', 'position', 'container_format', 'sample_type', 'qty', 'qty_units', 'attributes'];

		Container.loadData(ids)
		.then (function (result) {
			return res.render('customize/injectedData', { fields : flds, data : result, title: 'Sample Info', element: element});		
		})
		.catch ( function (err) {
			return res.json("error injecting Sample Info");
		});
	},

	transfer : function (req, res ) {
		console.log("CC transfer prompt");

		var Samples = {};
		var Target = {};
		var Options = {};

		var split;
		var sources = [];

		console.log("BODY" + JSON.stringify(req.body));

		if (req.body) {
			var samples = req.body['Samples'];
			var target  = req.body['Target'] || "{}";
			var options = req.body['Options'] || "{}";

			Sources = JSON.parse(samples);
			Target  = target;
			Options = JSON.parse(options);

			var ids = [];
			for (var i=0; i<Sources.length; i++) {
				ids.push(Sources[i].id);
			}

			console.log("BODY: " + JSON.stringify(req.body));
			Sources = JSON.parse(req.body.Samples);
			var target_size = req.body['Capacity-label'] || 1;

			var sizes = Object.keys(Rack.wells);
				
			console.log("target_size: " + target_size);
			return res.render(
					'lims/WellMap', 
					{ Samples: Sources, plate_ids: ids, options : { split : split }, target_size: target_size, sizes: sizes, wells: Rack.wells }
			);
		}
		else {
			return res.json('invalid input');
		}


	},

	uploadMatrix : function (req, res) {

		var MatrixAttribute_ID = 66;

		// Expects 8 rows of 12 columns (A1..H12) //
	    res.setTimeout(0);

	    var ids = req.body.ids || req.body.plate_ids;
	    var Samples = JSON.parse(req.body.Samples);
	    var force = req.body.force || 1;

	    console.log("IDS: " + JSON.stringify(ids));

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
				console.log("Parsing contents...");
				var f = 0; // file index

				var matrix = uploadedFiles[f].fd
				var obj = xlsx.parse(matrix);

				console.log(JSON.stringify(obj));

				var f = 0;
				var rows = obj[f].data.length;
				var cols = obj[f].data[f].length;

				columns = ['A','B','C','D','E','F','G','H'];

				var map = {};
				var applied = 0;
				for (var i=1; i<=rows; i++) {
					for (var j=0; j<cols; j++) {
					
						var posn =  columns[j];
						//if (i<10) { posn = posn + '0' }
						posn = posn + i.toString();

						map[posn] = obj[f].data[i-1][j];
						applied = applied + 1;
					}

				}

				var data = [];
				var errors = [];
				var warnings = [];

				if (rows > Samples.length) {
					warnings.push(applied + " Matrix tubes scanned, but only " + Samples.length + " current Samples found");
				}
				else if (Samples.length > rows) {
					warnings.push(Samples.length + " active Samples, but data supplied for " + applied);
				}

				console.log(Samples.length + ' Sample found');

				for (var i=0; i<Samples.length; i++) {
					console.log("Sample #" + i + ": " + JSON.stringify(Samples[i]));
					var id = Samples[i].id;
					var position = Samples[i].position;
					if (position) {
						var mapped = map[position] || map[position.toUpperCase()];
						if (mapped) {
							data.push([id, mapped]);
						}
						else {
							warnings.push("Nothing mapped to " + position);
						}
					}
					else {
						warnings.push("No position for sample #" + i + ' : ' + id);
					}					
				}

				sails.config.warnings = warnings;
				sails.config.errors = errors;

				if (errors.length || (! force && warnings.length)) {
					console.log("Errors: " + JSON.stringify(errors));
					return res.render('lims/Container', { 
						plate_ids: ids, 
						Samples: Samples, 
					} );
				}
				else {
					console.log("Map: " + JSON.stringify(map));
					console.log("Data: " + JSON.stringify(data));

					var plate_ids = req.body.plate_ids;
					var attribute = MatrixAttribute_ID;

					Attribute.uploadAttributes('Plate', attribute, data)
					.then ( function (resp) {

						if (resp.affectedRows) {
							sails.config.messages.push(resp.affectedRows + " Matrix barcodes associated with samples");
						}
						
						return res.render('lims/Container', { Samples : Samples, plate_ids: ids});					
					})	
					.catch ( function (err) {
						return res.json({error : err, attribute: attribute, data: data});
					});
				}		
				
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

  