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
  	name: { 
  		type: 'string',
  		unique: true
  	},
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
	query += " FROM view, view_table LEFT JOIN view_field ON view_field.view_table_id=view_table.id";
	query += " WHERE view_table.view_id=view.id";

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

  initialize : function (view_id) {
  	var deferred = q.defer();

 	View.list(view_id)
  	.then (function (views) {

  		var view = views[0]
  		var query = "Select * from view_table LEFT JOIN view_field ON view_table.id = view_field.view_table_id";
  		query +=  " WHERE view_table.view_id = " + view_id;

	 	Record.query_promise(query)
		.then ( function (ViewFields) {

	  		var all_fields = [];
	  		var prepicked = [];
	  		var attributes = [];
	  		var prompts = {};
  			
  			for (var i=0; i<ViewFields.length; i++) {
				var f;
				switch (ViewFields[i].type) {
					case 'field':  
						f = ViewFields[i].title + '.' + ViewFields[i].field;
						break;
					case 'attribute':
						f = ViewFields[i].field + '.Attribute_Value';
						break;
					case 'sql':
						f = ViewFields[i].field;
						break;
					default: 
						console.log(ViewFields[i].type + ' type not recognized');
				}

				if (f) {

  					all_fields.push(f + ' AS ' + ViewFields[i].prompt);

  					prompts[ViewFields[i].prompt] = f;

  					if (ViewFields[i].pre_picked) {
  						prepicked.push(ViewFields[i].prompt);
  					}

  					if (ViewFields[i].type === 'attribute') {
  						attributes.push(ViewFields[i].prompt);
  					}
  				}
  			} 

  			view.fields = all_fields;
  			view.prepicked = prepicked;
  			view.prompts   = prompts;
  			view.field_data = ViewFields;
  			view.attributes = attributes;

			console.log("*************************************************************");
			console.log("* all fields: " + JSON.stringify(view.fields));
			console.log('* picked fields: ' + JSON.stringify(view.prepicked));
			console.log('* default layer: ' + view.layer);
			console.log("* view fields: " + JSON.stringify(view.field_data));

			console.log('* prompts: ' + JSON.stringify(view.prompts));
			console.log("*************************************************************");

  			deferred.resolve(view);
  		})
  		.catch ( function (err) {
  			console.log("Error initializing view");
  			deferred.reject(err);
  		});
  	})
  	.catch ( function (err) {
  		console.log('error getting list');
  		deferred.reject(err);
  	})

	return deferred.promise;
  },

  setup : function (view, options) {
 	var deferred = q.defer();
  	console.log('setup');
  	console.log(JSON.stringify(options));

  	if (!options) { options = {} }
  	var select = options.select || view.prepicked;
  	var group  = options.group  || [];
  	var layer  = options.layer  || '';
  	var search = options.search || {};
  	var conditions = options.conditions || []; 
  	var limit = options.limit; 	
  	var condition = options.condition;

  	var add_conditions = View.parse_search_conditions(view, search);
  	if (add_conditions) { 
  		for (var i=0; i<add_conditions.length; i++) {
  			conditions.push(add_conditions[i])
  		}
  	}

  	if (condition) { conditions.push(condition) }

  	var all_conditions = conditions.slice(0);  // shallow clone - includes standard condition + left join conditions

	View.dynamic_join_fields(view.field_data, select, conditions)
	.then (function (result) {
		console.log("*** Dynamically Adjusted for fields ***");
		console.log("* tables: " + JSON.stringify(result.tables))
		console.log("* fields : " + JSON.stringify(result.pick));
		console.log("* conditions: " + JSON.stringify(result.conditions));
		console.log("* lj: " + JSON.stringify(result.lj));

		console.log(JSON.stringify(result));

		var lj = [];
		var tables = [];
		if (result) {
			pickF = result.pick;
			tables = result.tables;
			lj = result.lj;
			conditions = result.conditions;
		}

		View.dynamic_join_conditions(view.field_data, tables, conditions, lj)
		.then ( function (Cresult) {
			var c = Cresult.conditions || [];
			var lj = Cresult.lj || [];
			var tables = Cresult.tables || [];

			console.log("*** FINAL Conditions ***");
	  		console.log("** Tables: " + JSON.stringify(tables));
	  		console.log("** LJ: " + JSON.stringify(lj));
	  		console.log("** condition: " + JSON.stringify(c));
			console.log('********************************************');
	  		
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

	  		console.log("***** QUERY *****");
	  		console.log(select);
	  		console.log("*****************")

	  		// if (layer && layer.length) { select += " GROUP BY " + layer.join(',') }
	  		// ensure layer field is in list of outputs... 
			
			var setup = {view: view, query: select, pick: pickF, group: group, layer: layer, extra_conditions: add_conditions};

	  		deferred.resolve(setup);

		})
		.catch ( function (err) {
			console.log("Error dynamically adding conditions");
			console.log(err);
			deferred.reject(err);
		});
	})
	.catch ( function (err) {
		console.log("Error dynamically adding fields")
		console.log(err);
		deferred.reject(err);
	});

  	return deferred.promise;
  },

dynamic_join_fields : function (ViewFields, select, conditions) {

	var deferred = q.defer();
	console.log('dynamically add fields...');
	console.log("** F **" + JSON.stringify(select));

	var tables = [];
	var lj = [];
	var pickF = [];

	var found = 0;
	for (var i=0; i<select.length; i++) {

		var fld = select[i];
		var full_fld = select[i].match(/ AS (.*)/);
		if (full_fld && full_fld.length) {
			fld = full_fld[1];
		}
		for (var j=0; j<ViewFields.length; j++) {
			var ViewField = ViewFields[j] || {};
			var prompt = ViewField.prompt || ViewField.field;
			if (ViewField.field === fld ||  ViewField.prompt === fld || ViewField.title + '.' + ViewField.field === fld) {
				if (ViewField.type === 'attribute') {
					// fld =  ViewField.field + '.Attribute_Value';
					var primary = ViewField.table_name + '_ID';


					console.log('left join attribute ' + prompt);
					var VF = ViewField.field;
					var VFA = ViewField.table_name + '_Attribute';

					var VF_cond = 'Attribute as ' + VF + "_Att ON " + VF + "_Att.Attribute_Name = '" + VF;
					VF_cond += "' AND " + VF + "_Att.Attribute_Class = '" + ViewField.table_name + "'";
		
					var VFA_cond = VFA + " AS " + VF + " ON " + VF + ".FK_Attribute__ID=" + VF + '_Att.Attribute_ID';
					VFA_cond += ' AND ' + VF + '.FK_' + ViewField.table_name + '__ID=' + ViewField.title + '.' + primary;

			  		if (lj.indexOf(VF_cond) === -1) {
						lj.push(VF_cond);
					}
			  		
			  		if (lj.indexOf(VFA_cond) === -1) {
						lj.push(VFA_cond);
					}
					// lj.push(VF_cond);
					// lj.push(VFA_cond);
					
					pickF.push(VF + '.Attribute_Value AS ' + ViewField.prompt);
					// console.log("ADD " + ViewField.field + '.Attribute_Value AS ' + ViewField.prompt);
					// attributes[ViewField.field] = ViewField.prompt;

				}
				else if (ViewField.type === 'field') {
					pickF.push(ViewField.title + '.' + ViewField.field + ' AS ' + ViewField.prompt);
					console.log("include: " + ViewField.title + '.' + ViewField.field + ' AS ' + ViewField.prompt);
			
					var Tcheck = ViewFields[j].table_name;
					if (ViewFields[j].table_name !== ViewFields[j].title) {
						Tcheck +=  ' AS ' + ViewFields[j].title;
					}

					if (ViewField.left_join) {
						if (tables.indexOf(Tcheck) === -1) {
			  				var ljf =  Tcheck + ' ON ' + ViewField.join_condition;
			  				if (lj.indexOf(ljf) === -1) {
			  					lj.push(ljf);
				  				console.log("** LJ " + ljf + " **");
			  				}
			  			}
					}
					else {
						if (tables.indexOf(Tcheck) === -1) {
							tables.push(Tcheck);
							if (ViewField.join_condition !== '1') { 
								conditions.push(ViewField.join_condition)
								console.log("** Join " + Tcheck + " **");
							}
						}
					}
				}
				else if (ViewField.type === 'sql') {
					var F = ViewField.field + ' AS ' + ViewField.prompt;
					pickF.push(F);
					// table ref can be anything included... 
					console.log('add sql explicit field: ' + F);
				}
				else {
					console.log("unrecognized view_field type: " + ViewField.type);
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

  	var extra_conditions = [];
  	var extra_lj = [];

  	if (!add_conditions && !add_lj) {
  		// initial call...
  		if (conditions && conditions.length) { 
  			add_conditions = conditions.slice(0);
  		}
  		else { add_conditions = [] }
  		if (lj && lj.length) {
	  		add_lj = lj.slice(0)
	  	}
	  	else { add_lj = [] }
  	}

  	var titles = _.pluck(ViewFields, 'title');

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
				// Irrelevant? ... attributes not accounted for below ... 
				Tcheck = ViewFields[j].field + '.Attribute_Value';
			}

			var test_match = new RegExp( '\\b' + ViewFields[j].title + '\\.');

			if ( ViewFields[j].type != 'attribute' && condition.match(test_match)) {
				console.log('*** Confirm inclusion of ' + ViewFields[j].title + ' for ' + condition);
				if (ViewFields[j].left_join) {
					var add_lj = Tcheck + ' ON ' + ViewFields[j].join_condition
					if (lj.indexOf(add_lj) === -1) {	
	  					console.log("** LJ: " + add_lj);

	  					lj.push(add_lj);
	  					extra_lj.push(add_lj)
	  				}
	  			}
	  			else {
	  				if (tables.indexOf(Tcheck) === -1) {
	  					console.log("** Join: " + Tcheck);
	  					console.log(Tcheck);

						tables.push(Tcheck)
						if (ViewFields[j].join_condition !== '1') { 
							conditions.push(ViewFields[j].join_condition);
							extra_conditions.push(ViewFields[j].join_condition);
						}
						continue;
					}
				}
			}
		}
	}
	
	if (extra_conditions.length || extra_lj.length) {
		console.log('** Intermediate Additions **: ');
		console.log(JSON.stringify(extra_conditions));
		console.log(JSON.stringify(extra_lj));

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

  generate : function (view, options) {
	var deferred = q.defer();
  	if (!options) { options = {} }

  	console.log("\n** Generate: " + JSON.stringify(options));

  	View.setup(view, options)
  	.then (function (setup) {  		
  		var view  = setup.view;
  		var query = setup.query;
	  	var layer  = setup.layer;

	  	console.log("Generating query: " + query);
  		if (query) {
			Record.query_promise(query)
			.then ( function (result) {
				deferred.resolve({data: result, setup: setup, query: query});
			})
			.catch ( function (err) {
				console.log('error with query ?' + err);
				deferred.reject({error: err, query: query, message: 'query error'});
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
  	var layer    = options.layer;
  	var path     = options.path || './excel/';

  	var deferred = q.defer();

	console.log('save data to excel');
	// console.log(JSON.stringify(data));

	var wb = new xl.Workbook();

	// Create a reusable style 
	var data_style = wb.createStyle({
	    font: {
	        color: '333333',
	        size: 14
	    }
	});

	var header_style = wb.createStyle({
	    font: {
	        color: '3333ff',
	        size: 12
	    }
	});

	var sheetname = 'Results';
	var sheets = [];
	var layered_data;

	if (layer) {
		layered_data = {};
		
		layers = _.uniq(_.pluck(data, layer));
		layers.sort(function(a, b){ return a-b });

		sheetname = layers[0];

		for (var i=0; i<layers.length; i++) {
			var layername = layers[i];
			var title = layer + ': ' + layername;
			sheets.push( wb.addWorksheet(title) );
			layered_data[layername] = [];
		}

		for (var x=0; x<data.length; x++) {
			var layername = data[x][layer];
			var rowdata = Object.assign({}, data[x]);

			layered_data[layername].push(rowdata);
		}
	}
	else {
		sheets.push(wb.addWorksheet(sheetname));
	}

	for (var s=0; s<layers.length; s++) {
		var ldata;
		var layername = layers[s];
		if (layered_data) {
			ldata = layered_data[layername];
			console.log(layername + ': ' + ldata.length + ' records');
		}
		else {
			ldata = data;
		}


		if (ldata && ldata.length) {
			var keys = Object.keys(ldata[0]);

			// add headers
			for (var col=1; col<=keys.length; col++) {
				sheets[s].cell(1,col).string(keys[col-1]).style(header_style);
			}

			// add data
			for (var row=1; row<=ldata.length; row++) {
				for (var col=1; col<=keys.length; col++) {
					var string = String(ldata[row-1][keys[col-1]]);
					sheets[s].cell(row+1, col).string(string).style(data_style);
				}
			}
		}
		else {
			console.log('no data for sheet ' + s);
		}
	}		

	if (sheets.length) {
		console.log('added data...'); 
		var user = 'thisuser';

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
		    	console.log('wrote to file:' + file);
		    	console.log(stats); // Prints out an instance of a node.js fs.Stats object 
				deferred.resolve({file: filename, stats: stats});
			}
		});
	}
	else {
		console.log("empty dataset");
		deferred.reject('empty dataset');
	}

	return deferred.promise;
	// wb.write('ExcelFile.xlsx', function (err, stats) {
	//     if (err) {
	//         console.error(err);
	//     } 
	//     console.log(stats); // Prints out an instance of a node.js fs.Stats object 
	// });

	// wb.write('ExcelFile.xlsx', data);
  },

	parse_search_conditions: function (view, search_input) {

		sails.log.debug("** Parse conditions: " + JSON.stringify(search_input));

		if (search_input && search_input.constructor === Object) {
			var c = [];
			var keys = Object.keys(search_input);
			for (var i=0; i<keys.length; i++) {
				var fld = keys[i];

				var search = search_input[fld];
				
				if (view && view.prompts && view.prompts[fld]) {
					console.log('convert ' + fld + ' to ' + view.prompts[fld]);
					fld = view.prompts[fld];
				}
				else {
					console.log(fld + ' not in prompt list');
				}

				// var type;
				// var findex = _.pluck(view.field_data, 'prompt').indexOf(fld);
				// if (findex >=0) {
				// 	type = view.field_data[findex].field_type;
				// 	console.log("field type: ' + type);
				// }
				// else {
				// 	console.log("type undetermined... could not find " + fld + ' prompt in view specs')
				// }

				if (search && search.length) {
					var operator_test = /^[<>=]/;
					var range_test = /^(\d+)\s*\-\s*(\d+)$/;
					var wild_test = /\*/;
					var list_test = /\n/;

					if (search.match(operator_test)) {
						if (search.match(/^\d\d\d\d\-\d\d/)) {
							search = "'" + search + "'";   // quote dates... 
						}
						c.push(fld + ' ' + search);  // eg feild "< 10"
					}
					else if (search.match(range_test)) {
						var cond = search.replace(range_test, " BETWEEN '$1' AND '$2'");

						// if (type.match(/date/)) {
						// 	cond = search.replace(range_test, " BETWEEN '$1' AND '$2'");
						// }
						c.push(fld + cond); // eg field "1 - 3"
					}
					else if (search.match(wild_test)) { 
						var ss = search.replace('*','%');
						c.push(fld + ' LIKE "' + ss + '"');
					}
					else if (search.match(list_test)) {
						var list = search.split(list_test);
						var csv = list.join('","');
						c.push(fld + ' IN ("' + csv + '")');
					}
					else {
						c.push(fld + ' = "' + search + '"');
					}
				}
			}
			console.log("** Parsed Search Condition: " + c.join(' AND '));
			return c;
		}
		else if (search_input && search_input.constructor === String) {
			console.log('string search ?')
			return [search_input];
		}
		else {
			console.log('array of search criteria ?');
			return search_input;
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