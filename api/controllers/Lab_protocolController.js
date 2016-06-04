/**
 * Lab_protocolController
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

module.exports = {

	'view' : function (req, res) {
		var id = req.param('id');

		console.log("view Lab Protocol " + id);

		var q = "SELECT * FROM protocol_step where Lab_protocol = " + id;

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

			return res.render('lims/Lab_protocol', { steps : result } );
			// return res.send();

		});
	},	

	'list' : function (req, res) {

		var demo = req.param('demo') || 1;

		var q = "SELECT * FROM lab_protocol";

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

			var List = [];

			console.log("Found " + result.length + " active Protocols");

			for (var i=0; i<result.length; i++) {
					var name = result[i]['name'];
					var id   = result[i]['id'];
					
					List.push({id : id, name: name});
			}

			return res.render('lims/Lab_protocols', { protocols : List, demo: demo } );
			// return res.send();
		});

	},

	/** return view **/
	'run' : function (req, res) {

		if (!req.body) { return res.json('Run via post') }

		var plate_ids = req.body['plate_ids'] || [];

		console.log("BODY: " + JSON.stringify(req.body));

		var protocol = req.body['lab_protocol-label'];
		var protocol_id = req.body['lab_protocol-id'];
		var Samples = JSON.parse(req.body.Samples);

		console.log("Samples: " + JSON.stringify(Samples));

		var get_last_step = Protocol_step.parse_last_step(Samples);
		var last_step = get_last_step.last_step;
		if (get_last_step.warning) { warningMsg = get_last_step.warning }

		Protocol_step.loadSteps(protocol_id)
		.then ( function (data) {


	    	data['protocol']  = { id: protocol_id, name: protocol };
	    	data['plate_ids'] = plate_ids;
	    	data['Samples']   = Samples;
	    	data['last_step'] = last_step;

			console.log("SEND: " + JSON.stringify(data));
			return res.render('lims/Protocol_Step', data);
		})
	    .catch ( function (err) {
	    	console.log("ERROR: " + err);
	    	return res.json({ error : 'Error encountered: ' + err});
	    });							

	},	

	'complete' : function (req, res) {
		// execute completion of lab protocol step //
		var data = req.body;

		console.log("COMPLETE in LP controller: " + JSON.stringify(data));

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
			return res.json(err);
		});
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

	}

};

