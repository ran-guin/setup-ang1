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

	createBox : function (req, res ) {
		var size = req.body['Capacity-label'];
		var name = req.body.name;

		var parent = req.body.parent;

		var Scanned = Barcode.parse(req.body.parent);
		console.log("Parsed " + parent + " : " + JSON.stringify(Scanned));
		if (Scanned['Rack']) {
			parent = Scanned['Rack'][0];
		}

		console.log("Add daughter to " + parent + ': ' + name + ' = ' + size);
		Rack.addSlottedBox(parent, name, size)
		.then ( function (result) {
			var box = result.box;
			var slots = result.slots.length;
		
			sails.config.messages.push("Added Box with " + slots + ' Slots');
			return res.render('customize/private_home');
		})
		.catch ( function (err) {
			return res.json(err); 
		})
	},

	wells: function (req, res) {
		var size = req.param('size');
		var fillBy = req.param('fillBy') || 'row';

		var wellMap = Rack.wells;
		var wells = [];
		if (size && wellMap[size] && fillBy.match(/row/i) ) {
			for (var i=0; i<wellMap[size].length; i++) {
				for (j=0; j<wellMap[size][i].length; j++) {
					wells.push(wellMap[size][i][j]);
				}
			}
		}
		else if (size && wellMap[size]) {			
			console.log(JSON.stringify(wellMap));
			for (var i=0; i<wellMap[size][0].length; i++) {
				for (j=0; j<wellMap[size].length; j++) {
					wells.push(wellMap[size][j][i]);
					console.log(i+j);
				}
			}
		}
		else {
			console.log("no size or mapping");
			wells = ['A1'];
		}


		if (wellMap[size]) { 
			return res.json(wells); 
		}
		else {
			console.log("Could not retrieve wells for: " + size );
			return res.json(wells);
		}
	}

};

