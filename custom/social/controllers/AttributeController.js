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

		var body = req.body;

		var skip = body['skip'] || 0;
		var page = body['page'] || 1;

		var options = req.body['options'];

		var file = req.file('uploadFile');

		if (file) {
			console.log("Uploaded file");
		}
		else { console.log("No file supplied ") }

		// querying for headers only 
		Upload.uploadFile(file, options)
		.then ( function (results) {
			console.log("Updated custom");
			return res.render('customize/upload_file', { data : results });
		})
		.catch ( function (err) {
			console.log("Error uploading attributes: " + err);
			return res.render('customize/private_home', { errorMsg: err });
		});


	}
}