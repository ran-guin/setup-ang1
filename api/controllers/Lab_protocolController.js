/**
 * Lab_protocolController
 *
 * @description :: Server-side logic for managing lab_protocols
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

module.exports = {

	'test2' : function (req, res) {
		res.send('yup');
	},

	'view' : function (req, res) {
		var id = req.param('id');

		console.log("view Lab Protocol " + id);

		var q = "SELECT * FROM Protocol_Step where FK_Lab_Protocol__ID = " + id;

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

		var q = "SELECT * FROM Lab_Protocol";

	    console.log("QUERY: " + q + ':' + barcode);

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
					var name = result[i]['Lab_Protocol_Name'];
					var id   = result[i]['Lab_Protocol_ID'];
					
					console.log('include ' + name);
					List.push({id : id, name: name});
			}

			return res.render('lims/Lab_protocols', { protocols : List, demo: demo } );
			// return res.send();
		});

	},

	/** return view **/
	'run' : function (req, res) {
		var id = req.param('id');
		var demo = req.param('demo');
		var containers = req.body.Plate_ID || 'nothing';

		console.log("BODY: " + JSON.stringify(req.body));

		var protocol = req.body['Lab_Protocol-id'];
		console.log("protocol: " + protocol);

		var q = "SELECT * FROM Protocol_Step where FK_Lab_Protocol__ID = " + protocol;

		Record.query(q, function (err, result) {
		    if (err) {

		        console.log("ASYNC Error in q post request: " + err);
		        console.log("Q: " + q);
		        return res.negotiate(err);
		    }

		    if (!result) {
		        console.log('no results');
		        return res.send('');
		    }

		    /*
		    var Options = [];
		    for (var i=0; i<result.length; i++) {
		        Lab_protocol.load_Attributes(result[i]['Input'].split(':'), function (err, atts) {
		            if (err) { return res.send("Error loading attributes") }

		            console.log("Attributes: " + JSON.stringify(atts));
		            if (atts['Plate'].length > 0) {
		                for (var i=0; i< atts['Plate'].length; i++) {
		                    Attribute.options('Plate', atts['Plate'][i], function (err, opts) {
		                        if (err) { return res.send("Error generating Plate attribute options") }

		                        console.log('Options: ' + JSON.stringify(opts) );
		                        Options.push(opts);
		                    });
		                }
		            }

		        });

		    }
		    */
		    Lab_protocol.input_list( result )
		    .then ( function (inputList) {
		    	console.log("INPUT : " + JSON.stringify(inputList));
		    	console.log('globals:' + JSON.stringify(sails.config.globals));		    	
		    	console.log('session:' + JSON.stringify(req.session));
		    	console.log("fields : " + JSON.stringify(inputList.input));
		    	console.log("fields : " + JSON.stringify(inputList.attributes));
		    	return res.render('lims/Protocol_Step', { Steps : result, Samples: containers, fields: inputList['input'], attributes: inputList.attributes } );
		    });

		});

	},	

	/** return data on success **/
	'complete' : function (req, res) {
		console.log("COMPLETED STEP");
		var data = req.body;
		
		console.log("Send Prep data: " + JSON.stringify(data['Prep']));
		console.log("Send Plate data: " + data['Plate']);

		if (data && data['Prep']) {
			Prep.create( data['Prep'] )
			.exec (function (err, PrepResult) {
				if (err) { return res.send("ERROR creating Prep record") }
				else {
					console.log("Added Prep: " + JSON.stringify(PrepResult));

					data['Plate']['FK_Prep__ID'] = PrepResult.id;

					Plate_Prep.create( data['Plate'] )
					.exec (function (err, PlateResult) {
						if (err) { return res.send("ERROR creating Plate record") }		
					
						console.log("Added Plate_Prep: " + PlateResult);
						return res.send("Added Prep + Plate Records: " + PrepResult)
					});
				}

			});
		}
		else {
			console.log("NO DATA INPUT");
			return res.send('no data');
		}

	},

	'define' : function (req, res) { 
		console.log('new protocol generator');

		res.render('lims/New_Lab_Protocol');
	},

	'save' : function (req, res) {
		console.log('saving lab protocol');


		var Steps = req.body.Steps;
		var Name = req.body.Lab_Protocol_Name;
		console.log("BODY: " + JSON.stringify(req.body));
		console.log("Save: " +  Name);

		// var S2 = req.query.Steps;
	//	console.log("s2: " + S2);

		var FKey = 'FK_Lab_Protocol__ID';   // CUSTOM

		Lab_protocol.create({ Lab_Protocol_Name : Name })
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

