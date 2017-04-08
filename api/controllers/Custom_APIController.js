/**
 * Custom_APIController
 *
 * @description :: Server-side logic for managing custom apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');
var Logger = require('../services/logger');

module.exports = {

	/* custom */

	add_step: function (req, res) {

		console.log("Add Step to protocol");
		var protocol = req.param('id');
		var step = req.param('step') || 0;
		var insert = req.param('insert');

		step++;

		console.log("id: " + protocol + '; step: ' + step);

		if (protocol && step) {
			var data = {
				Lab_protocol: protocol,
				name: 'new step name',
				step_number: step,
				prompt: true
			};

			console.log('create new record: ' + JSON.stringify(data));
			Record.createNew('protocol_step', data) 
			.then ( function (result) {
				console.log("retrieved: " + JSON.stringify(result));

				var update_steps = "UPDATE protocol_step SET step_number = step_number + 1 WHERE Step_Number >= " 
					+ step + " AND id != " + result.insertId;
				
				Record.query_promise(update_steps)
				.then (function (ok) {

					var q = "SELECT * FROM protocol_step where id = " + result.insertId;
				    Record.query_promise(q)
				    .then ( function (data) {
				    	console.log("Loaded Protocol Step: " + JSON.stringify(data));
						return res.render('lims/Protocol_Step_Editor', { record: data[0] });
				    })
				    .catch ( function (err) {
						console.log("error reloaing protocol steps : " + query);
						res.send(err);			    	
				    });
				})
				.catch ( function (err) {
					console.log("Error updating steps");
					res.send(err);
				});
			})
			.catch ( function (err) {
				console.log("error creating new step");
				res.send(err);
			});
		}
		else {
			console.log("No protocol or step number supplied... ");
			res.send({ Error: "no protocol or step number supplied"})
		}
	}

};

