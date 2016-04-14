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

		var containers = id || req.body.Plate_ID || 'nothing';  // Legacy 

		console.log("BODY: " + JSON.stringify(req.body));

		var protocol = req.body['lab_protocol-id'];
		console.log("protocol: " + protocol);

		var q = "SELECT * FROM protocol_step where Lab_protocol = " + protocol;

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
		    	console.log("attributes : " + JSON.stringify(inputList.attributes));
		    	return res.render('lims/Protocol_Step', { Steps : result, Samples: containers, fields: inputList['input'], attributes: inputList.attributes } );
		    });

		});

	},	

	'isTransfer' : function ( name ) {
		// Determine if a protocol step is a transfer step according to name format 
		if ( name.match(/^Transfer (.+) (in|out|) to (.+)/) ) {
			console.log("Matches: " + JSON.stringify(matches));
		}

	},


	/** return data on success **/
	'savePrep' : function (data) {
		console.log("savePrep");

		var action = '';
		if (data && data['Prep'] && data['Prep']['Prep_Action']) {
			action = data['Prep']['Prep_Action'];
		} 

		var deferred = q.defer();

		console.log("Complete Prep: " + action);
		if (action == 'Debug') {
			console.log("Form Data:");
			console.log(data);
			//return res.send('Debug only - nothing saved');
			deferred.reject("Debug only - nothing saved");
		}
		
		else if (data && data['Prep']) {
			console.log("Send Prep data: " + JSON.stringify(data['Prep']));

			Record.createNew('Prep', data['Prep'] )
			.then (function (PrepResult) {
				console.log("Added Prep: " + JSON.stringify(PrepResult));

				var ids = [];
				var prepId = PrepResult.insertId;  // Legacy
				var added = PrepResult.affectedRows;
				for (var i=0; i<added; i++) {
					ids.push(prepId++);
				}
				data['Plate']['FK_Prep__ID'] = ids; 

				console.log("Send Plate data: " + JSON.stringify(data['Plate']));

				Record.createNew('Plate_Prep', data['Plate'] )
				.then (function (PlatePrepResult) {				
					console.log("Added Plate_Prep: " + JSON.stringify(PlatePrepResult));
					console.log('transfer if necessary....');
					
					deferred.resolve({ Prep: PrepResult, Plate_Prep: PlatePrepResult});
					//return res.send(PrepResult);
					/*
					Container.xfer_if_required( PrepResult, PlateResult )
					.exec (function (err, xferResult) {
						if (err) { return res.send("ERROR creating new Plates...") }		

						console.log("Transferring Samples ? " + JSON.stringify(xferResult));
						return res.send(PrepResult);
					});
						*/
				})
				.catch (function (err) {
					deferred.reject("Error creating Plate record: " + err);
					//return res.send("ERROR creating Plate record: " + err)
				})
			})
			.catch ( function (err) {
				deferred.reject("Error creating Prep record: " + err);
				//return res.send("ERROR creating Prep record: " + err);				
			});
		}
		else {
			console.log("Prep Data");
			deferred.reject("No data");
			//return res.send('no data');
		}

		return deferred.promise;

	},

	'complete' : function (req, res) {
		var data = req.body;
		console.log("COMPLETE ALL STEPS: " + JSON.stringify(data));

		var plate_ids = [1,2];

		this.savePrep(data)
		.then ( function (PrepResult) {

			var promises = [];
			console.log("Added Single Prep: " + JSON.stringify(PrepResult));

			var prep_id = [ PrepResult.Prep.insertId ];
			console.log("Prep IDS: " + JSON.stringify(prep_id));

			promises.push( Attribute.save('Plate', plate_ids, data["Plate_Attribute"]) );
			promises.push( Attribute.save( 'Prep', prep_id, data["Prep_Attribute"]) );
			promises.push( Container.saveLastPrep(plate_ids, prep_id[0]) );

			var prepName = data['Prep']['Prep_Name'];
			console.log("Test " + prepName);
			var $test = scope.isTransfer(prepName);

			if ($test) { 
				promises.push( Container.transfer(transfer));
			}

			q.all( promises )
			.then ( function (Qdata) {
				console.log("ALL PROMISES: " + JSON.stringify(Qdata));
				res.send(Qdata);
			})
			.catch ( function (Qerr) {
				console.log("Error completing all actions: " + Qerr);
				res.send(Qerr);
			});
		})
		.catch (function (err) {
			console.log("Error saving completed Prep Record: " + err);
			res.send(err);
		});
		//.push( this.savePrep(data) );
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

