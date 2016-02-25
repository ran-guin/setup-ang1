/**
 * QueryController
 *
 * @description :: Server-side logic for managing queries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	staff: function (req, res) {

		Staff.query("SELECT staff.id, role, user.name, user_id from staff, user where user_id = user.id", function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			return res.send(result);
	
		});
	},

	query: function (req, res) {

		var query = req.param('query');
		Staff.query(query, function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no query results');
				return res.send('');
			}

			return res.send(result);
	
		});
	}, 

	search: function (req, res) {
	    var q = req.body['query'];
	    var ss = req.body['search'] || '';
	    var field = req.body['field'];
	    var condition = req.body['condition'];
	    var format = req.body['format'] || 'data';
	    var type   = req.body['type'] || 'text';
	    var title  = req.body['title'] || 'Query Results';
	    var group = req.body['group'];
	    var view  = req.body['view'];

	    if (! req.body) { 
	        console.log('Error parsing body for q');
	        console.log(req);
	        res.send('no request');
	    }

	    console.log('search string: ' + q);
	    console.log(JSON.stringify(req.body['query']));
	    
	    var body = req.body;
	    if (body['query']) { q = body['query'] }

	    console.log("Posted query: " + q);
	    if (! q.match(/ WHERE /) ) { q += ' WHERE 1' }

	    var search_condition = '';
	    if (ss) { 
	        console.log('ss: ' + ss + '; type = ' + type);
	        if (type == 'number' && ss.match(/(\d+)\-(\d+)/) ) {
	            var range = ss.split('-');
	            search_condition = field + ' BETWEEN ' + range[0] + ' AND ' + range[1];
	        }
	        else if (type == 'number' && ss.match(/^\<(\d+)/) ) {
	            var val = ss.replace(/^</,'');
	            search_condition = field + ' < ' + val;
	            console.log("find options less than " + val)
	        }
	        else if (type == 'number' && ss.match(/^\>(\d+)/) ) {
	            var val = ss.replace(/^>/,'');
	            search_condition =  field + ' > ' + val;
	        }
	        else {  search_condition = field + " like '%" + ss + "%'" }
	        console.log('sc: ' + search_condition);
	    }

	    if (condition) { search_condition = ' AND ' + condition }
	    if (search_condition) { q += " AND " + search_condition }

	    if (group) { q += " GROUP BY " + group }

	    console.log('search string: ' + ss);
	    console.log('added condition: ' + condition);
	    console.log("QUERY: " + q);

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

			if (format == 'html') { 
	            console.log(result);
	            return res.render('core/homepage'); // view, { title : title, data : result } );
	        }
	        else {
	            return res.send( result);
	        }

		});
	}
};
