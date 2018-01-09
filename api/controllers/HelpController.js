/**
 * HelpController
 *
 * @description :: Server-side logic for managing helps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	find: function (req, res) {
		var body = req.body || {};

		console.log("BODY " + JSON.stringify(body));
		var string = req.param('string') || body.string;
		var extend = req.param('extend_search') || body.extend_search;

		var query = "Select section, title, description from help ";

		if (string) {
			query = query + " WHERE title like '%" + string + "%'";
			if (extend) { query = query + " OR description like '%'" + string + "%'"}
		}

		query = query + " ORDER BY section, title ";

		console.log(query);

		Record.query_promise(query)
		.then ( function (found) {
			res.send(found);
		})
		.catch ( function (err) {
			console.log('error retrieving help: ' + err);
			console.log(query);

			$self.error('Error retrieving help');
			res.send(found);
		});
	}

};

