/**
 * RackController
 *
 * @description :: Server-side logic for managing racks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var q = require('q');

module.exports = {
	
	boxData: function (req, res) {

		var body = {};
		if (req.body) { body = req.body }

		var rack_id = req.param('id') || body.id;
		var conditions = req.param('conditions') || body.conditions || [];

		var deferred = q.defer();

		console.log("Get contents of Rack " + rack_id);
		
		Rack.boxContents(rack_id, conditions)
		.then (function (data) {
			console.log("Pass along: " + JSON.stringify(contents));
			deferred.resolve(contents);
		})
		.catch (function (err) {
			deferred.reject("Error retrieving box contents: " + JSON.stringify(err));
		})

		return deferred.promise;
	},

};

