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
		var body = req.body || {};
		var level = req.param('level');

		var data = body.data || body;

		var message = data.message;
		delete data.message;

		var e = data.error;

		if (! e && level.match(/(error|warning|critical)/) ) {
			e = new Error(message);
		}

		if ( e ) {
			if (! level) { level = 'error' }
			
			Logger.log(e, level, message, data)
		}
		else if (message) {
			Logger.info(message, data);
			return res.json('Message logged');
		}
		else {
			console.log("No message supplied to log")
			return res.json('No Message logged');
		}

	}	
};

