/**
 * Remote_loginController
 *
 * @description :: Server-side logic for managing remote_logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var q = require('q');
var request = require('request');

var Logger = require('../services/logger');

module.exports = {

	validate: function (req, res) {
		// login validations only ...
		var body = req.body || {}; 
		var model = body.model || req.param('model') || 'user';	
		var value = body.value || req.param('value') || '';
		var field = body.field || req.param('field') || 'name';

		console.log(JSON.stringify(body));
		
		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;

		var query = 'SELECT ' + field + ' FROM ' + table;	
		query += ' WHERE ' + field + " LIKE '" + value + "'";

		console.log(query);
		Record.query_promise(query)
		.then (function (result) {
			console.log(result);
			return res.json(result);
		})
		.catch ( function (err) {
			console.log("validation error");
			return res.json(err);
		});
	},

	test : function ( req, res ) {

			var user = { id: 3, name: 'Ran'};
			
          console.log("access granted: ");
          User.payload(user)
          .then ( function (payload) {
	          if ( req.param('Debug') ) { payload['Debug'] = true; }

	          // session authorization
	          req.session.authenticated = true;
	          req.session.payload = payload;

	          // token authorization 
	          payload['token'] = jwToken.issueToken(payload); 
	          req.headers.authorization = "Bearer [" + payload['token'] + ']';

	          sails.config.payload = payload;
	          sails.config.messages = [];
	          sails.config.warnings = [];
	          sails.config.errors   = [];

	          return res.render('customize/private_home', payload);
          })
          .catch (function (err) {
          	Logger.error(err, 'payload generation error', 'test');

          	console.log("error generating payload");
          	return res.render('customize/private_home');
          })
	
	},

	protocol : function ( req, res) {
		console.log("run Protocol on Litmus");

		var body = {};
		if (req.body) { body = req.body }

		var session = body.alDente_session;  // change to more generic name .. external_session (in alDente... )
		console.log("Check session: " + session);

		User.remote_session_payload(session)
		.then ( function (payload) {
			payload['token'] = jwToken.issueToken(payload); 
			console.log("\n** alDente Session Info: " + JSON.stringify(payload));

			console.log("\n** Session Authorized");			
			// session authorization
			req.session.authenticated = true;
			req.session.payload = payload;

			// token authorization 
			req.headers.authorization = "Bearer [" + payload['token'] + ']';

			sails.config.payload = payload;
			sails.config.messages = [];
			sails.config.warnings = [];
			sails.config.errors   = [];

          	var remote_login = payload.remote_login;

            console.log("Body: " + JSON.stringify(body));
            // Run Protocol (similar process as in Lab_protocol.run)

	        var protocol = body['Lab Protocol'];
			var id_list  = body['Plate_ID'];
			var set      = body['Plate_Set_Number'];

           	if (protocol && id_list && set) { 
				var ids = id_list.split(',');
				console.log("load data for ids: " + id_list);
				Container.loadData(ids)
				.then ( function (data) {
					var Samples = data;
					console.log("Samples: " + JSON.stringify(Samples));	

					Protocol_step.loadSteps(protocol)
					.then ( function (data) {
				    	data['plate_ids'] = ids;
				    	data['Samples']   = Samples;
				    	data['payload']   = payload;

						console.log("SEND: " + JSON.stringify(data));
						return res.render('lims/Protocol_Step', data);
					})
				    .catch ( function (err) {
				    	console.log("ERROR: " + err);
				    	Logger.error(err, 'error loading steps', 'protocol');
				    	return res.json({ error : 'Error encountered: ' + err});
				    });							
				})
				.catch ( function (err) {
					var msg = "Error loading ids: " + ids;
					Logger.error(err, msg);
					return res.json({ error : msg })
				});
			}
			else {
				return res.json( {error: 'unexpected input', body: body});
			}
	/*
            Record.createNew('remote_login', { 
              User: '<user>', 
              timestamp : '<now>', 
              url : remote_login,
            })
            .then ( function (result) {
                console.log("Created remote login record");
                payload['message'] = " Access granted via remote UI ";
                res.render("customize/private_home", payload);
            })
            .catch ( function (err) {
				console.log("Error recording remote_login record");
				payload['message'] = "Error storing return login link";
				res.render("customize/private_home", payload);
            });
*/
		})
		.catch ( function (err) {
			console.log('verification error: ' + err);
			Logger.warning(err, 'verification error', 'protocol' )
			return res.json({body: body, error: err});
		});

	},
	
	connect : function ( req, res ) {
		// return connection url for remote login 
		var deferred = q.defer();

		Remote_login.findOne({ User : userid })
		.then (function (result) {
			var url = result.url;
			console.log("Remote login enabled via " + url);
			deferred.resolve({url : url });
		})
		.catch ( function (err) {
			err.context = 'connect';
			err.message = 'failed to find remote login record for user: ' + userid;
			deferred.reject(err);
		})

		return deferred.promise;
	}

};

