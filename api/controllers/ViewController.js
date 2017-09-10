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

	build: function (req, res) {
		console.log('build view...');
		var body = req.body || {};
		var view_id = body.view_id  || body.id || req.param('id');

		var fields = body.fields || req.param('fields');
		var layer  = body.layer || req.param('layer');
		var conditions = body.conditions || req.param('conditions');

		if (fields && fields.constructor === String) {
			fields = fields.split(/,\s*/);
		}

		var options = {
			fields: fields,
			layer: layer,
			conditions: conditions
		};

		View.setup(view_id, options)
		.then ( function (setup) {
			console.log("options: " + JSON.stringify(options));
			console.log("baseline query: " + setup.query);
			console.log("setup: " + JSON.stringify(setup));

			setup.message = 'view initiated';
			return res.render('lims/View', setup);
		})
		.catch ( function (err) {
			console.log("error setting up intitial view");
			options.message = 'view initiated';

			return res.render('lims/View', options);			
		});
	},

	generate: function (req, res) {

		console.log('build view...');
		var body = req.body || {};

		var view_id = body.view_id  || body.id || req.param('id');

		var fields = body.fields || req.param('fields');
		var layer  = body.layer || req.param('layer');
		var conditions = body.conditions || req.param('conditions');
		var limit = body.limit;

		var page = body.page || req.param('page') || 1;
		var page_size = body.page_size || req.param('page_size') || 50;

		var save = body.save || req.param('save') || 1;
		var filename = body.filename;

		if (fields && fields.constructor === String) {
			fields = fields.split(/,\s*/);
		}

		var options = {
			fields: fields,
			layer: layer,
			conditions: conditions,
			limit: limit
		};

		View.generate(view_id, options)
		.then (function (result) {
			console.log('generated view');
			if (save && result.data) {
				console.log('save as excel');

				View.save2excel(result.data, {path: excel_path, filename: filename})
				.then ( function (excel) {
					console.log("saved as excel");
					return res.json({data: result.data, message: 'Excel file saved', excel: excel });

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
					return res.json({data: result.data});
				// return res.render('lims/View', { 
					// 	view : result.view,
					// 	data : result.data,
					// 	query: result.query,
					// 	id: view_id,
					// 	message: 'error saving'
					// });
				});
			} else {
				console.log('nothing saved ... ');
				options.message = 'nothing saved';
				return res.json({});
				// return res.render('lims/View', options);								
			}
		})
		.catch (function (err) {
			console.log("Error generating view");
			options.message = 'error generating view';
			return res.json({});
			// return res.render('lims/View', options);
		});
	},

	views: function (req, res) {
		console.log('show views...');

		View.list()
		.then ( function (result) {
			console.log("R: " + JSON.stringify(result));
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

