/**
 * ViewController
 *
 * @description :: Server-side logic for managing views
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	download: function (req, res) {
		var body = req.body || {};
		var file = body.file || req.param('file');

		console.log("download: " + file);
		if (file) {
			console.log("download " + file);
			return res.download(file);
		}
		else {
			return res.send("file not found");
		}
	},

	build: function (req, res) {
		console.log('build view...');
		var body = req.body || {};
		var view_id = body.view_id  || body.id || req.param('id');
		var generate = body.generate || req.param('generate');
		var fields = body.fields || req.param('fields');
		var table = body.table || req.param('table');
		var save = body.save || req.param('save') || 1;
		var page = body.page || req.param('page') || 1;
		var page_size = body.page_size || req.param('page_size') || 50;

		if (fields && fields.constructor === String) {
			fields = fields.split(/,\s*/);
		}

		if (!view_id) {
			console.log("no view specified...");
			View.specs()
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
		else {
			// view_id is defined .... 
			console.log(view_id + " VIEW: " + JSON.stringify(fields));

			View.specs(view_id)
			.then ( function (specs) {
				if (!specs) { specs = [] }
				View.build(view_id, {fields: fields, generate: generate})
				.then ( function (result) {
					console.log("RESULTS: " + JSON.stringify(result));

					if (generate) {
						console.log("generated results...");
						if (save && result.data) {
							console.log('save as excel');

							View.save2excel(result.data)
							.then ( function (excel) {
								console.log("saved as excel");
								console.log(JSON.stringify(excel.stats))
								// res.send({data: result.data});
								
								// paginate results 
								return res.render('lims/View', {
									excel: excel,
									view : specs[0],
									data : result.data,
									query: result.query,
									id: view_id,
									message: 'Excel file saved:  ',
									records: result.data.length,
									page: page
								});
							})
							.catch ( function (err) {
								console.log("Error saving as excel...");
								// res.send({data: result.data});
								return res.render('lims/View', { 
									view : specs[0],
									data : result.data,
									query: result.query,
									id: view_id,
									message: 'error saving'
								});
								return res.send("error saving as excel");
							});
						}
						else {
							console.log('nothing saved ... ');
							console.log('query: ' + result.query);
							// res.send({data: result.data});
							return res.render('lims/View', { 
								data: result.data,
								query: result.query,
								view : specs[0],
								id: view_id,
								message: 'nothing saved'
							});								
						}
					}
					else {
						console.log("baseline query: " + result.query);
						return res.render('lims/View', { 
							view : specs[0],
							id: view_id,
							message: 'nothing generated'
						});
					}
				})
				.catch ( function (err) {
					res.send(err);
				})
			})
			.catch ( function (err) {
				res.send(err);
			});
		}
	},

	views: function (req, res) {
		console.log('show views...');

		View.specs()
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

