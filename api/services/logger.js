// include and initialize the rollbar library with your access token
var Rollbar = require("rollbar");
Rollbar.init("1d6f3977e8214e18bc3da6ea27ce4e2b", { user: '12345' });

module.exports = {
	info : function (msg, options) {
		var data = options || {};
		data.level = 'info';

		if (sails && sails.config && sails.config.payload) {
			var payload = sails.config.payload;
			data.user = payload.user;
			data.userid = payload.userid;
			data.host   = payload.host;
			data.db     = payload.db;
			data.alDenteID = payload.alDenteID;
			data.mode      = payload.mode;
		
			if (msg && sails.config.messages ) { sails.config.messages.push(msg) }
		}

		Rollbar.reportMessageWithPayloadData(msg, data);
	},

	error : function (e, msg, options) {
		this.log(e, 'error', msg, options);
	},

	warning : function (e, msg, options) {
		this.log(e, 'warning', msg, options);
	},

	critical : function (e, msg, options) {
		this.log(e, 'critical', msg, options);
	},

	debug : function (e, msg, options) {
		this.log(e, 'debug', msg, options);
	},

	log : function (e, level, msg, options) {

		var data = options || {};
		data.level = level || 'error';

		if (e && e.constructor === String) {
			console.log("Convert string message to error");

			e = new Error(e);
		}

		if (sails && sails.config && sails.config.payload) {
			var payload = sails.config.payload;
			data.user = payload.user;
			data.userid = payload.userid;
			data.host   = payload.host;
			data.db     = payload.db;
			data.alDenteID = payload.alDenteID;
			data.mode      = payload.mode;

			var messages = [];
			if (e && level.match(/(error|warning|critical)/) ) {
				var parsed_error = Record.parse_standard_error(e);	
				messages = parsed_error;
			}
			if (msg) { messages.push(msg) }
			
			if (e && messages.length) { 
				// override raw message with simpler message ... 
				e.raw_message = e.message;
				e.message = messages[messages.length-1];
			}	

			if (messages.length && sails.config) {
				for (var i=0; i<messages.length; i++) {
					if (level == 'error' || level == 'critical') { sails.config.errors.push(msg) }
					else if (level == 'warning') { sails.config.warnings.push(msg) }
					else if (level == 'info') { sails.config.messages.push(msg) }
					else if (level === 'debug') { sails.config.debug_messages.push(msg) }
				}
			}	
			console.log("Standard error logging for " + level);
		}
		else {
			console.log("Logging error without payload data");
		}

		if (e.context) {
			// custom attribute for errors with context message
			data.context = e.context
		}
		
		Rollbar.handleErrorWithPayloadData(e, data);
	}

}