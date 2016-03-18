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
			console.log("OKAY EEEE");
		})
		.catch (function (error) {
			console.log(':-(');
		});
		return res.send('increment completed');
	}
};

