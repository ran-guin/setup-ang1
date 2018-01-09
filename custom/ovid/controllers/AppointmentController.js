/**
 * AppointmentController
 *
 * @description :: Server-side logic for managing appointments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	home: function (req, res) {
		var id = req.param('id') || 0;
		console.log('clinic home');
	    if (req.session && req.session.params) {
	      var page = req.session.params.defaultPage || 'homepage';

          console.log("Tweak Session Parameters from AppointmentController");
          req.session.params['page'] = {};
	      req.session.params['page']['item_Class'] = 'vaccine';
	      req.session.params['page']['search_title'] = "Search for Standard Vaccines using any of fields below";
	      req.session.params['page']['add_to_scope'] = true;

	      Appointment.load({'appointment_id' : id}, function (err, result) {	        
	        if (err) {  return res.negotiate(err) }

	        if (!result) {
	          console.log('no results');
	          return res.send('');
	        }
	    	
	    	console.log("RESULT:" + JSON.stringify(result));

	    	req.session.params['clinic'] = result['clinic'];
	    	req.session.params['appointment'] = result['appointment'];
	    	req.session.params['scheduled'] = result['scheduled'];

	    	var Param = {};
	    	Param['appointment'] = result['appointment'];
	    	Param['User'] = req.session.params['User'];

	    	if (result['patient']) { req.session.params['patient'] = result['patient'] }

	    	console.log("PARAMS:" + JSON.stringify(req.session.params));
	    	console.log("KEYS: " + Object.keys(req.session.params).join(',') );
	    	console.log("APPT1: " + JSON.stringify(req.session.params['appointment']) );
	    	console.log("APPT2: " + JSON.stringify(Param['appointment']) );
	    	
 	        res.render('appointment/Appointment', req.session.params);
	      });

	    }
	    else {
	      console.log("No user defined ... default to public homepage");
	      res.render('public', {message: "No user defined ... default to public homepage"});
	    }

	},

	new: function (req, res) { 
		console.log('new appointment form...');

		Appointment.query("desc appointment", function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			res.render('record/new', { fields: result });
		});
	},

	add: function (req, res) {
		
		console.log('add appointment...');

		Appointment.query("desc appointment", function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			console.log("fields: " + JSON.stringify(result));
			var keys = result.keys;
			console.log('K: ' + JSON.stringify(keys));
			
			var data = {};
			for (var i=0; i< results.length; i++) {
				var field = results[i]["Field"];

				data[field] = req.param(field);
			}
			console.log('Data: ' + JSON.stringify(data));

		});
	}
	
};

