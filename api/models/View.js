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
  	description: { type: 'text'},
  	active: { 
  		type: 'boolean',
  		defaultsTo: true
  	},
  	condition: {
  		type: 'string'
  	},
  	default_layer: {
  		type: 'string'
  	}
  },

  list : function (view_id) {
  	var deferred = q.defer();

  	var fields = [
  		'view.id', 
  		'view.description as description', 
  		"Group_Concat(distinct concat(view_table.table_name,' AS ',view_table.title) SEPARATOR ', ') as tables", 
  		'view.name as name', 
  		"GROUP_CONCAT(distinct CASE WHEN view_field.type = 'attribute' THEN CONCAT(view_field.field,' AS ',view_field.prompt) ELSE CONCAT(table_name,'.',view_field.field, ' AS ',view_field.prompt) END  SEPARATOR ', ') as fields",
  		'default_layer',
  		"active",
  		"GROUP_CONCAT(DISTINCT CASE WHEN type='attribute' THEN field ELSE null END) as attributes"
  	];

	var query = "Select " + fields.join(', ');
	query += " FROM view, view_table, view_field ";
	query += " WHERE view_table.view_id=view.id and view_field.ref_title=view_table.title and view_field.view_id=view.id";

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

  	if (!options) { options = {} }
  	
  	var fields = options.fields || [];
  	var group  = options.group  || [];
  	var layer  = options.layer  || '';
  	var search = options.search || {};
  	var conditions = options.conditions || []; 
  	var limit = options.limit; 	
  	var condition = options.condition;

  	if (condition) { conditions.push(condition) }

  	var all_conditions = conditions.slice(0);  // shallow clone - includes standard condition + left join conditions

  	var query = "Select * from view_field, view_table where view_field.ref_title=view_table.title AND view_table.view_id = view_field.view_id";
  	if (view_id) { query +=  " AND view_field.view_id = " + view_id }

  	View.list(view_id)
  	.then (function (views) {

  		console.log(JSON.stringify(views));
  		if (views.length) {
	 	  	if (!layer) { 
	 	  		layer = views[0].default_layer
	 	  	}
	 	  	attributes = views[0].attributes.split(/\s*,\s*/);
	 	}

 	  	console.log('Vquery:' + query);
	 	Record.query_promise(query)
		.then ( function (ViewFields) {
	  		console.log("QF: " + JSON.stringify(ViewFields));

	  		var flds  = [];
	  		if (fields && fields.length) {
	  			// ensure mandatory fields included...
	  			// pickF = fields;
	  			flds = fields;
	  		}
	  		else {
	  			// initial setup ... no fields selected yet... 
	  			console.log("prepick...");
	  			for (var i=0; i<ViewFields.length; i++) {
	  				console.log(i + ':' + JSON.stringify(ViewFields[i]));
	  				if (ViewFields[i].pre_picked) {
	  					fields.push(ViewFields[i].field + ' AS ' + ViewFields[i].prompt);
	  					flds.push(ViewFields[i].title + '.' + ViewFields[i].field);
	  				}
	  			} 
	  		}
	  		console.log('picked fields: ' + JSON.stringify(flds));
	  		console.log('default layer: ' + layer);
	  		console.log("view fields: " + JSON.stringify(ViewFields));
	  		console.log('initial conditions: ' + JSON.stringify(conditions));
	  		console.log("*************************************************************");
		  			
  			View.dynamic_join_fields(ViewFields, flds, conditions)
  			.then (function (result) {
  				console.log("dynamically added fields...");
  				console.log("*** DYNAMIC FIELDS ***");
  				console.log(JSON.stringify(result));

  				var lj = [];
  				var tables = [];
  				if (result) {
  					pickF = result.pick;
  					tables = result.tables;
  					lj = result.lj;
  					conditions = result.conditions;
  				}

  				console.log('add conditions...');
	  			View.dynamic_join_conditions(ViewFields, tables, conditions, lj)
	  			.then ( function (Cresult) {
	  				console.log('dynamically added conditions...');
	  				var c = Cresult.conditions || [];
	  				var lj = Cresult.lj || [];
	  				var tables = Cresult.tables || [];

			  		console.log("** Pick: " + JSON.stringify(pickF));
			  		console.log("** Tables: " + JSON.stringify(tables));
			  		console.log("** LJ: " + JSON.stringify(lj));
			  		console.log("** condition: " + JSON.stringify(c));
			  		
			  		var reqd = [];
			  		// var attributes = {};

			  		if (reqd && reqd.length) {
			  			for (var k=0; k<reqd.length; k++) {
			  				pickF.push(reqd[k]);
			  				console.log("add required field: " + reqd[k]);
			  			}
			  		}
			  		var select = "SELECT " + pickF.join(', ') + ' FROM (' + tables.join(', ') + ')';

			  		if (lj.length) { select += " LEFT JOIN " + lj.join(' LEFT JOIN ') }

			  		if (conditions && conditions.length) { select += " WHERE " + conditions.join(' AND ') }

			  		console.log("QUERY: " + select);

			  		// if (layer && layer.length) { select += " GROUP BY " + layer.join(',') }
			  		// ensure layer field is in list of outputs... 
					
					if (limit) { select += " LIMIT " + limit }	  		

					var setup = {view: views[0], query: select, pick: pickF, attributes: attributes, group: group, layer: layer};
			  		console.log("Resolve setup: " + JSON.stringify(setup));
			  		deferred.resolve(setup);

	  			})
	  			.catch ( function (err) {
	  				console.log("Error dynamically adding conditions");
	  				deferred.reject(err);
		  		});
  			})
  			.catch ( function (err) {
  				console.log("Error dynamically adding fields")
  				deferred.reject(err);
	  		});

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

dynamic_join_fields : function (ViewFields, fields, conditions) {

	var deferred = q.defer();
	console.log('dynamically add fields...');
	console.log("** F **" + JSON.stringify(fields));

	var tables = [];
	var lj = [];
	var pickF = [];

	var found = 0;
	for (var i=0; i<fields.length; i++) {
		var fld = fields[i];
		for (var j=0; j<ViewFields.length; j++) {
			var ViewField = ViewFields[j] || {};
			var prompt = ViewField.prompt || ViewField.field;
			if (ViewField.field === fld ||  ViewField.prompt === fld || ViewField.title + '.' + ViewField.field === fld) {
				if (ViewField.type === 'attribute') {
					// fld =  ViewField.field + '.Attribute_Value';
					var primary = ViewField.title + '_ID';

					var attTable = ViewField.title + '_Attribute';

					console.log('left join attribute ' + prompt);
					lj.push('Attribute as ' + ViewField.field + "_Att ON Attribute_Name = '" + ViewField.field + "' AND Attribute_Class = '" + ViewField.table_name + "'");
					lj.push(attTable + " AS " + ViewField.field + " ON " + ViewField.field + ".FK_Attribute__ID=" + ViewField.field + '_Att.Attribute_ID AND FK_' + ViewField.table_name + '__ID=' + ViewField.title + '.' + primary );
					
					pickF.push(ViewField.field + '.Attribute_Value AS ' + ViewField.prompt);
					// console.log("ADD " + ViewField.field + '.Attribute_Value AS ' + ViewField.prompt);
					// attributes[ViewField.field] = ViewField.prompt;

				}
				else {
					pickF.push(ViewField.title + '.' + ViewField.field + ' AS ' + ViewField.prompt);
					console.log("include: " + ViewField.title + '.' + ViewField.field + ' AS ' + ViewField.prompt);
			
					var Tcheck = ViewFields[j].table_name;
					if (ViewFields[j].table_name !== ViewFields[j].title) {
						Tcheck +=  ' AS ' + ViewFields[j].title;
					}

					if (ViewField.left_join) {
						if (tables.indexOf(Tcheck) === -1) {
			  				console.log("** LJ on select **");
			  				lj.push( Tcheck + ' ON ' + ViewField.join_condition);
			  			}
					}
					else {
						if (tables.indexOf(Tcheck)) {
							tables.push(Tcheck);
							console.log("** J on select **");
							if (ViewField.join_condition !== '1') { 
								conditions.push(ViewField.join_condition)
							}
						}
					}
				}
				j = ViewFields.length;	  				
			}
		}
	}

	deferred.resolve({pick: pickF, tables: tables, lj: lj, conditions: conditions});
	return deferred.promise;

  },

  dynamic_join_conditions : function (ViewFields, tables, conditions, lj, add_conditions, add_lj) {
  	var deferred = q.defer();
  	console.log("dynamically adding conditions...");

  	var extra_conditions = [];
  	var extra_lj = [];

  	console.log('t1');
  	if (!add_conditions && !add_lj) {
  	console.log('t2');
  		// initial call...
  		console.log("** Use initial conditions...");
  		if (conditions && conditions.length) { 
  			add_conditions = conditions.slice(0)
  		}
  		else { add_conditions = [] }
  		if (lj && lj.length) {
	  		add_lj = lj.slice(0)
	  	}
	  	else { add_lj = [] }
  	}
  	console.log('t3');
	console.log("Add C: " + add_conditions.join(' AND '));
	console.log("Add LEFT JOIN: " + add_lj.join(' LEFT JOIN '));

  	var all_conditions = [];
  	for (var count=0; count<add_conditions.length; count++) {
  		all_conditions.push(add_conditions[count]);
  	}
  	for (var count2=0; count2<add_lj.length; count2++) {
  		all_conditions.push(add_lj[count2]);
  	}

	for (var i=0; i<all_conditions.length; i++) {
		for (var j=0; j<ViewFields.length; j++) {
			
			var Tcheck = ViewFields[j].table_name;
			if (ViewFields[j].table_name !== ViewFields[j].title) {
				Tcheck +=  ' AS ' + ViewFields[j].title;
			}
			var condition = all_conditions[i] || '';

			if (ViewFields[j].type === 'attribute') {
				Tcheck = ViewFields[j].field + '.Attribute_Value';
			}

			var test_match = ViewFields[j].title + '.';

			if ( ViewFields[j].type == 'field' && condition.match(test_match)) {
				console.log('** Matched ' + ViewFields[j].title + ' to ' + condition);
				if (ViewFields[j].left_join) {
					if (lj.indexOf(Tcheck + ' ON ' + ViewFields[j].join_condition) === -1) {	
	  					console.log("** LJ on condition **");

	  					lj.push( Tcheck + ' ON ' + ViewFields[j].join_condition)
	  					extra_lj.push( Tcheck + ' ON ' + ViewFields[j].join_condition)
	  				}
	  			}
	  			else {
	  				if (tables.indexOf(Tcheck) === -1) {
						tables.push(Tcheck)
						if (ViewFields[j].join_condition !== '1') { 
							conditions.push(ViewFields[j].join_condition);
							extra_conditions.push(ViewFields[j].join_condition);
						}
					}
				}
			}
		}
	}
	
	if (extra_conditions.length || extra_lj.length) {
		console.log("rerun using extra conditions...");
		console.log('c+: ' + extra_conditions.join(', '));
		console.log('lj: left join ' + extra_lj.join(' LEFT JOIN '));

		View.dynamic_join_conditions(ViewFields, tables, conditions, lj, extra_conditions, extra_lj)
		.then ( function (result) {
			deferred.resolve(result)
		})
	}
	else {
		deferred.resolve({ conditions: conditions, lj: lj, tables: tables });
	}
	
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
	  	var attributes = setup.attributes;

  		if (query) {
			Record.query_promise(query)
			.then ( function (result) {
				deferred.resolve({data: result, setup: setup});
			})
			.catch ( function (err) {
				console.log('error with query ?' + err);
				deferred.reject({error: err, query: query, message: 'query error'});
			})
		}
		else {
			console.log('no query in report ?')
			deferred.resolve({data: [], query: '', layer: layer, attributes: attributes});
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
					ws.cell(row+1, col).string(string).style(myStyle);
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
	},

	parse_conditions: function (conditions) {

		sails.log.debug(JSON.stringify(conditions));
		if (conditions && conditions.constructor === Object) {
			var c = [];
			var keys = Object.keys(conditions);
			for (var i=0; i<keys.length; i++) {
				var search = conditions[keys[i]];

				if (search.length) {
					var operator_test = /^[<>=]/;
					var range_test = /^(\d+)\s*\-\s*(\d+)$/;
					var wild_test = /\*/;
					var list_test = /\n/;

					if (search.match(operator_test)) {
						c.push(keys[i] + ' ' + search);  // eg feild "< 10"
					}
					else if (search.match(range_test)) {
						var cond = search.replace(range_test, ' BETWEEN $1 AND $2');
						c.push(keys[i] + cond); // eg field "1 - 3"
					}
					else if (search.match(wild_test)) { 
						var ss = search.replace('*','%');
						c.push(keys[i] + ' LIKE "' + ss + '"');
					}
					else if (search.match(list_test)) {
						var list = search.split(list_test);
						var csv = list.join('","');
						c.push(keys[i] + ' IN ("' + csv + '")');
					}
					else {
						c.push(keys[i] + ' = "' + search + '"');
					}
				}
			}
			console.log("C: " + c.join(' AND '));
			return c;
		}
		else if (conditions && conditions.constructor === String) {
			return [conditions];
		}
		else {
			return conditions;
		}
	},

	cast2array: function (input) {
		if (input && input.constructor === String) {
			input = input.split(/,\s*/);
		}
		else if (input && input.constructor === Object) {
			var keys = Object.keys(input);
			var farray = [];
			for (var i=0; i<keys.length; i++) {
				if (input[keys[i]]) {
					farray.push(keys[i]);
				}
			}
			input = farray;
		}
		return input;
	}
}