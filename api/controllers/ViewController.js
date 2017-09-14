/**
 * ViewController
 *
 * @description :: Server-side logic for managing views
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var excel_path = "./data/excel/";

module.exports = {

	download: function (req, res) {
		var body = req.body || {};
		var file = body.file || req.param('file');

		console.log("download: " + file);
		if (file) {
			console.log("download " + file);
			return res.download(excel_path + file);
		}
		else {
			return res.send("file not found");
		}
	},

	edit: function (req, res) {
		console.log('build view...');
		var body = req.body || {};
		var view_id = body.view_id  || body.id || req.param('id');

		View.setup(view_id)
		.then ( function (setup) {
			console.log("** SETUP ** " + JSON.stringify(setup));
			return res.render('lims/Edit_Report', setup);
		})
		.catch ( function (err) {
			return res.render('lims/Edit_Report');
		});
	},

	build: function (req, res) {
		console.log('build view...');
		var body = req.body || {};
		var view_id = body.view_id  || body.id || req.param('id');

		var fields = body.fields || req.param('fields');
		var layer  = body.layer || req.param('layer');
		var condition = body.condition || req.param('condition');
		var conditions = body.conditions || req.param('conditions');

		fields = View.cast2array(fields);
		layer = View.cast2array(layer);

		var options = {
			fields: fields,
			layer: layer,
			conditions: conditions,
			condition: condition
		};

		View.setup(view_id, options)
		.then ( function (setup) {
			console.log("options provided: " + JSON.stringify(options));
			console.log("Baseline Query: " + setup.query);
			console.log("setup Returned: " + JSON.stringify(setup));

			setup.message = 'view initiated';
			return res.render('lims/View', setup);
		})
		.catch ( function (err) {
			console.log("error setting up intitial view");
			options.error = 'error setting up view';

			console.log('** Pass: ' + JSON.stringify(options));
			return res.render('lims/View', options);			
		});
	},

	generate: function (req, res) {

		console.log('build view...');
		var body = req.body || {};

		var view_id = body.view_id  || body.id || req.param('id');

		var fields = body.fields || req.param('fields') || body.pick || req.param('pick');
		var layer  = body.layer || req.param('layer');
		var search = body.search || req.param('search');
		var group = body.group || req.param('group');
		var condition = body.condition || req.param('condition');
		var limit = body.limit;

		var page = body.page || req.param('page') || 1;
		var page_size = body.page_size || req.param('page_size') || 50;

		var save = body.save || req.param('save') || 1;
		var filename = body.filename;

		fields = View.cast2array(fields);
		layer  = View.cast2array(layer);
		group = View.cast2array(group);

		var conditions = View.parse_conditions(search);

		var options = {
			fields: fields,
			group: group,
			layer: layer,
			conditions: conditions,
			condition: condition,
			limit: limit
		};

		sails.log.info('options: ' + JSON.stringify(options));

		View.generate(view_id, options)
		.then (function (result) {
			console.log('generated view');

			var setup = result.setup;
			if (save && result.data) {
				console.log('save as excel');

				if (result.data.length) {
					View.save2excel(result.data, {path: excel_path, filename: filename})
					.then ( function (excel) {
						console.log("saved as excel");
						return res.json({data: result.data, query: setup.query, message: 'Excel file saved', excel: excel });

						// paginate results 
						// return res.render('lims/View', {
						// 	excel: excel,
						// 	view : result.view,
						// 	data : result.data,
						// 	query: result.query,
						// 	id: view_id,
						// 	message: 'Excel file saved:  ',
						// 	records: result.data.length,
						// 	page: page
						// });
					})
					.catch ( function (err) {
						console.log("Error saving as excel...");
						return res.json({data: result.data, uery: setup.query, error: 'error saving to excel: ' + err.message});
					// return res.render('lims/View', { 
						// 	view : result.view,
						// 	data : result.data,
						// 	query: result.query,
						// 	id: view_id,
						// 	message: 'error saving'
						// });
					});
				}
				else {
					console.log('no data ... ');
					options.message = 'no data to save';
					return res.json({query: setup.query, warning: 'no data to save'});					
				}
			} else {
				console.log('nothing saved ... ');
				options.message = 'nothing saved';
				return res.json({query: setup.query, warning: 'nothing to save'});
				// return res.render('lims/View', options);								
			}
		})
		.catch (function (err) {
			console.log("Error generating view");
			console.log(JSON.stringify(err));
			options.message = 'error generating view';
			return res.json({error: 'error generating view: ' + err.message});
			// return res.render('lims/View', options);
		});
	},

	views: function (req, res) {
		console.log('show views...');

		View.list()
		.then ( function (result) {
			console.log("Views: " + JSON.stringify(result));
			return res.render('lims/Views', { 
				views : result, 
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

