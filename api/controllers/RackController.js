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

		var body = req.body || {};

		var rack_id = body.id;
		var rack_name = body.name;

		var conditions = body.conditions || [];
		var fill_by = body.fill_by || req.param('fill_by');

		// var deferred = q.defer();

		console.log("Get contents of Rack: " + rack_id + ' ' + rack_name);
		
		Rack.boxContents({ id: rack_id, name: rack_name, conditions: conditions, fill_by: fill_by })
		.then (function (contents) {
			console.log("Pass along: " + JSON.stringify(contents));
			return res.json(contents);
			// deferred.resolve(contents);
		})
		.catch (function (err) {
			//deferred.reject("Error retrieving box contents: " + JSON.stringify(err));
		})

		// return deferred.promise;
	},

	createBox : function (req, res ) {

		var body = req.body || {};
		console.log("Body: " + JSON.stringify(body));
		var size = body.size || body['Capacity-label'];
		var name = body.name;
		var parent = body.parent;

		var Scanned = Barcode.parse(parent);

		console.log("Parsed " + parent + " : " + JSON.stringify(Scanned));
		if (Scanned['Rack']) {
			parent = Scanned['Rack'][0];
		}

		console.log("Add daughter to " + parent + ': ' + name + ' = ' + size);
		Rack.addSlottedBox(parent, name, size)
		.then ( function (result) {
			console.log("Added Slotted Box " + JSON.stringify(result));
			return res.json({ message : result.message });
/*
			if (result.box && result.slots) {

				var box = result.box.insertId;
				var slots = result.slots.affectedRows;
		
				sails.config.messages.push("Added Box #" + box + " with " + slots + ' Slots');
			}
			else {
				sails.config.warnings.push("Could not recognize new box/slot feedback");
			}

			return res.render('customize/private_home');
*/
		})
		.catch ( function (err) {
			console.log("Could not add slotted box: " + err);

			var error = Record.parse_standard_error(err);
			return res.json({error: error});
			//return  res.render('customize/private_home'); 
		})
	},

	wells: function (req, res) {
		var size = req.param('size');
		var fill_by = req.param('fill_by') || 'row';

		var wellMap = Rack.wells;
		var wells = [];
		if (size && wellMap[size] && fill_by.match(/row/i) ) {
			for (var i=0; i<wellMap[size].length; i++) {
				for (j=0; j<wellMap[size][i].length; j++) {
					wells.push({ position: wellMap[size][i][j]});
				}
			}
		}
		else if (size && wellMap[size]) {			
			console.log(JSON.stringify(wellMap));
			for (var i=0; i<wellMap[size][0].length; i++) {
				for (j=0; j<wellMap[size].length; j++) {
					wells.push({position: wellMap[size][j][i]});
				}
			}
		}
		else {
			console.log("no size or mapping");
			wells = [ {position: 'A1'} ];
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

