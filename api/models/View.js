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
  	condition: {
  		type: 'string'
  	},
  },

  list : function (view_id) {
  	var deferred = q.defer();

  	var fields = [
  		'custom_view.id', 
  		'view.description as description', 
  		"Group_Concat(distinct concat(view_table.table_name,' AS ',view_table.title) SEPARATOR ', ') as tables", 
  		'view.name as name', 
  		'custom_view.custom_name as custom_name',
  		"GROUP_CONCAT(distinct CASE WHEN view_field.type = 'attribute' THEN CONCAT(view_field.field,' AS ',view_field.prompt) ELSE CONCAT(table_name,'.',view_field.field, ' AS ',view_field.prompt) END  ORDER BY display_order SEPARATOR ', ') as fields",
  		'default_layer',
  		"active",
  		"GROUP_CONCAT(DISTINCT CASE WHEN type='attribute' THEN field ELSE null END) as attributes",
  		"GROUP_CONCAT(DISTINCT CASE WHEN custom_view_setting.pre_picked THEN view_field.prompt ELSE '' END ORDER BY custom_view_setting.display_order, view_field.prompt) as picked",
  		"GROUP_CONCAT(DISTINCT CASE WHEN LENGTH(custom_view_setting.default_search)>0 THEN CONCAT(view_field.prompt,'=',custom_view_setting.default_search)  ELSE '' END) as default_search"
  	];

	var query = "Select " + fields.join(', ');
	query += " FROM (view, custom_view, view_table, view_field)";
	query += " LEFT JOIN custom_view_setting ON view_field.id=view_field_id and custom_view_id=custom_view.id"
	query += " WHERE custom_view.view_id=view.id AND view_table.view_id=view.id AND view_field.view_table_id=view_table.id";

	if (view_id) { query += " AND custom_view.id = " + view_id }

	query += " GROUP BY view.id, custom_view.id";
	query += " ORDER by view.name, custom_view.custom_name, custom_view_setting.display_order, view_field.prompt";


	console.log("*** " + query);

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

  		if (views && views.length) {
	  		var view = views[0]
	  		var query = "Select * from (custom_view, view_table)";
	  		query += " LEFT JOIN view_field ON view_table.id = view_field.view_table_id";
	  		query += " LEFT JOIN custom_view_setting ON view_field_id = view_field.id and custom_view_id=custom_view.id";
	  		query +=  " WHERE custom_view.view_id = view_table.view_id AND custom_view.id = " + view_id;
	  		query += " AND prompt IS NOT NULL";
	  		query += " ORDER BY custom_view.id, custom_view_setting.display_order, view_field.prompt";

	  		console.log('initialize query: ' + query);
		 	Record.query_promise(query)
			.then ( function (ViewFields) {

		  		var all_fields = [];
		  		var prepicked = [];
		  		var attributes = [];
		  		var prompts = {};
	  			
	  			console.log(JSON.stringify(ViewFields));

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
				console.log("* view fields: " + JSON.stringify(view.field_data[0]) + ' ...');
				console.log('* prompts: ' + JSON.stringify(view.prompts));
				console.log("*************************************************************");

	  			deferred.resolve(view);
	  		})
	  		.catch ( function (err) {
	  			console.log("Error initializing view");
	  			deferred.reject(err);
	  		});
	  	}
	  	else {
	  		console.log('no views available');
	  		deferred.reject('no views');
	  	}
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
  	var limit = options.limit || 1000; 	
  	var condition = options.condition;

  	if (condition) { conditions.push(condition) }

  	var add_conditions = View.parse_search_conditions(view, search);
  	if (add_conditions) { 
  		for (var i=0; i<add_conditions.length; i++) {
  			conditions.push(add_conditions[i])
  		}
  	}

  	var initial_conditions = conditions.slice(0);  // shallow clone - includes standard condition + left join conditions

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

	  		if (limit) { select += " LIMIT " + limit }

	  		console.log("***** QUERY *****");
	  		console.log(select);
	  		console.log("*****************")

	  		// if (layer && layer.length) { select += " GROUP BY " + layer.join(',') }
	  		// ensure layer field is in list of outputs... 
			
			var setup = {view: view, query: select, pick: pickF, group: group, layer: layer, extra_conditions: initial_conditions};

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

					if (ViewField.join_condition.match(/Attribute_Value/)) {

						var scope = ViewField.scope; /* necessary only for Lookup tables referenced by attribute */
						var scope_model = scope;

						for (var k=0; k<tables.length; k++) {
				  			if (tables[k].match(scope)) {
				  				var reg = RegExp('(\\w+) AS ' + scope);
				  				var check = tables[k].match(reg);
				  				scope_model = check[1];
				  				console.log("** CHECKED " + JSON.stringify(check));
				  				k = tables.length;
				  			}
				  		}

						if (scope) {
							console.log("** DYNAMICALLY ADD ID Field for " + ViewField.prompt);

							var VF = ViewField.table_name;  /* special case for Attributes which are FK to lookup table */
							var VFA = scope_model + '_Attribute';                        /* need to add attribute to enable link to lookup table */

							var VF_cond = 'Attribute as ' + VF + "_Att ON " + VF + "_Att.Attribute_Name = '" + VF;
							VF_cond += "' AND " + VF + "_Att.Attribute_Class = '" + scope_model + "'";
				
							var VFA_cond = VFA + " AS " + VF + " ON " + VF + ".FK_Attribute__ID=" + VF + '_Att.Attribute_ID';
							VFA_cond += ' AND ' + VF + '.FK_' + scope_model + '__ID=' + scope + '.' + primary;

					  		if (lj.indexOf(VF_cond) === -1) { lj.push(VF_cond) }
					  		if (lj.indexOf(VFA_cond) === -1) { lj.push(VFA_cond) }
						}
						else {
							console.log("*** Error determining Attribute Class - add class to join condition **");
						}


					}

					var selectField = ViewField.title + '.' + ViewField.field;

					if (ViewField.field_type && ViewField.field_type.match(/time/i) ) {
						selectField = "LEFT(" + selectField + ",16)"
					} 
					else if (ViewField.field_type && ViewField.field_type.match(/date/i) ) {
						selectField = "LEFT(" + selectField + ",10)"
					}

					pickF.push(selectField + ' AS ' + ViewField.prompt);
					console.log("include: " + selectField + ' AS ' + ViewField.prompt);
			
					var Tcheck = ViewFields[j].table_name;
					if (ViewFields[j].table_name !== ViewFields[j].title) {
						Tcheck +=  ' AS ' + ViewFields[j].title;
					}

					if (ViewField.left_join) {
						if (tables.indexOf(Tcheck) === -1) {
			  				var ljf =  Tcheck + ' ON ' + ViewField.join_condition;
			  				if (lj.indexOf(ljf) === -1) {
			  					lj.push(ljf);
				  				console.log("** LJf " + ljf + " **");
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
				if (ViewFields[j].left_join) {
					var add_lj = Tcheck + ' ON ' + ViewFields[j].join_condition
					if (lj.indexOf(add_lj) === -1) {	
	  					console.log("** LJc: " + add_lj);

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
  	var payload  = options.payload;

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

	var sheets = [];
	var layered_data;
	var layers;

	console.log("*** DATA ***");
	console.log(JSON.stringify(data));
	console.log("*********");
	// if (!layer) {
	// 	layer = 'Data Results';
	// 	data = { 'Data Results' : data }
	// }

	if (layer) {
		console.log('layer by ' + layer);
		layered_data = {};
		
		layers = _.uniq(_.pluck(data, layer));
		layers.sort(function(a, b){ return a-b });

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
		console.log('no layering');
		layers = ['Data Results'];
		sheets.push(wb.addWorksheet(layers[0]));
	}

	for (var s=0; s<layers.length; s++) {
		var ldata;
		var layername = layers[s];
		console.log('layer: ' + layername);
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

		var user = '';
		if (payload && payload.user) {
			user = payload.user;
		}

		if (!filename) { 
			var timestamp = String(new Date());			
			filename = 'Report.' + user + '.' + timestamp + '.xlsx'
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
				var prompt = keys[i];

				var search = search_input[fld];
				
				if (view && view.prompts && view.prompts[fld]) {
					// console.log('convert ' + fld + ' to ' + view.prompts[fld]);
					fld = view.prompts[fld];
				}
				else {
					console.log(fld + ' not in prompt list');
				}

				var type;
				var findex = _.pluck(view.field_data, 'prompt').indexOf(prompt);
				if (findex >=0) {
					type = view.field_data[findex].field_type;
					console.log(fld + ' type: ' + type);
				}
				else {
					console.log('type undetermined... could not find ' + prompt + ' prompt in view specs')
				}

				if (search && search.length) {
					var date_operator_test = /^([<>]\=?)\s*(\d\d\d\d\-\d\d.*)/;
					var val_operator_test = /^[<>]\=?/;
					var range_test = /^(\d+\.?\d*)\s*\-\s*(\d+\.?\d*)\s*$/;  // allow float range or dates 
					var date_range_test = /^['"]?(\d\d\d\d-\d\d[\s\-\d\\:]+)['"]?\s*\-\s*['"]?(\d\d\d\d-\d\d[\s\-\d\\:]+)['"]?\s*$/;  // allow float range or dates 
					var wild_test = /\*/g;

					if (search.constructor === Array) {
						var csv = search.join('","');
						c.push(fld + ' IN ("' + csv + '")');
					}
					else {
					
						if (search.match(date_operator_test)) {
							cond = search.replace(date_operator_test, " $1 '$2'");
							c.push(fld + ' ' + cond);  // eg feild "< 10"
							console.log("adding quotes to date operation: " + cond);
						}
						else if (search.match(val_operator_test)) {
							c.push(fld + ' ' + search);  // eg feild "< 10"
							console.log("standard operator: " + search);
						}
						else if (search.match(range_test)) {
							var cond = search.replace(range_test, " BETWEEN '$1' AND '$2'");
							c.push(fld + cond); // eg field "1 - 3"
						}
						else if (search.match(date_range_test)) {
							var cond = search.replace(date_range_test, " BETWEEN '$1' AND '$2'");
							c.push(fld + cond); // eg field "1 - 3"
						}
						else if (search.match(wild_test)) { 
							var ss = search.replace(wild_test,'%');
							c.push(fld + ' LIKE "' + ss + '"');
						}
						// else if (search.match(list_test)) {
						// 	var list = search.split(list_test);
						// 	var csv = list.join('","');
						// 	c.push(fld + ' IN ("' + csv + '")');
						// }
						else {
							c.push(fld + ' = "' + search + '"');
						}
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
	},

	save: function (custom_name, options, payload) {
		if (!options) { options = {} }

		var deferred = q.defer();

		var select    = options.select || [];
		var search    = options.search || {};
		var default_layer     = options.layer;
		var condition = options.condition;
		var view_id   = options.view_id;
		var custom_id = options.custom_id;

		var overwrite = options.overwrite;

		var field_ids = {};
		console.log('Save view: ' + custom_name + ' : ' + custom_id);
		console.log(JSON.stringify(options));


		var promises = [Record.query_promise('Select view_field.id, prompt from view_field, view_table where view_table_id=view_table.id AND view_id = ' + view_id)];
		if (custom_id) {
			console.log("delete previous settings");
			promises.push(Record.delete_record('custom_view_setting', custom_id, 'custom_view_id', payload) )

			promises.push(Record.update('custom_view',custom_id, {default_layer: default_layer}, {}, payload));

			id = options.custom_view_id;
		}
		else {
			console.log("generate new custom_view");
			var record =  {custom_name: custom_name, view_id: view_id, active: true, default_layer: default_layer};
			promises.push(Record.createNew('custom_view',record, null, payload))
		}

		q.all(promises)
		.then ( function (result) {
			console.log("save PROMISE: " + JSON.stringify(result));			var vf = result[0];
			
			for (var i=0; i<vf.length; i++) {
				var prompt = vf[i].prompt;
				var vf_id  = vf[i].id
				field_ids[prompt] = vf_id;
			}
			console.log("parsed vfids: " + JSON.stringify(field_ids));

			if (!custom_id) {
				custom_id = result[1].insertId;
				console.log("created " + custom_id);
			}

			var added = {};
			var settings = [];
			for (var i=0; i<select.length; i++) {
				var prompt = select[i];

				var s = '';
				if (search[prompt] && search[prompt].constructor === Array) { 
					s = search[prompt].join(" | ");
				}
				else if (search[prompt]) { 
					s = search[prompt]; 
				}

				var field_id = field_ids[prompt];
				if (field_id) {
					var setting = { custom_view_id: custom_id, view_field_id: field_id, display_order: i, pre_picked: 1, default_search: s}
					settings.push(setting);
				}
				else {
					console.log("missing field id for " + prompt);
				}
				added[prompt] = 1;
			}

			// add search fields that are not selected if applicable 
			var keys = Object.keys(search);
			for (var i=0; i<keys.length; i++) {
				var prompt = keys[i];
				var s = '';
				if (search[prompt] && search[prompt].constructor === Array) { 
					s = search[prompt].join(" | ");
				}
				else if (search[prompt]) { 
					s = search[prompt]; 
				}

				field_id = field_ids[prompt];
				if (field_id && ! added[prompt]) {
					var setting = { custom_view_id: custom_id, view_field_id: field_id, pre_picked: 0, default_search: s}
					settings.push(setting);
					console.log('searching without retrieval for ' + prompt);
				}
			}

			console.log('add record: ' + JSON.stringify(settings));
			Record.createNew('custom_view_setting', settings, null, payload);
		})
	
		deferred.resolve();

		return deferred.promise;
	}

}