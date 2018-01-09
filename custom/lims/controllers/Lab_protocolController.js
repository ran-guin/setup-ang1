 /* Lab_protocolController
 *
 * @description :: Server-side logic for managing lab_protocols
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/*
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
*/

var bodyParser = require('body-parser');
var q = require('q');

var Logger = require('../services/logger');

module.exports = {

	'view' : function (req, res) {
		var id = req.param('id');

		console.log("view Lab Protocol " + id);

		var q = "SELECT * FROM protocol_step where Lab_protocol = " + id;
		q = q + " ORDER BY step_number";

	    Record.query(q, function (err, result) {
	    	if (err) {

	    		console.log("ASYNC Error in q post request: " + err);
	            console.log("Q: " + q);
	 //           res.status(500).send("Error generating Request Page");

				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			return res.render('lims/Lab_protocol', { Steps : result } );
			// return res.send();

		});
	},	

	'edit_step' : function (req, res) {
		var id = req.param('id');

		var q = "SELECT * FROM protocol_step where id = " + id;
		console.log(q);

	    Record.query_promise(q)
	    .then ( function (data) {
	    	console.log("Loaded Protocol Step: " + JSON.stringify(data));
			return res.render('lims/Protocol_Step_Editor', { record: data[0] });
	    })
	    .catch ( function (err) {
	    	Logger.error(err, 'could not load step', 'edit_step');
	    	console.log("Error loading protocol step");
	    });
	},

	'list' : function (req, res) {

		var demo = req.param('demo') || 1;

		var q = "SELECT * FROM lab_protocol";
		q = q + " LEFT JOIN Sample_Type ON lab_protocol.Sample_type = Sample_Type_ID";
		q = q + " LEFT JOIN Plate_Format ON Container_format = Plate_Format_ID";

	    Record.query(q, function (err, result) {
	    	if (err) {

	    	    console.log("ASYNC Error in q post request: " + err);
	            console.log("Q: " + q);
	 //           res.status(500).send("Error generating Request Page");

				return res.negotiate(err);
     		}

			if (!result || result.length == 0) {
					console.log('no results');
					return res.send('');
			}
			else {
				console.log("Found " + result.length + " active Protocols");

				for (var i=0; i<result.length; i++) {
						result[i].sample_type = result[i]['Sample_Type'];
						result[i].format = result[i]['Plate_Format_Type'];
				}

				return res.render('lims/Lab_protocols', { protocols : result, demo: demo } );
			}
		});

	},

	/** return view **/
	'run' : function (req, res) {

		if (!req.body) { return res.json('Run via post') }

		var plate_ids = req.body['plate_ids'] || [];

		// console.log("BODY: " + JSON.stringify(req.body));

		var protocol = req.body['lab_protocol-label'];
		var protocol_id = req.body['lab_protocol-id'];
		var Samples = JSON.parse(req.body.Samples);
		var plate_set = req.body['plate_set'];
		var backfill_date = req.body['backfill_date'];

		console.log("Samples: " + JSON.stringify(Samples[0]) + '...');
		console.log("\nSet: " + plate_set);
		console.log("Backfill date: " + backfill_date);

		var get_last_step = Protocol_step.parse_last_step(Samples);
		var last_step = get_last_step.last_step;
		if (get_last_step.warning) { warningMsg = get_last_step.warning }

		Protocol_step.loadSteps(protocol_id)
		.then ( function (data) {
	    	data['protocol']  = { id: protocol_id, name: protocol };
	    	data['plate_ids'] = plate_ids;
	    	data['Samples']   = Samples;
	    	data['last_step'] = last_step;
	    	data['plate_set'] = plate_set;
	    	data['backfill_date'] = backfill_date;

			//console.log("SEND Protocol Step Completion Data: " + JSON.stringify(data));
			return res.render('lims/Protocol_Step', data);
		})
	    .catch ( function (err) {
	    	console.log("ERROR: " + err);
	    	Logger.error(err, 'problem loading steps', 'run');
	    	return res.json({ error : 'Error encountered: ' + err});
	    });							

	},	

	'complete' : function (req, res) {
		// execute completion of lab protocol step //
		var data = req.body;

		console.log("COMPLETE Lab Protocol: " + JSON.stringify(data));

		Lab_protocol.complete(data)
		.then ( function (result) {
			console.log("returned from Lab_protocol.complete method...");
			//var merged_Messages = Record.merge_Messages([result);
			// console.log('Merged messages: ' + JSON.stringify(merged_Messages));

			var returnVal = Record.wrap_result(result);

			console.log("\n* MSG: " + sails.config.messages.join(',') );
			return res.json( returnVal );  
		})
		.catch ( function (err) {
			console.log("error completing LP : " + JSON.stringify(err));
			Logger.error(err, 'could not complete protocol', 'complete');
			return res.send({ error : "Error completing protocol: " + err });
		});
	},

	'edit' : function (req, res) { 
		console.log('edit protocol');
		var body = req.body || {};	
		var id = body.id || req.param('id');

		var Steps = [];
		if (id) {
			var q = "select * from lab_protocol, protocol_step where Lab_protocol=lab_protocol.id AND lab_protocol.id = '" + id + "' ORDER BY step_number";
			Record.query_promise(q)
			.then (function (protocol) {
				console.log("loaded protocol: " + JSON.stringify(protocol))
				res.render('lims/New_Lab_Protocol', { Steps : protocol });
			})
			.catch (function (err) {
				Logger.warning(err, 'problem retrieving protocol steps', 'edit');
				console.log(err);
				res.send(err);
			})
		}
		else {
				res.render('lims/New_Lab_Protocol');			
		}
	},
	'define' : function (req, res) { 
		console.log('new protocol generator');

		res.render('lims/New_Lab_Protocol');
	},

	'save' : function (req, res) {
		console.log('saving lab protocol');


		var Steps = req.body.Steps;
		var Name = req.body.name;
		console.log("BODY: " + JSON.stringify(req.body));
		console.log("Save: " +  Name);

		// var S2 = req.query.Steps;
	//	console.log("s2: " + S2);

		var FKey = 'Lab_protocol'; // FK_Lab_Protocol__ID';   // CUSTOM

		Lab_protocol.create({ name : Name })
		.exec( function (err, result) {
			if (err) {
				console.log("ERR: " + err);
				res.send(400, "Error " + err);
			}
			else {
				var id = result.id;
				console.log("ID=" + id);
				console.log(JSON.stringify(result));
				for (var i=0; i<Steps.length; i++) {
					Steps[i][FKey] = id;
					console.log("Create step " + i + " : " + JSON.stringify(Steps[i]))
				}

				Protocol_step.create( Steps )
				.exec( function (Serr, Sresults) {
					if (Serr) { 
						console.log("error creating protocol step(s): " + Serr)
						res.send(400, "Error saving steps: " + Serr);
					}
					else {
						console.log("Created " + Steps.length + " protocol steps");
						console.log(JSON.stringify(Sresults));
						res.send( { Protocol: result, Protocol_Steps: Sresults });
					}
				});

			}
		});

	},

	update : function (req, res) {

		var body = req.body || {};
		var id = body.id || req.param('id');

		var data = body;

		console.log("UPDATE " + JSON.stringify(data));

		var id = data.id;
		delete data.id;

		Record.update('lab_protocol', id, data)
		.then ( function (result) {
			console.log('response: ' + JSON.stringify(result));
			res.send({ result : result} );
		})
		.catch ( function (err) {
			console.log(err);
			Logger.error(err, 'could not update protocol', 'update');
			return res.send( { error: err });
		});
	},

	update_step : function (req, res) {
		var body = req.body || {};

		var data = body;

		console.log("UPDATE " + JSON.stringify(data));

		var id = data.id;

		delete data.id;

		var json = data.custom_settings;
		if (json) { json = json.replace(/"/g, '\\"') }
		console.log("JSON : " + json);

		data.custom_settings = json;

		Record.update('protocol_step', id, data)
		.then ( function (result) {
			console.log('response: ' + JSON.stringify(result));
			res.send({ result : result} );
		})
		.catch ( function (err) {
			console.log(err);
			Logger.error(err, 'problem updating step', 'update_step');
			return res.send( { error: err });
		});
	},

};

