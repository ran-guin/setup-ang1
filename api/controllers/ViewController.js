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

		View.initialize(view_id)
		.then (function (view) {

			View.setup(view)
			.then ( function (setup) {
				console.log("** SETUP ** " + JSON.stringify(setup.view.fields));
				return res.render('lims/Edit_Report', setup);
			})
			.catch ( function (err) {
				return res.render('lims/Edit_Report');
			});
		})
		.catch ( function (err) {
			console.log("Error initiating view editor");
			console.log(err);
			return res.render('lims/Edit_Report', { error: err })
		})
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

		console.log('initialize view#' + view_id);
		View.initialize(view_id)
		.then (function (view) {
			View.setup(view, options)
			.then ( function (setup) {
				// console.log("options provided: " + JSON.stringify(options));
				// console.log("Baseline Query: " + setup.query);
				// console.log("*** Setup Returned: " + JSON.stringify(setup));

				setup.message = 'view loaded';

				return res.render('lims/View', setup);
			})
			.catch ( function (err) {
				console.log("error setting up intitial view");
				console.log(err);

				options.error = 'error setting up view';
				console.log('** Pass: ' + JSON.stringify(options));
				return res.render('lims/View', {view: view});			
			});
		})
		.catch ( function (err) {
			console.log("Error building view report");
			console.log(err);
			return res.render('lims/View', { view_id: view_id, error: err })
		})

	},

	generate: function (req, res) {
		var body = req.body || {};

		var view_id = body.view_id  || body.id || req.param('id');

		var select = body.select || body.pick || req.param('select');
		var layer  = body.layer || req.param('layer');
		var search = body.search || req.param('search');
		var group = body.group || req.param('group');
		var condition = body.condition || req.param('condition');
		var render = body.render;

		var V = body.view;   // make post only for generate ? ...
		var limit = body.limit;

		var page = body.page || req.param('page') || 1;
		var page_size = body.page_size || req.param('page_size') || 50;

		var save = body.save || req.param('save') || 1;
		var filename = body.filename;

		console.log('build view ' + view_id);

		select = View.cast2array(select);
		group = View.cast2array(group);

		var options = {
			select: select,
			group: group,
			layer: layer,
			condition: condition,
			limit: limit,
			search: search
		};

		sails.log.info('view ' + view_id + ' options: ' + JSON.stringify(options));

		View.initialize(view_id)
		.then (function (view) {
			console.log('now generate with options');
			console.log(JSON.stringify(options));
			View.generate(view, options)
			.then (function (result) {
				console.log('generated view');

				var setup = result.setup || {};
				var extra_conditions = setup.extra_conditions;
				if (save && result.data) {
					console.log('save as excel');

					if (result.data.length) {
						View.save2excel(result.data, {path: excel_path, filename: filename, layer: layer})
						.then ( function (excel) {
							console.log("saved as excel");

							if (render) {
								return res.render('customize/injectedData', 
									{ fields: result.setup.pick, data: result.data, title: 'View Results', element:'injectedViewData'}
								);
							}
							else {
								return res.json({data: result.data, query: setup.query, message: 'Excel file saved', excel: excel, extra_conditions: extra_conditions});
							}
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
							return res.json({data: result.data, query: setup.query, error: 'error saving to excel: ' + err.message, extra_conditions: extra_conditions});
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
						return res.json({query: setup.query, warning: 'no data to save', extra_conditions: extra_conditions});					
					}
				} else {
					console.log('nothing saved ... ');
					options.message = 'nothing saved';
					return res.json({query: setup.query, warning: 'nothing to save', extra_conditions: extra_conditions});
					// return res.render('lims/View', options);								
				}
			})
			.catch (function (err) {
				console.log("Error generating view");
				console.log(JSON.stringify(err));
				options.message = 'error generating view';
				return res.json({error: 'error generating view: ' + err.message, extra_conditions: extra_conditions});
				// return res.render('lims/View', options);
			});
		})
		.catch ( function (err) {
			console.log("Error initializing view report");
			console.log(err);
			return res.json({ error: err, extra_conditions: extra_conditions})
		});
	},

	views: function (req, res) {
		console.log('show views...');

		View.list()
		.then ( function (result) {
			console.log("*** Views: *** " + JSON.stringify(result));
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

