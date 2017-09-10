/**
 * View.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');
var xl = require('excel4node');
var _ = require('underscore-node');

module.exports = {

  attributes: {
  	name: { type: 'string' },
  	description: { type: 'text'}
  },

  list : function (view_id) {
  	var deferred = q.defer();

	var query = "Select view.id, view.description as description, Group_Concat(distinct view_table.table_name SEPARATOR ', ') as tables, view.name as name, GROUP_CONCAT(distinct view_field.field SEPARATOR ', ') as fields"
	query += " FROM view, view_table, view_field WHERE view_table.view_id=view.id and view_field.view_id=view.id";

	if (view_id) { query += " AND view.id = " + view_id }

	query += " GROUP BY view.id";

	Record.query_promise(query)
	.then ( function (result) {
		deferred.resolve(result)
	})
	.catch ( function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
  },

  setup : function (view_id, options) {
 	var deferred = q.defer();

  	if (!options) { optios = {} }
  	
  	var fields = options.fields || [];
  	var group  = options.group  || [];
  	var layer  = options.layer  || [];
  	var search = options.search || {};
  	var condition = options.condition || ''; 
  	var limit = options.limit; 	

  	var conditions = [];

  	if (condition) { conditions.push(condition) }

  	var query = "Select * from view_field, view_table where view_field.table=view_table.table_name AND view_table.view_id = view_field.view_id";
  	if (view_id) { query +=  " AND view_field.view_id = " + view_id }

  	View.list(view_id)
  	.then (function (views) {
	 	Record.query_promise(query)
		.then ( function (F) {
	  		console.log("QF: " + JSON.stringify(F));

	  		if (fields && fields.length) {
	  			// ensure mandatory fields included...
	  		}
	  		else {
	  			fields = _.pluck(F, 'field');
	  		}

	  		console.log('fields: ' + JSON.stringify(fields));
	  		var f = [];
	  		var reqd = [];
	  		var  tables = [];
	  		var lj = [];

	 		for (var i=0; i<fields.length; i++) {
	  			var lastcheck = fields.length - 1;
		  		for (var j=0; j<F.length; j++) {
		  			var prompt = F[j].prompt || F[j].field;
		  			console.log(F[j].field + ' vs ' + fields[i]);
		  			if (F[j].field === fields[i] || fields[i] === F[j].prompt || fields[i] === F[j].table + '.' + F[j].field) {
			  			console.log(fields[i] + ' : ' + JSON.stringify(F[j]));
		  				if (F[j].type === 'attribute') {
		  					var primary = F[j].table + '_ID';

		  					var attTable = F[j].table + '_Attribute';
		  					lj.push('Attribute as ' + F[j].field + "_Att ON Attribute_Name = '" + F[j].field + "' AND Attribute_Class = '" + F[j].table + "'");
		  					lj.push(attTable + " AS " + F[j].field + " ON " + F[j].field + ".FK_Attribute__ID=" + F[j].field + '_Att.Attribute_ID AND FK_' + F[j].table + '__ID=' + F[j].table + '.' + primary );
		  					f.push(F[j].field + '.Attribute_Value AS ' + F[j].prompt);
		  					console.log("ADD " + F[j].field + '.Attribute_Value AS ' + F[j].prompt);
		  				}
		  				else {
		  					f.push(F[j].table + '.' + F[j].field + ' AS ' + F[j].prompt);
		  					console.log("normal add: " + F[j].table + '.' + F[j].field + ' AS ' + F[j].prompt);
		  				}
		  					
		  				if (tables.indexOf(F[j].table) === -1) {
		  					tables.push(F[j].table)
		  					if (F[j].join_condition !== '1') { conditions.push(F[j].join_condition) }
		  				}
		  				
		  				j=F.length;
		  			}
		  		}
		  		
	  		}

	  		console.log("BUILT: " + JSON.stringify(f));

	  		if (reqd) {
	  			for (var k=0; k<reqd.length; k++) {
	  				f.push(reqd[k]);
	  				console.log("add required field: " + reqd[k]);
	  			}
	  		}
	  		var select = "SELECT " + f.join(', ') + ' FROM (' + tables.join(', ') + ')';

	  		if (lj.length) { select += " LEFT JOIN " + lj.join(' LEFT JOIN ') }

	  		if (conditions && conditions.length) { select += " WHERE " + conditions.join(' AND ') }

	  		console.log("QUERY: " + select);
	  		console.log(JSON.stringify(layer));

	  		if (layer && layer.length) { select += " GROUP BY " + layer.join(',') }
			
			if (limit) { select += " LIMIT " + limit }	  		

	  		deferred.resolve({view: views[0], query: select, fields: fields, layer: layer});
	  	})
	  	.catch ( function (err) {
	  		console.log("Error retrieving report");
	  		deferred.reject(err);
	  	});
	})
	.catch (function (err) {
		console.log("Error finding view");
		deferred.reject(err);
	});

  	return deferred.promise;
  },

  generate : function (view_id, options) {
	var deferred = q.defer();
  	if (!options) { options = {} }

  	View.setup(view_id, options)
  	.then (function (setup) {
  		
  		console.log('setup: ' + JSON.stringify(setup));
  		var query = setup.query;
  		var view  = setup.view;
	  	var layer  = setup.layer;

  		if (query) {
			Record.query_promise(query)
			.then ( function (result) {
				deferred.resolve({data: result, view: view, query: query, layer:layer});
			})
			.catch ( function (err) {
				console.log('error with query ?' + err);
				deferred.reject(err);
			})
		}
		else {
			console.log('no query in report ?')
			deferred.resolve({data: [], query: '', layer: layer});
		}
  	})
  	.catch ( function (err) {
  		console.log("Error retrieving view tables")
  		deferred.reject(err);
  	})

  	return deferred.promise;
  },

  save2excel: function (data, options) {

  	if (!options) { options = {} }

  	var filename = options.filename;
  	var path     = options.path || './excel/';

  	var deferred = q.defer();

  		console.log('save data to excel');
  		console.log(JSON.stringify(data));

		var wb = new xl.Workbook();
		console.log('made new workbook...');

		var ws = wb.addWorksheet('Sheet 1');
		console.log('defined sheet...');

		// Create a reusable style 
		var myStyle = wb.createStyle({
		    font: {
		        bold: true,
		        color: '00FF00'
		    }
		});

		console.log('define Data style...');
		// var data_style = wb.createStyle({
		//     font: {
		//         color: '#F33',
		//         size: 14
		//     }
		// });
		// // numberFormat: '$#,##0.00; ($#,##0.00); -'

		// console.log('define header style...');
		// var header_style = wb.createStyle({
		//     font: {
		//         color: '#333',
		//         size: 12
		//     }
		// });

		if (data && data.length) {
			var keys = Object.keys(data[0]);
			// add headers
			console.log('add headers...' + keys.join(', '));
			for (var col=1; col<=keys.length; col++) {
				ws.cell(1,col).string(keys[col-1]);
			}
			console.log('add data...');
			console.log(JSON.stringify(data));
			// add data
			for (var row=1; row<=data.length; row++) {
				for (var col=1; col<=keys.length; col++) {
					var string = String(data[row-1][keys[col-1]]);
					console.log(row+1 + ', ' + col + ":" + keys[col-1] + ' = ' + string);
					ws.cell(row+1, col).string(string).style(myStyle);
					console.log('next...');
				}
			}
			// ws.cell(1,1).number(100).style(style);
	 
			// Set value of cell B1 to 300 as a number type styled with paramaters of style 
			// ws.cell(1,2).number(200).style(style);
			 
			// Set value of cell C1 to a formula styled with paramaters of style 
			// ws.cell(1,3).formula('A1 + B1').style(style);
			 
			// Set value of cell A2 to 'string' styled with paramaters of style 
			// ws.cell(2,1).string('string').style(style);
			 
			console.log('added data...'); 
			var user = 'generic';

			if (!filename) { 
				var timestamp = String(new Date());			
				filename = 'Dump.' + user + '.' + timestamp + '.xlsx'
			}
			else {
				if (!filename.match(/\.xlsx?/)) {
					filename = filename + '.xlsx';
				}
			}

			var file = path + filename;

			wb.write(file, function (err, stats) { 
				// Writes the file ExcelFile.xlsx to the process.cwd(); 
			
			    if (err) {
			        console.error(err);
			        deferred.reject(err);
			    }
			    else { 
			    	console.log(stats); // Prints out an instance of a node.js fs.Stats object 
					deferred.resolve({file: filename, stats: stats});
				}
			});
		}
		else {
			console.log('no data');
			deferred.reject('empty dataset');
		}

		console.log('wrote');

		return deferred.promise;
		// wb.write('ExcelFile.xlsx', function (err, stats) {
		//     if (err) {
		//         console.error(err);
		//     } 
		//     console.log(stats); // Prints out an instance of a node.js fs.Stats object 
		// });

		// wb.write('ExcelFile.xlsx', data);
	}
}