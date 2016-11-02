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
		var body = req.body || {};
		var level = req.param('level');

		var data = body.data || body;

		var message = data.message;
		var e = data.err;

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
			Logger.info(message, data);
			return res.json('Message logged');
		}
		else {
			Logger.info('called remoteLog without error or message')
			console.log("No message supplied to log")
			return res.json('No Message logged');
		}

	}	
};

