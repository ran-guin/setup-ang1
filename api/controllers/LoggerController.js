/**
 * LoggerController
 *
 * @description :: Server-side logic for managing loggers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bodyParser = require('body-parser');

var Logger = require('../services/logger');

module.exports = {

	'log' : function (req, res) {
		// usage pass either error OR message in body ...
		console.log("Generating log message");

		var body = req.body || {};
		var level = req.param('level');

		var data = body.data || body;

		var message = data.message;
		var e = data.err;


		console.log(level + ': ' + JSON.stringify(body))

		delete data.message;
		delete data.err;
		// delete this information so other data may be passed...

		if (! e && level.match(/(error|warning|critical)/) ) {
			e = new Error(message);
		}

		if ( e ) {
			e = JSON.parse(e);

			console.log("remote error log: " + e.name + ": " + e.message);
			if (e.context) { console.log('context: ' + e.context) }

			console.log(JSON.stringify(e));
			if (! level) { level = 'error' }			
			Logger.log(e, level, message, data)
			return res.json('Error logged');
		}
		else if (message) {
			console.log('remote message logged');
			Logger.info(message, data);
			return res.json('Message logged');
		}
		else {
			console.log("No message supplied to log")
			Logger.info('called remoteLog without error or message')
			return res.json('No Message logged');
		}

	}	
};

