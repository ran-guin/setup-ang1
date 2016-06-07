/**
 * AttributeController
 *
 * @description :: Server-side logic for managing attributes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');
var bodyParser = require('body-parser');

module.exports = {
	increment : function (req, res ) {
		var table = req.body.table;
		var ids = req.body.targets || req.body.ids;
		var attributes = req.body.attributes;

		Attribute.increment(table, ids, attributes)
		.then (function (result) {
			console.log( table + ids + ' attributes: ' + attributes);
			console.log(JSON.stringify(result));
		})
		.catch (function (error) {
			console.log(':-(');
		});
		return res.send('increment completed');
	},

	prompt: function (req, res) {
		var model = req.param('model');
		var attribute = req.param('attribute');
			
		console.log('generate ' + model + ': ' + attribute + ' prompt');

		// Legacy
		var fields = "Attribute_Class as model, Attribute_Name as attribute, Attribute_Type as type, Attribute_Format as format, 3 as defaultsTo";
		var query = "SELECT " + fields + " FROM Attribute WHERE Attribute_Class = '" + model + "' AND Attribute_Name = '" + attribute + "'";
		console.log("Select: " + query);
		Record.query(query, function (err, result) {
			if (err) {
				return res.send("ERROR: " + err);
			}
			console.log("Attribute Prompt: " + JSON.stringify(result[0]));
			//return res.send(result);
			return res.render('core/attributePrompt', result[0] );
		});
	},

	uploadAttributes : function (req, res) {


		req.file('uploadFile')
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

				for (var i=0; i<obj.length; i++) {
					var rows = obj[i].data.length;
					var cols = obj[i].data[0].length;

					var fields = obj[i].data[0];
					console.log("Field: " + fields.join(', '));

					var records = [];
					for (j=1; j<rows; j++) {
						var record = [];
						for (k=0; k<cols; k++) {
							var cell = obj[i].data[j][k];
							console.log(i + ': [' + j + ',' + k + '] = ' + cell );
							record.push(cell);
						}
						records.push(record);
					}
				}

				console.log("Data: " + JSON.stringify(records));
			}
		}
	}
};

