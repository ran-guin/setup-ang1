/**
 * Remote_loginController
 *
 * @description :: Server-side logic for managing remote_logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');
var q = require('q');
var request = require('request');

module.exports = {
	
	test : function ( req, res ) {
		
		var session;
		if (req.body  && req.body.Session) { 
			console.log("BODY: " + JSON.stringify(req.body));
			session = req.body.Session;
		}
		else if (req.param) { session = req.param('Session') }

		var url = "http://bcgdev5/bcg/cgi-bin/alDente.pl";
		
		var testid = 1;
		var testname = 'vivocongusto@gmail.com';

		console.log("test session: " + session);
		var login_url = url + "?Session=" + session;

		return res.send( { userid: testid, username: testname, login_url : login_url } );
	},

	validate : function ( req, res ) {
		// validate user based on externally verified user (assumes security of external site)
		var input = req.body;
		console.log("Validate: " + JSON.stringify(input));

		//var url = "http://bcgdev5/bcg/cgi-bin/alDente.pl";
		var url = "http://localhost:5167/remote_login/test?Session=" + input.Session;

		var timestamp = '2016-08-08';

		if (input && input.Session) {
			console.log('post request...' + url);
			request.post( url , {Session : input.Session}, function (err, result) {
				if (err) { res.send("Error requesting remote login") }
				else if (result && result.body) {			
					var json = JSON.parse(result.body);
					console.log("Returned: " + JSON.stringify(json));

					var userid = json.userid;
					var username = json.username;
					var remote_login = json.login_url;

					console.log('user: ' + userid + ' = ' + username + ' : ' + remote_login);

	   				// Try to look up user using the provided email address
	    			User.findOne({ id: userid}, function foundUser(err, user) {

						if (err) return res.negotiate(err);

						if (!user || (user == 'undefined') ) { 
							return res.render("customize/public_login", 
								{ error: "Unrecognized User: " + username + '/' + userid }
							);
						}
						else {
							console.log("remote access granted");
							var payload = User.payload(user, 'Login Access (TBD)');
							payload['remote_login'] = remote_login;
							// session authorization
							req.session.authenticated = true;
							req.session.payload = payload;

							// token authorization 
							payload['token'] = jwToken.issueToken(payload); 
							req.headers.authorization = "Bearer [" + payload['token'] + ']';

							sails.config.payload = payload;

							console.log("Create remote login record");
							
							Record.createNew('remote_login', { 
								User: userid, 
								timestamp : timestamp, 
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

/*							.exec (function createRL (err, result) {
								if (err) { res.send({ Error : 'failed to create remote login'}) }
								else {
									console.log("Created remote login record");
									res.render("customize/private_home", payload);
								}
							});
*/
			        	}
			        });
	    		}
			});
		}	
		else {
			res.send("No Session supplied");
		}
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
			deferred.reject({ message : 'failed to find remote login record for user: ' + userid });
		})

		return deferred.promise;
	}

};

