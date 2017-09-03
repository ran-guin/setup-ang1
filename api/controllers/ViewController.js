/**
 * ViewController
 *
 * @description :: Server-side logic for managing views
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	build: function (req, res) {
		var body = req.body || {};
		var view = body.view_id || req.param('view_id') || 1;

		var fields = body.fields || req.param('fields') || ['name'];

		View.build(view, fields)
		.then ( function (result) {

			console.log("RESULTS: " + JSON.stringify(result));

			return res.render('customize/searchResults', { 
				data : result, 
				title: 'View #' + view
			});

		})
		.catch ( function (err) {
			res.send(err);
		})
	},

	views: function (req, res) {
		var query = "Select Group_Concat(distinct view_table.table_name SEPARATOR ', ') as tables, view.name as name, GROUP_CONCAT(distinct view_field.field SEPARATOR ', ') as fields"
		query += " FROM view, view_table, view_field WHERE view_table.view_id=view.id and view_field.view_id=view.id GROUP BY view.id"

		console.log(query);
		Record.query_promise(query)
		.then ( function (result) {
			return res.render('customize/searchResults', { 
				data : {'View' : result}, 
				title: 'Views',
				fields: ['name', 'tables', 'fields'] 
			});
		})
		.catch ( function (err) {
			console.log("error retrieving views:");
			console.log(err);
			res.render('core/500.jade')
		})

	}
};

