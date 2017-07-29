/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var fs = require('fs');
var _ = require('underscore-node');

module.exports = {

	alias : function (model, alias, options) {
		var Mod = sails.models[model] || {};

		if (!options) { options = {} }

		var map = Mod.alias || Mod.legacy_map || {};

		if (map && map[alias]) {
			// console.log("alias : " + map[alias]);
			return map[alias];
		}
		else { return alias }
	},

	unalias : function (model, alias) {
		var Mod = sails.models[model] || {};
		var map = Mod.alias || Mod.legacy_map || {};
		
		var keys = Object.keys(map);

		var found = '';
		for (var i=0; i<keys.length; i++) {
			if (map[keys[i]] === alias) {
				found = map[keys[i]];
			}
		}
		return found;
	},
	
	rejected_promise : function (msg) {
		var deferred = q.defer();
		deferred.reject(msg);
		return deferred.promise;
	},

	validate : function (model, options) {
		if ( !options ) { options = {} }
		var deferred = q.defer();

		var ids = options.ids || options.list || [];
		var barcode = options.barcode;
		var attribute = options.attribute;
		var field     = options.field;
		var value     = options.value;
		var condition = options.condition || [];
		var grid      = options.grid;
			 	
		var conditions = [];
		var index = [];
		if (options.condition) { conditions.push(options.condition) }
		
		if (grid) {
			ids = []; 
			var rows = Object.keys(grid);
			console.log('read ' + rows.length + ' rows from grid');

			for (var i=0; i<rows.length; i++) {
				ids.push(grid[rows[i]]);				
				index.push(rows[i]);
			}
		}

		console.log("validate: " + ids.join(', '));
		console.log('barcode: ' + barcode);
		console.log("attribute: " + attribute);
		console.log('field: ' + field);
		console.log('value: ' + value); 

		var Mod = {};
		if (sails && sails.models && sails.models[model]) {
			Mod = sails.models[model];
		}

		var idField = this.alias(model, 'id');
		field = field || idField;

		var table = Mod.tableName || model;
		var prefix = Barcode.prefix(table);
		var regex = new RegExp( prefix, 'i');

		var barcode_ids = [];
		var mapped = {};
		var reverse_mapped;

		var valid = true;

		var select = idField + ' AS id';

		if (ids && ids[0] && ids[0].match(regex)) { 

			reverse_mapped = {};
			// strip prefix from valid barcodes 
			ids = ids.map( function (i) { 
				var id = parseInt(i.replace(regex,''));
				mapped[id] = i;
				reverse_mapped[i] = id;
				return parseInt(id); 
			});

			console.log("Converted barcodes to ids: " + ids.join(', '));
			conditions.push(idField + " IN (" + ids.join(',') + ")");
		}
		else if (barcode && prefix) {
			reverse_mapped = {};
			var list = barcode.split(new RegExp(prefix, 'i'));
			console.log("original barcodes: " + JSON.stringify(list));
			list.shift(); 

			console.log('interpret barcodes: ' + JSON.stringify(list));

			ids = [];
			for (var i=0; i< list.length; i++) {
				if (list[i].match(/[a-zA-Z]/i)) { 
					valid = false;
					i = list.length;
				}
				else {
					var intval = parseInt(list[i]);
					if (intval) { 
						ids.push(intval);
						mapped[intval] = prefix + list[i];
						reverse_mapped[prefix + list[i]] = intval;
					}
				}
			}
			conditions.push(idField + " IN (" + ids.join(',') + ")");
		}
		else if (attribute) {
			console.log("validate based upon " + attribute);
			field = 'Attribute_Value';

			conditions.push("FK_" + table + '__ID = ' + idField);
			conditions.push('Attribute_ID=FK_Attribute__ID');
			conditions.push(field + " IN ('" + ids.join("','") + "')");
			conditions.push("Attribute_Name='" + attribute + "'");

			select = select + ', Attribute_Value as reference';
			table = table + ', Attribute, ' + table + '_Attribute';
		}
		else if (ids && ids.length) {
			// .. okay... 
			conditions.push(idField + " IN (" + ids.join(',') + ")");
		}
		else {
			deferred.reject('nothing to validate');
		}

		if (field === idField) {
			ids = ids.map( function (i) { return parseInt(i) });
		}

		if (! valid || !ids.length) { 
			console.log("no valid " + model + ' ids found');
			deferred.resolve({validated: [], message: 'no valid ids'});
		}
		else {
			var query = "SELECT " + select + " FROM " + table;
			query += " WHERE " + conditions.join(' AND ');

	 		console.log(query);

	 		Record.query_promise(query)
	 		.then ( function (result) {
	 			console.log('validated: ' + JSON.stringify(result));
	 			var excluded = [];

	 			var validated = [];
	 			if (result.length && result[0].reference) {
	 				// revert order of ids to order of reference list supplied
	 				var restored_order = Record.restore_order(result, ids, 'reference');
	 				console.log('restored order : ' + JSON.stringify(validated));
	 				validated = _.pluck(restored_order, 'id') || [];
	 			}
	 			else {
		 			validated = _.pluck(result,'id') || [];

	 			}

	 			if (ids.length !== result.length) {
	 				excluded = _.difference( ids , validated);
	 			}
	 			console.log("Unrecognized: " + JSON.stringify(excluded));
	 			deferred.resolve({'list' : ids, index: index, 'validated' : validated, excluded: excluded, mapped: mapped, reverse_mapped: reverse_mapped});
	 		})
	 		.catch (function(err) {
	 			console.log('validation failed: ' + JSON.stringify(err));
	 			deferred.resolve({'list' : ids, index: index, 'validated' : [], error: err});
	 		});
	 	}

 		return deferred.promise;

	},

	isReference : function (model, field) {

		var Mod = sails.models[model];
		var table = model;
		var fk = {};

		if (Mod) {
			fk = Mod.attributes[field];
			table = Mod.tableName || model;
		}

		if (fk && fk.model) { return fk.model}
		else {
			var match = field.match(/^FK[a-zA-Z]*\_(\w+)\_\_ID/);
			if (match && match.length > 1) { return match[1] }
			else { return false } 
		}
	},

	adjust_volumes : function (model, ids, qty, qty_units, options, payload) {
		// For now assume qty_units are the same (TEMPORARY)
		//
		// ... should account for this by converting units if required or generating error if no units supplied.
		// TEMPORARY
		//

		var deferred = q.defer();

		if (!options) { options = {} }
		var subtract = options.subtract || false;
		var convert  = options.convert;

		if (qty_units.constructor === Array) {
			qty_units = qty_units[0];
		}

		if (qty_units) {
			if (subtract) {
				console.log("Subtract " + JSON.stringify(qty) + qty_units + ' from ' + model + ' ids: ' + JSON.stringify(ids));
			}
			else {
				console.log("Add " + JSON.stringify(qty) + qty_units + ' to ' + model + ' ids: ' + JSON.stringify(ids));
			}


			var qtyField = Record.alias(model, 'qty');
			var unitsField = Record.alias(model, 'qty_units');

			var data= {};
			data[qtyField] = qtyField + ' + ' + parseFloat(qty);

			var Mod = sails.models[model] || {};
			var table = Mod.tableName || model;
			var id_field = Record.alias(model, 'id');

			var promises = [];
			for (var index=0; index< ids.length; index++) {
				var data = {}

				var query = "SELECT " + index + ' as i, ' + unitsField + " as units FROM " + table + " WHERE " + id_field + " = '" + ids[index] + "'";
				Record.query_promise(query)
				.then (function (result) {

					var units = result[0].units;
					var i = result[0].i;

					if (qty[i]) {
						if (subtract) { qty[i] = 0 - parseFloat(qty[i]) }
						else { qty[i] = parseFloat(qty[i]) }
						
						var F = qtyField;
						var V = qty[i];

						if (qty_units !== units) { V = Record.convert_units(V, qty_units, units) }

						var adjust = '<' + qtyField + ' + ' + V + '>';			
						if (V < 0) {
							adjust = "<CASE WHEN " + F + ' + ' + V + ' < ' + F + ' /1000 THEN 0 ELSE ' + F + ' + ' + V + " END>";
						}

						data[qtyField] = adjust;

						promises.push( Record.update(model, ids[i], data, {}, payload) );
					}
					else {
						console.log("Error retrieving qty ?" + i + ' of ' + JSON.stringify(qty));
					}
				})
				.catch (function (err) {
					console.log("Error retrieving units field for " + model + ': ' + ids[i]);
					console.log(index + ': ' + JSON.stringify(ids));
					console.log(query);
				});
			}	

			q.all(promises)
			.then (function (okay) {
				console.log('updated volume(s) for ' + promises.length + ' objects');
				deferred.resolve(okay);
			})
			.catch (function (err) {
				console.log('Error updating volume(s): ' + err);
				deferred.reject(err);
			});
		}
		else {
			console.log('no units supplied');
			deferred.resolve();
		}

		return deferred.promise;
	},

	convert_units : function (qty, from, to) {
        var factor = {
            'l' : 1000,
            'ml' : 1,
            'ul' : 1/1000,
            'nl' : 1/1000000,
        }

        from = from.toLowerCase();
        to   = to.toLowerCase();

        var from_factor = factor[from];
        var to_factor   = factor[to];

        if (from_factor && to_factor) {
            if (from_factor > to_factor ) {
                var intVal = from_factor / to_factor;
                console.log(from_factor + ' / ' + to_factor + ' : ' + intVal);
                return qty * Math.round( intVal );
            }
            else if ( to_factor > from_factor ) {
                var intVal = to_factor / from_factor;
                console.log('inverse of ' + to_factor + ' / ' + from_factor + ' : ' + intVal);
                return qty / Math.round(intVal);
            }
            else {
                return qty;
            }
        }
        else {
            console.log('Error - could not recognize units ' + from_factor + ' or ' + to_factor);
            return  qty;
        }
    },

	dump : function (model, options) {
		if (!options) { options = {} }

		var deferred = q.defer();

		var table = model;
		var primary = 'id';
		
		var N = options.N;
		var id = options.id;
		var ids = options.ids;
		var iterate = options.iterate;

		if (iterate >10) { 
			iterate = 0;
			console.log("Killing iteration after 10 generations... possible circular logic");
		}

		var Mod;

		if (sails && sails.models && sails.models[model]) {
			Mod = sails.models[model]; 
			table = Mod.tableName || model;
			primary = Mod.primaryField || 'id';
			console.log('reset to ' + table + '.' + primary);
		}
		else {
			console.log(model + ' not official model... ignoring ' + table);
			deferred.resolve({});
		}

		var query = "SELECT * FROM " + table;

		if (id) { query = query + " WHERE " + primary + " >= " + id }
		else if (ids) { query = query + " WHERE " + primary + ' IN (' + ids.join(',') + ')' }
		
		if (N) { query = query + " LIMIT " + N }

		console.log("dump query: " + query);
		console.log("iterating through reference records ?: " + iterate);

		Record.query_promise(query)
		.then ( function (result) {
			console.log("R: " + JSON.stringify(result));
			
			var fields = [];
			var Referenced = {};
			var isReference = {};
			if (result.length) {
				fields = Object.keys(result[0]);
				for (var j=0; j<fields.length; j++) {
					// console.log('check for reference from ' + table + '.' + fields[j]);
					var refTable = Record.isReference(model, fields[j]);
					if (refTable) { 
						Referenced[refTable] = [];
						isReference[fields[j]] = refTable;
					}
				}
			}

			for (var i=0; i<result.length; i++) {
				for (var j=0; j<fields.length; j++) {
					if ( isReference[fields[j]] ) {
						var refid = result[i][fields[j]];
						if (refid) {
							Referenced[isReference[fields[j]]].push(refid);
						}
					}	
				}
			}

			console.log('ref tables: ' + JSON.stringify(isReference));
			console.log("Referenced: " + JSON.stringify(Referenced));

			var refs = Object.keys(Referenced);

			var primaryResult = {};
			primaryResult[model] = result;

			var list = primaryResult;

			console.log("retrieved results for " + model);
			console.log(JSON.stringify(list));

			var promises = [];
			for (var i=0; i< refs.length; i++) {
				if (Referenced[refs[i]].length) {
					console.log("append " + refs[i] + ': ' + Referenced[refs[i]]);
					promises.push(Record.dump(refs[i].toLowerCase(), {ids: Referenced[refs[i]], iterate: iterate+1}));
				}
			}

			console.log('executing ' + promises.length + ' Promises...');

			q.all(promises)
			.then ( function (results) {
				if (results.length) {
					console.log('*** subresults: ' + JSON.stringify(results));
					for (var i=0; i<results.length; i++) {
						var models = Object.keys(results[i]);
						console.log("add models : " + models.join(','));
						for (var j=0; j<models.length; j++) {
							if ( ! list[models[j]] ) { list[models[j]] = [] }
							console.log("Add each of : " + JSON.stringify(results[i][models[j]]));
							for (var k=0; k<results[i][models[j]].length; k++) {
								list[models[j]].push(results[i][models[j]][k]);
							}
						}
					}
				}
				else { console.log('no secondary results for ' + model) }

				deferred.resolve(list);
			})
			.catch (function (err) {
				console.log("Error generating results for " + model);
				deferred.reject(err);
			});

		})
		.catch ( function (err) {
			console.log("Error with primary query for " + model);
			console.log(err);
			deferred.reject(err);
		});

		return deferred.promise;
	},

	search : function (options) {
	
		var deferred = q.defer();

		if (!options) { options = {} }
		var scope = options.scope;
		var condition = options.condition || {};
		var search    = options.search || '';

		var foundLength = 0;

		if (! scope ) {
			// Generic Search 
			scope = sails.config.searchScope || {}
		}

		console.log("*** Condition: " + JSON.stringify(condition));
		console.log("*** Scope: " + JSON.stringify(scope));

		var Prefix = Barcode.prefix();
		var models   = Object.keys(Prefix);

		var promises = [];
		var check_models = [];

		var models = Object.keys(scope);
		for (var i=0; i< models.length; i++) {
			var Mod = sails.models[models[i]] || {};
			var table = Mod.tableName || models[i];
			var primaryField = Record.alias(models[i], 'id') || 'id';

			// console.log("primary field for " + models[i] ' = ' + primaryField);

			var fields = scope[models[i]];
			var selectFields = primaryField;


			// if (fields.length) { selectFields = selectFields +  ',' + fields.join(',') }
			var query = "SELECT " + selectFields + " FROM " + table;
			
			var search_condition = condition || 1;
			var add_condition = [];
			for (var j=0; j<fields.length; j++) {
				var field = Record.alias(models[i], fields[j]);
				// console.log("GET " + field + " for " + fields[j] + ' in ' + models[i]);

				if (field === fields[j]) {
					selectFields += ', ' + fields[j];
				}
				else {
					selectFields = selectFields + ', ' + field + ' AS ' + fields[j];
				}

				if (search) { add_condition.push(field + " LIKE '%" + search + "%'") }
			}

			query = "SELECT " + selectFields + " FROM " + table;

			if (Prefix[table] && search) {

				var regex = new RegExp(Prefix[table] + '(\\d+)','ig');
				var found = search.match(regex);

				var regex2 = new RegExp(Prefix[table], 'i');					
				var ids = [];
				if (found) {
					ids = found.map( function(x) {
						foundLength = x.length;
						return x.replace(regex2,'');
					});
				}

				var barcode_ids = ids.join(',');

				if (barcode_ids) {
					add_condition.push(primaryField + ' IN (' + barcode_ids + ')' );
				}
			}

			if (add_condition.length) {	
				search_condition = ' AND (' + add_condition.join(' OR ') + ')';
			}

			if (condition &&  condition.constructor === Object && condition[table] )  { query = query + " WHERE " + condition[table] }
			else if (condition && condition.constructor === String) { query = query + " WHERE " + condition }
			else { query = query + " WHERE 1"}

			if (search_condition) { 
				// only perform search if there is an applicable condition found.. 
				query = query + " AND " + search_condition;
				console.log("\n** Search: " + query);
				promises.push( Record.query_promise(query));
				check_models.push(models[i]);
			}
			else {
				console.log("No Search condition (?)");
			}

		}
			
		console.log(foundLength + ' vs ' + search.length);
		console.log(promises.length + ' promises found');

		var Found = {};
		q.all(promises) 
		.then ( function ( results ) {
			for (var i=0; i<results.length; i++) {
				if (results[i] && results[i].length) {
					Found[check_models[i]] = results[i];
				}
			}
			console.log(" Found: " + JSON.stringify(Found));

			deferred.resolve(Found);
		})
		.catch ( function (err) {
			// Logger.error(err, 'search error', 'remote search');
			console.log("Error searching tables: " + err);
			deferred.reject(err);
		});

		return deferred.promise;
	},

	get_fields : function (table) {		
		var deferred = q.defer();
		var model = table;

		Record.query_promise("desc " + table)
		.then (function (result) {
			if (result.length == 0 ) {
				var e = new Error("no table found");
				deferred.reject(e);
			}
			else {
				/*
				if ( sails.models[model] && sails.models[model]['attributes']['role'] && sails.models[model]['attributes']['role']['xdesc']) {
					console.log('load extra info...' + sails.models[model]['attributes']['role']['xdesc'])
				}
				*/
				var recordModel;
				console.log("check for model: " + model + " : " + table);
				if (sails.models[model]) {
					console.log(model + ' Access: ' + sails.models[model]['access']);
					console.log("MODEL:cp  " + sails.models[model]);
					recordModel = sails.models[model];
				}

				var Fields = [];
				for (var i=0; i<result.length; i++) {
					var fld = result[i]['Field'];
					var type = result[i]['Type'] || 'undefined';
					var options = [];
					var lookup = {};

					console.log("Field: " + fld + ": " + type);
					if (recordModel && recordModel.attributes  && recordModel.attributes[fld]) {
					    if (recordModel.attributes[fld]['type']) {
		                    if (recordModel.attributes[fld]['enum']) {
		                        type = 'enum';
		                      	options = recordModel.attributes[fld]['enum'];
		                    } 
		                    else if (recordModel.attributes[fld]['type'] == 'boolean') {
		                        type = 'boolean';
		                      	//options = recordModel.attributes[fld]['enum'];
		                    }
		                    else if (recordModel.attributes[fld]['type'] === 'int') {
		                    	type = 'number';
		                    }
		                }
		                else if (recordModel.attributes[fld]['collection']) {
		                    type = 'list link';
		                }
		                else if (recordModel.attributes[fld]['model']) {
		                    type = 'lookup';
		                    options.lookup = recordModel.attributes[fld]['model'];
						} 
					}

					if (fld == 'id' || fld == 'createdAt' || fld == 'updatedAt') {
						type = 'Hidden'
					}

					Fields.push({'Field' : fld, 'Type' : type, 'Options' : options, 'Lookup' : lookup});
				}
				deferred.resolve(Fields);								
			}
		})
		.catch ( function (err) {
			deferred.reject(err);
		});

		return deferred.promise;
	},

	reverse_Map : function (map) {
		var keys = Object.keys(map);

		var reverseMap = {};
		for (var i=0; i<keys.length; i++) {
			var key = keys[i];
			var val = map[key];

			reverseMap[val] = key;
		}

		return reverseMap;
	},

	from_Legacy : function (data, map) {
		// gets data in mew format from legacy data format ... 
		var mapped_keys = Object.keys(map);
		var input_keys  = Object.keys(data);

		var reverse_Map = Record.reverse_Map(map);

		var mapped = {};
		for (var i=0; i<input_keys; i++) {
			var legacy_field = input_keys[i];
			var new_field = reverse_Map[legacy_field];

			if (reverse_Map[legacy_field]) {
				mapped[new_field] = data[legacy_field];
			}
			else {
				mapped[legacy_field] = data[legacy_field];
			}
		}


		return mapped;
	},

	to_Legacy : function (data, map) {

		// gets data in legacy format from new data format ... 
		var mapped = {};

		if (map && data) {
			var input_keys  = Object.keys(data);
			var mapped_keys = Object.keys(map);

			for (var i=0; i<input_keys.length; i++) {
				var new_field = input_keys[i];
				var legacy_field = map[new_field];

				if (map[new_field]) {
					mapped[legacy_field] = data[new_field];
				}
				else {
					mapped[new_field] = data[new_field];
				}
			}
		}
		else {
			mapped = data;
		}
		
		return mapped;
	},

// Generic methods 

	insert_Ids : function (result, options) {
		// parse returned value from createNew ...
		if (!options) { options = {} }

		var onDuplicate = options.onDuplicate;

		var id = result.insertId;
		var count = result.affectedRows;
		
		var duplicates = Record.insert_Duplicates(result, options);
		if (duplicates) {
			count = count - duplicates;
			console.log('remove ' + duplicates + ' duplicates from record count... ');
		}

		var ids = [];
		for (var i=0; i<count; i++) {
			ids.push(id++);
		}
		return ids;
	},

	insert_Duplicates : function (result, options) {
		// parse returned value from createNew ...
		if (!options) { options = {} }

		var onDuplicate = options.onDuplicate;

		var duplicates = 0;
		if (result.message) {
			var dups = result.message.match(/Duplicates: (\d+)/);
			if (dups) { duplicates = parseInt(dups[1]) }
		}

		return duplicates;
	},

	restore_order : function (data, list, ref) {
		//
		// Input:
		//   data - array of hashes
		//   list - original list (the order of which you want to preserve)
		//   ref - [defaults to 'id'] - the reference key in the hashes corresponding to the values supplied in 'list' 
		//
		// sorts array of hashes into an order based upon an original list that is included in the hash
		//
		// This is particularly useful when trying to sort mySQL results based upon the order of a supplied list.
		// eg.  select * from Plate where Plate_ID IN (3,1,2), will return 1,2,3, but you may wish the results in the original order (eg 3..1..2)
		//

		ref = ref;
		
		var sorted_results;

		if (data.constructor === Array && data.length) {
			if (ref) {
				console.log("restore order of hash " + data[0].constructor);
				sorted_results = _.sortBy(data, function(record) {
				    return list.indexOf(record[ref]);
				});
			}
			else {
				console.log("restore order of array " + data[0].constructor);
				sorted_results = [];

				for (var i=0; i<list.length; i++) {
					var refList = data;

					if (list[i].constructor === String && data[0].constructor === Number) {
						index = refList.indexOf(parseInt(list[i]));
					} 
					else if (list[i].constructor === Number && data[0].constructor === String) {
						index = refList.indexOf(list[i].toString());
					}
					else {
						index = refList.indexOf(list[i]);
					}

					if (index >=0) {
						console.log("push " + index + ': ' + JSON.stringify(data[index]));
						sorted_results.push(data[index])
					}
				}
				console.log("Sorted: " + sorted_results.join(','));
			}
		}
		else {
			console.log("no array to resort...");
			sorted_results = data;
		}

		return sorted_results;
	},


	// Generic methods ... 
	reset_messages : function (type) {
		if (type === 'messages' || !type ) { sails.config.messages = [] }
		if (type === 'warnings' || !type ) { sails.config.warnings = [] }
		if (type === 'errors' || !type ) { sails.config.errors = [] }
	},

	wrap_result : function (result) {
		// append config messages to result returned via api

		var data = {};
		data['data'] = result;
		data['messages'] = sails.config.messages;
		data['warnings'] = sails.config.warnings;
		data['errors']   = sails.config.errors;

		return data;
	},

	build_query: function (options) {

		if (!options) { 
			console.log("cannot build query without options");
			return '';
		}
		
		if (! options.fields || ! options.fields[0]) {
			console.log("no fields requested");
			return '';
		}

		var tables = options.tables || options.table;
		var fields = options.fields;
		var left_joins = options.left_joins;
		var groupBy    = options.group;
		var orderBy    = options.order;
		var limit      = options.limit;
		var debug      = options.debug;

		var conditions = options.conditions;
		
		var query = 'SELECT ' + fields.join(',');

		if (tables) { query = query + ' FROM (' + tables.join(',') + ')' }
		
		if (left_joins && left_joins.length) { query = query + ' LEFT JOIN ' + left_joins.join(' LEFT JOIN ') }
		if (conditions && conditions.length) { query = query + ' WHERE ' + conditions.join(' AND ') }

		if (groupBy && groupBy.length) { query = query + ' GROUP BY ' + groupBy.join(',') }
		if (orderBy && orderBy.length) { query = query + ' ORDER BY ' + orderBy.join(',') }
		if (limit) { query = query + ' LIMIT ' + limit }

		if (debug) { console.log("built query: " + query) }
		return query;
	},

	query_promise: function (query) {
		// Wrapper for standard Record.query returning a promise //	
		var deferred = q.defer();

		Record.query(query, function (err, result) {
			if (err) { 
				console.log("query promise error: " + query);
				console.log(err);

				var parsed_error = Record.parse_standard_error(err);
				console.log("Parsed: " + parsed_error);

				deferred.reject(parsed_error);
			}
			else { deferred.resolve(result) }
		});

		return deferred.promise;	
	},

	cast_to : function (input, target, hashKey ) {

		var returnVal;
		if ( target.match(/array/i) ) {		
			returnVal = [];
			// console.log("casting " + JSON.stringify(input) + ' to ' + target);
			if (input && input.constructor === Array) {
				if (hashKey && input[0] && input[0].constructor === Object && input[0][hashKey]) {
					for (var i=0; i<input.length; i++) {
						returnVal.push(input[i][hashKey]);
					}
				}
				else { returnVal = input }
			}
			else if (input && input.constructor === String)  {
				returnVal = input.split(/\s*,\s*/);
			}
			else if (input && input.constructor === Number ) {
				var number = input.toString();
				returnVal = number.split(/\s*,\s*/);
			}
			else if (input) {
				console.log("not array or string ? " + input.constructor);
			}
		}
		else if (! input) { console.log("Nothing to cast") }
		else { console.log("Logic not yet supplied for target type: " + target) }

		return returnVal;
	},

	merge_Messages: function (results, merged) {
		// retrieve results from multiple promises - primarily intended to retrieve messages / errors / warnings
		// eg console.log( merged_Results(results, messages).join("\n"));
		
		var message_types = ['message', 'warning', 'error'];
		if (!merged) { merged = {} }

		for (var i=0; i<results.length; i++) {
			for (var j=0; j<message_types.length; j++) {
				var mType = message_types[j];
				var mTypes = mType + 's';
				var found = results[i][mType] || results[i][mTypes];
				if (found) {
					if (!merged[mTypes]) { merged[mTypes] = [] }
						// test ... also account for string value ... replace with array ... 
					if ( found.constructor === Array ) {
						for (k=0; k<found.length; k++) {
							merged[mTypes].push(found[k]);   
						}
					}
					else {
						merged[mTypes].push(found);
					}
				}
			}
		}
		console.log(JSON.stringify(merged));
		return merged;
	},

	grab: function (table, condition) {
		// Wrapper for simple extract (similar to waterline findOne but not dependent upon waterline format)
		
		var deferred = q.defer();

		Record.query("SELECT * FROM " + table + " WHERE " + condition, function (err, result) {
			if (err) { 
				console.log("Error grabbing " + table + ' record.'); 
				deferred.reject(err);  
			}
			else if (result.length == 0) {
				console.log("No " + table + " records matching condition: " + condition);
				deferred.resolve([]);
			}
			else {
				deferred.resolve(result);
			}
		});
		return deferred.promise;
	}, 

	upload_SQL_File: function (table, file, payload) {

		var deferred = q.defer();
		try {
			var f = fs.readFileSync(file, {encoding: 'utf-8'} );

			console.log("Upload file: " + file);			
			f = f.split("\n");

			var headers = f.shift().split(/\t/);

			var data = [];
			f.forEach ( function (row) {
				var elements = row.split(/\t/);
				var record = {};

				if (elements[0]) {
					for (var i=0; i<elements.length; i++) {
						record[headers[i]] = elements[i];
	 				}
	 				data.push(record);
	 			}
			})
			console.log("* Added " + data.length + " custom records in " + table);
			// console.log("\nHeaders: " + headers);
			Record.createNew(table, data, { reset: { NULL : "\\N" }}, payload)
			.then ( function (added) {
				sails.config.messages('added ' + table + ' record(s)');

				deferred.resolve(added);
			})
			.catch ( function (err) {
				var msg = "Error adding data to " + table + ":\n" + JSON.stringify(err);
				deferred.reject(err);
			});
		} 
		catch (e) {
			deferred.reject(e);
		}

		return deferred.promise;
	},

	join_data: function (join_to) {   


		//var deferred = q.defer;

	    var rawData = join_to['join'];
	    var to      = join_to['to'];
	    var map     = join_to['map'];  // map primary attributes to new name (eg rename id fields to avoid duplicate references)

	    console.log("Map: " + JSON.stringify(map));
	    var data = [];
	    for (var i=0; i<rawData.length; i++) {

			var Ndata = rawData[i][to];

			var keys = Object.keys(rawData[i]);

			for (j=0; j<keys.length; j++) {
				var key = keys[j];
				if (key != to) {
					var mapkey = key;

					if (map && map[key]) { mapkey = map[key] }
					
					if (map && map[to] && map[to][key]) { Ndata[map[to][key]] = Ndata[key] }
					else { Ndata[mapkey] = rawData[i][key] }
				}
			}

	      	data.push(Ndata);
	    }
	    console.log("joined data: " + JSON.stringify(data));
	    //deferred.resolve(data);
	    return data;
	},

	clone : function (model, ids, resetData, options, payload) {
		// ids = Record.cast_to(ids, 'array', 'id');

		var deferred = q.defer();

		if (! options) { options = {} }
		if (options.debug) {			
			console.log("Cloning " + model + ' : ' + ids.join(','));
			console.log("* RESET: " + JSON.stringify(resetData));
			console.log("* Options: " + JSON.stringify(options));
		}

		var idField = options.id || 'id';
		var table = model;

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;

		var query = "SELECT * from " + table + " WHERE " + idField + ' IN (' + ids.join(',') + ')';	
		
		console.log("\nReset clone data: " + JSON.stringify(resetData));

		Record.query(query, function (err, result) {

			if (err) { console.log("cloning error: " + err); deferred.reject(err);  }
			else if (result.length == 0) {
				console.log("cloned record not found");
				var e = new Error('reference not found');
				deferred.reject(e);
			}
			else {
				var data = result;
				var sourceData = {};

				for (var index=0; index<result.length; index++) {
					var id = result[index][idField];

					sourceData[id] = data[index];
				}

				var newData = [];
				var resetFields = Object.keys(resetData);	

				console.log("Cloning " + ids.length + ' records');
				
				var Index = {};
				for (var i=0; i<ids.length; i++) {
					var id = ids[i];

					if (Index[id] === undefined ) { Index[id] = 0 }
					else { Index[id]++ }

					var addData = _.clone(sourceData[id]);
					for (var j=0; j<resetFields.length; j++) {
						var value = resetData[resetFields[j]];

						var setValue = value;

						if (value === undefined) { setValue = value }
						else if (value && value.constructor === Array ) {
							if (value.length == 1) { setValue = value[0] }
							else { setValue = value[i] }
						}
						else if (value && value.constructor === Object && value[id] )  {
							if (value[id].constructor === Array ) {
								setValue = value[id][Index[id]];  // multiple values supplied ... one for each duplicate ... 
							}
							else {
								setValue = value[id];
							}
						}
						else {
							setValue = value;
						}
						
						if (setValue && setValue.constructor === String) {

							if (setValue == '<id>') { setValue = id }

							else {	
								var parentRefs = setValue.match(/<PARENT\..*>/i);
								if (parentRefs) {
									for (var k=0; k<parentRefs.length; k++) {
										var ref = parentRefs[k].replace(/^<PARENT\./i,'').replace(/>$/,'');

										var val = sourceData[id][ref];
										setValue = setValue.replace(parentRefs[k], val);
									}
								}
							}
						}

						//if (value != undefined) { 
							addData[resetFields[j]] = setValue;
						//}
					}

					if (i==0) {
						console.log(table + ' ' + id + " Cloned : " + JSON.stringify(addData));
					}
					
					newData.push(addData);
				}

				console.log("create clones..." + JSON.stringify(newData));
				Record.createNew(model, newData, null, payload)
				.then (function (newResponse) {
					console.log('created clone records for ' + model);
					var target_id = newResponse.insertId;
					var target_count = newResponse.affectedRows;
					var target_ids = [];
					if (target_count == ids.length) {
						for (var i=0; i<target_count; i++) {
							var nextId = target_id + i;
							target_ids.push(nextId);
						}

						Attribute.clone(model, ids, target_ids, resetData, options, payload)
						.then (function (data1) {
							console.log("attribute update: " + JSON.stringify(data1));
							deferred.resolve({ data: data, insertIds: target_ids, created: newResponse, attributes: data1});
						})
						.catch ( function (err2) {
							console.log("failed to clone attributes");
							deferred.reject(err2);
						});	
					}
					else if (target_count == 0) {
						console.log("no target records");
						var e = new Error('no target records');
						deferred.reject(e);
					}
					else {
						console.log("targets != sources");
						var e = new Error('target count != source count');
						deferred.reject(e);
					}
				})
				.catch ( function (err3) {
					console.log(err3);
					console.log("Error creating new Clone records");
					// deferred.reject({error: err3, model: model, data: data, reset: resetData});
					deferred.reject(err3);
				});
			}
		});
		return deferred.promise;

	},

	update : function (model, ids, data, options, payload) {
		// Wrapper for updating records in database
		// This also add change history records in database if change_history specified in model attributes.
		// eg:
		//   Record.update('user',[1,2,3], { access : 'Admin'});
		//
		//   Record.update('user', [1,2,3], { name : [ 'Adam','Boris','Clyde'] });
		//  

		console.log("*** Update *** " + model + ": " + JSON.stringify(ids));
		console.log(JSON.stringify(data));
		console.log(JSON.stringify(options));

		var ids = Record.cast_to(ids,'array')

		if (!options) { options = {} }

		// setup History Tracking if applicable
    	var Mod = sails.models[model] || {};
    	var track = [];
    	var History;
    	var data_fields = [];

    	if (model && ids && data && Mod && Mod.track_history) {
    		data_fields = Object.keys(data);
    		console.log("Data Fields: " + data_fields.join(','));
    		var track_fields = Mod.track_history || ['FK_Rack__ID', 'FKParent_Rack__ID', 'Rack_Alias']; // always track location ... (default should be redundant if track_history set in model correctly)
    		track = _.intersection(track_fields, data_fields);
    		console.log("F: " + JSON.stringify(track_fields));
    		console.log("D: " + JSON.stringify(data_fields));
    		console.log("Track: " + JSON.stringify(track));
    		History = {};  // define...
    	}
    	else {
    		console.log("no data history tracking");
    	}

		var deferred = q.defer();

		if (!options) { options = {} }

		var table = Mod.tableName || model;

		var idField = 'id';
		if (sails.models[model]) {
			var Mod = sails.models[model];
			idField = Record.alias(model, 'id');
		}
		else {
			// alternate input for non standard tables : update('Plate:Plate_ID', ids, data);
			var splitModel = model.split(':');
			if (splitModel.length > 0 ) { 
				table = splitModel[0];
				idField = splitModel[1];
			}
			else {
				console.log("no " + model + " model :  id alias left as " + idField);
			}
		}		

		var query = "UPDATE " + table;
		
		var conditions = options.conditions || [];

		if (options.include_tables) {
			var tables = Object.keys( options.include_tables );
			var tables = [];
			for (var i=0; i<tables.length; i++) {
				tables.push( tables[i] );
				conditions.push(options.include_tables[tables[i]]);
				console.log('and ' + options.include_tables[tables[i]]);
			}

			query = query + ", " + tables.join(',');
		}
		else if (ids && ids.length) {
			var list = ids.join(',');
			conditions.push(idField + " IN (" + list + ")");
		}
		else {
			if (conditions.length == 0 ) {
				conditions.push(0);
				console.log("MUST specify list of IDS or condition");
			}
			else {
				// populate ids for change history... 
				
			}
		}

		var condition = conditions.join(' AND ');
		
		var SetEach = [];
		console.log("set values... WHERE " + condition);
		if (data && table && idField) {
			var fields = Object.keys(data);
			var Set1 = [];
			for (var i=0; i<fields.length; i++) {
				var setval = data[fields[i]];

				if (setval && setval.constructor === Array) {
					// If value supplied is an array (matching array of applicable ids), then set values one at a time
					// (this may be avoided if all of the array elements are identical in which case values may be set in standard way)
					//

					if (setval.length == ids.length) {
						console.log(fields[i] + " contains multiple values ... adding independently");
						for (var j=0; j<setval.length; j++) {
							if (! SetEach[j] ) { SetEach[j] = {} }
							SetEach[j][fields[i]] = setval[j];
						}
					}
					else if (setval.length == 1) {
						var setVal = Record.parseValue(setval[0], { model : model }, payload);
						Set1.push(fields[i] + " = " + setVal );						
					}
					else {
						var msg = "Ignored update to " + fields[i] + " (Length of supplied values != length of id list) " + setval.length + ' != ' + ids.length;
						sails.config.warnings.push(msg);
					}
				}
				else {
					var setVal = Record.parseValue(setval, { model : model }, payload);
					Set1.push(fields[i] + " = " + setVal );
				}
			}
			console.log('update history .. ');

			Change_history.update_History(model, ids, data, track, null, options.timestamp, payload)
			.then ( function (History) {
				// console.log("History: " + JSON.stringify(History));
				var promises = [];

				console.log("saved Change History... ");
				if (Set1.length) {
					query = query + " SET " + Set1.join(',');
					query = query + " WHERE " + condition;
					console.log("\n** Update: " + query);
					promises.push( Record.query_promise(query) );
				}
				
				if (SetEach.length) {
					console.log("ALSO SET " + JSON.stringify(SetEach));
		
					for (var j=0; j<SetEach.length; j++) {
						var subSet = [];
						var setFields = Object.keys(SetEach[j]); 
						for (var i=0; i<setFields.length; i++) {
							var setVal = Record.parseValue(SetEach[j][setFields[i]], { model: model}, payload);
							subSet.push(setFields[i] + ' = ' + setVal);
						}
						
						if (subSet) {
							var subquery = "UPDATE " + table + " SET " + subSet.join(',') + " WHERE " + idField  + ' = ' + ids[j];
							
							if (j === 0 || j === SetEach.length-1) { 
								console.log("subquery: " + subquery + '...') 
							}
							console.log(j + " : " + subquery + '...') 
							promises.push(Record.query_promise(subquery));
						}
					}
				}

				console.log('run updates...');
				q.all( promises )
				.then (function (results) {
					var setValues = {};
					var updateValues = {};
					console.log('updated: ' + JSON.stringify(results));

					if (Set1.length) { setValues = results[0] }
					if (SetEach.length) { updateValues = results[results.length - 1] }


					if (History && ids && ids.length) {
						console.log("update History for " + model);
						console.log(JSON.stringify(ids));
						console.log(JSON.stringify(data));
						console.log(JSON.stringify(History));

						Change_history.update_History(model, ids, data, track, History, options.timestamp, payload)
						.then (function (finalHistory) {
							console.log("Saved History after update...");
							console.log(JSON.stringify(finalHistory));
							deferred.resolve({ history: finalHistory, set: setValues, updated: updateValues });
						})
						.catch ( function (err) {
							console.log("Error saving final history: " + err);
							deferred.reject(err);
						});
					}
	//				console.log("updated: " + JSON.stringify(result));				
					else {
						// console.log('no History tracking for ' + data_fields.join(','));
						deferred.resolve({ set: setValues, updated: updateValues } );
					}
				})
				.catch ( function (err) {
					console.log("Query Error: " + query);
					err.context = 'updating last prep_id'
					deferred.reject(err);
				});
			})
			.catch ( function (Herr) {
				console.log("Error saving preHistory");
				Herr.context = 'preHistory';
				deferred.reject(Herr);
			});
			
		}
		else {
			console.log("no data or table / idField :" + table + ' / ' + idField);
			deferred.resolve();
		}

		return deferred.promise;
	},	

	createNew : function (model, Tdata, options, payload) {
		// Bypass waterline create method to enable insertion into models in non-standard format //
	    
	    if (!payload) { 
	        console.log("*** missing payload in createNew");
	        return Record.rejected_promise("payload required for update methods");
	    }

		var debug = 0;
		var deferred = q.defer();
		//console.log("\ncreate new record(s) in " + table);

		options = options || {};
		var resetData   = options.reset;

		var replace = options.replace;
		var ignore = options.ignore;

		var onDuplicate = options.onDuplicate || '';

		var action = 'INSERT';
		if ( onDuplicate) {
			if (onDuplicate.match(/replace/i)) {
				replace = true;
				onDuplicate = '';
			}
			else if (onDuplicate.match(/ignore/i)) {
				ignore = true;
				onDuplicate = '';
			}
			else {
				onDuplicate = ' ON duplicate KEY ' + onDuplicate;
			}
		}

		if (replace) {
			action = 'REPLACE';  // use UPDATE instead of REPLACE to prevent new id values... (replace deletes record and rewrites...)
		}
		else if (ignore) {
			action = 'INSERT IGNORE';
		}

		var Mod = sails.models[model] || {};

		var table = Mod.tableName || options.table || model; // default to model name ... 

		if (Tdata === undefined) { 
			var e = new Error('no data');
			deferred.reject(e); 
			return deferred.promise;
		}

		var data = [];
		if (Tdata.constructor === Object) { data = [Tdata] }
		else if (Tdata.constructor === Array ) { data = Tdata }
		else {  
			var e = new Error('no data');
			deferred.reject(e);  
			return deferred.promise;
		}

		var fields = [];
		if (data.length) { fields = Object.keys(data[0]) }

		var valid_fields = [];
		fields.map( function (f) {
			if (f && f !== '0') {
				// could potentially use this to validate actual field names - not just check for phantom 0 index... 
				valid_fields.push(f);
			}
			else {
				console.log("Warning: zero value found as key in data hash (?)");
			}
		});
		// WTF !!! - fields seems to have a phantom "0" as the first element (WTF !! ) - added this to clear it out..

		var Values = [];

		console.log(model + ' : ' + Mod + ' -> ' + Mod.tableName + '=' + table);
		console.log("insertion data: " + JSON.stringify(data[0]) + '...');

		for (var index=0; index<data.length; index++) {
			var Vi = [];
			for (var f=0; f<valid_fields.length; f++) {
				var input_value = data[index][valid_fields[f]];

				var value = Record.parseValue(input_value, { model: model, field: valid_fields[f] }, payload);

				if (resetData && resetData[valid_fields[f]]) {
					var resetValue = Record.parseValue( resetData[valid_fields[f]], { model: model, field: valid_fields[f], defaultTo : value }, payload);
					Vi.push(resetValue);
				}
				else {
					Vi.push(value);
				}
			}
			// if (table === model) { Vi.push('NOW()') }
			Values.push( "(" + Vi.join(", ") + ")");
		}
		// if (table === model) { fields.push('createdAt') }

		var createString = action + " INTO " + table + " (" + valid_fields.join(',') + ") VALUES " + Values.join(', ') + onDuplicate;
		console.log("\n** Insert SQL: \n" + createString); 

		Record.query_promise(createString)
		.then ( function (result) {
			// console.log("Result: " + JSON.stringify(result));
			var insertId = result.insertId;
			var added    = result.affectedRows;
			var duplicates = Record.insert_Duplicates(result, options);

			var msg = added + ' ' + table + ' record(s) added: id(s) from ' + insertId;
			console.log(msg);

			if (Mod.tableType && Mod.tableType.match(/lookup/i) ) { }
			// else { sails.config.messages.push(msg) }
			// console.log("successfully created new " + table + ' record(s)');

			var ids = Record.insert_Ids(result, options);

			result['model'] = model;
			result['table'] = table;
			result['ids'] = ids;

			console.log(JSON.stringify(payload));
			if (ids && ids.length) {
				Barcode.print_Labels(model, ids, null, payload);
			}

			console.log("add meta..");
			Record.add_meta_records(model, ids, payload)
			.then ( function (meta) {
				console.log("checked for meta records for " + model);
				deferred.resolve(result);
			})
			.catch ( function (err) {
				console.log("Error generating meta records");
				deferred.reject(err);
			})
		})
		.catch ( function (err) {
			console.log("Error creating Record in " + table);
			// console.log(JSON.stringify(err));
			deferred.reject(err); 
		});

		return deferred.promise;
	},

	add_meta_records : function (model, ids, payload) {
	// add meta records if appliable (records with 1-1 relationship with <model> records)  
	// Usage (model should have attribute: 'metaRecord' of format:
	//          metaRecord: { 'relatedTableName' : { refField: '<ID>'} }
	//
	//   where <ID> is a reference o the original record id in the <model> table.
	//	
		var Mod = sails.models[model] || {};

		var deferred = q.defer();

		if (Mod && Mod.metaRecord) {
			var meta = Mod.metaRecord;
			var metaTables = Object.keys(meta);

			var promises = [];

			for (var t=0; t<metaTables.length; t++) {
				var metaTable = metaTables[t];
				var metaFields = Object.keys(meta[metaTable]);

				var data = [];
				for (var n=0; n<ids.length; n++) {
					data.push(_.clone(meta[metaTable]));
				}

				console.log("Add meta data for records: " + ids.join(','));
				for (var i=0; i<metaFields.length; i++) {
					var f = metaFields[i];
					var v = meta[metaTable][f];
					if ( v && v.match(/\<ID\>/i) ) {
						for (var n=0; n<ids.length; n++) {
							data[n][f] = ids[n];
						}
					}
					else { 
						console.log(v + ' does not match ID');
					}
				}
				console.log("metadata table appended: " + metaTable);
				console.log(JSON.stringify(data));
				promises.push( Record.createNew(metaTable, data, null, payload) );
			}

			q.all(promises)
			.then ( function (metadata) {
				console.log("Added metadata");
				deferred.resolve();
			})
			.catch ( function (err) {
				console.log("Error adding meta records");
				deferred.reject(err);
			});
		}
		else {
			// console.log('no meta records for ' + model); 
			deferred.resolve();
		}

		return deferred.promise;

	},

	uploadData : function (options, payload) {

		var deferred = q.defer();
		
		if (!options) { options = {} }
		var model = options.model;
		var headers = options.headers;
		var data = options.data;

		if (!model || !headers || !data) { deferred.reject('require model, headers, data') }

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;
 
		var reference = options.reference;
		var onDuplicate = options.onDuplicate || '';
		var upload_type = options.upload_type || 'upload'; // append or update ...

		console.log("Uploading data " + JSON.stringify(options));

		var prefix = Barcode.prefix(model);
		var prefixRegexp = new RegExp(prefix, 'i');

		Record.parseMetaFields(model, headers)
		.then ( function (metaFields) {
			var fields = metaFields.fields;
			var attributes = metaFields.attributes;
			var ids   = metaFields.ids;

			var id_index = ids.index || 0;
			var idField;
			if (upload_type && upload_type.match(/update/i)) {
				idField = headers[id_index];
				idField = idField.replace(/ /g,'_');
			}

			var field_count = Object.keys(fields).length;
			var attribute_count = Object.keys(attributes).length;
			console.log("\n** MetaFields: " + JSON.stringify(metaFields));

			var idCol = 0;

			// data has additional index value ... 
			if (data.length && data[0].length === headers.length+1 &&  field_count + attribute_count === headers.length) {

				var promises = [];
				for (var row=0; row<data.length; row++) {
					var fieldData = {};

					var id;
					var condition;
					var conditions = [];
					var include_tables;
					var update_attributes = [];
	
					// id should be included or inferred for each record
					if ('index' in ids) {
						id = data[row][id_index+1];
						console.log("used id: " + id);
					}
					else if (reference) {
						id = reference[data[row][1]];  // data 0 is simply a row # ... 
						console.log(data[row][1] + " references: " + id);
					}
					else if (idField) {
						// enable conditional field to act as id (first column must be associated with unique record) 
						if (fields[idField]) {
							condition = headers[0] + " = '" + data[row][1] + "'";
						}
						else if (attributes[idField] && attributes[idField].id) {
							var att_id = attributes[idField].id;
							condition = "Attribute_Value = '" + data[row][1] + "'";
							include_tables = {};
							include_tables[ table + '_Attribute'] = "FK_" + table + "__ID=Plate_ID AND FK_Attribute__ID = " + att_id;
						}
					}

					// convert string and remove barcode prefix if used... 
					if (id && id.constructor === String) {
						if ( prefix && id.match(prefixRegexp) ) {
							id = parseInt(id.replace(prefixRegexp,''));
						}
						else {
							id = parseInt(id);
						}
					}

					for (var col=1; col<=headers.length; col++) {
						var header = headers[col-1];
						header = header.replace(/ /g,'_');

						var value = data[row][col]; // Record.parseValue(data[row][col]);

						if (idField && header === idField) {
							// skip 
							if (condition) { id_condition = condition + " = '" + value + "'" }
							console.log("skip " + header);
						}
						else if (fields[header]) {
							fieldData[fields[header]] = value;
							// console.log("set fieldData for " + header);
						}
						else if (attributes[header]) {
							var att_id = attributes[header].id;
							// console.log("set attribute for " + header);
							update_attributes.push( { id: att_id, value: value});
						}
						else {
							console.log(header + ' not identified ??');
						}		
					}
					
					if (condition) { conditions.push(condition) }

					var options = {
						model : model,
						table : table,
						id : id,
						upload_type : upload_type,
						fieldData : fieldData,
						attributes : update_attributes,
						include_tables : include_tables,
						conditions : conditions,
						onDuplicate: onDuplicate,
					}
					promises.push(Record.uploadRecord(options, payload));
				}

				q.all(promises)
				.then ( function (result) {
					var insertIds = [];
					var affectedRows = 0;
					var changedRows = 0;
					var affectedRecords = 0;
					var changedRecords = 0;

					var bulk_insert = {};
					for (var i=0; i<result.length; i++) {
						if (result[i].bulk_insert) {

							var models = Object.keys(result[i].bulk_insert); 
							for (var j=0; j<models.length; j++) {

								if (!bulk_insert[models[j]]) { bulk_insert[models[j]] = [] }
								
								var bi = result[i].bulk_insert[models[j]];
								for (var k=0; k<bi.length; k++) {
									bulk_insert[models[j]].push(bi[k]);
								}
							}
						}

						if (result[i].insertId) { insertIds.push(result[i].insertId) }
						if (result[i].affectedRows) { 
							affectedRows += result[i].affectedRows
							affectedRecords++;
						}
						if (result[i].changedRows) { 
							changedRows += result[i].changedRows;
							changedRecords++;
						}
					}

					var bulk_inserts = [];

					if (bulk_insert) {
						console.log(onDuplicate + ' bulk insert: ' + JSON.stringify(bulk_insert));
						var models = Object.keys(bulk_insert);
						for (var i=0; i<models.length; i++) {
							if ( bulk_insert[models[i]] && bulk_insert[models[i]].length ) {
								bulk_inserts.push( Record.createNew(models[i], bulk_insert[models[i]], { onDuplicate: onDuplicate}, payload));
							}
						}
					}

					q.all(bulk_inserts)
					.then ( function (result) {
						console.log("bulk insert result:");
						console.log(JSON.stringify(result));

						var added = {};
						var duplicates = 0;
						for (var i=0; i<result.length; i++) {
							var insert_model = result[i].model;

							duplicates += Record.insert_Duplicates(result[i], options);
							
							if (result[i].ids && result[i].ids.length) {
								if (model === insert_model) {
									if (insertIds.length) {
										for (var j=0; j<result[i].ids.length; j++) {
											insertIds.push(result[i].ids[j]);
										}
									}
									else { insertIds = result[i].ids }
								}
								else {
									console.log('tracking attribute additions as updates');
									if (added[insert_model]) {
										for (var j=0; j<result[i].ids.length; j++) {
											added[insert_model].push(result[i].ids[j]);
										}
									}
									else {
										added[insert_model] = result[i].ids;
									}
								}
							}
						}

						console.log(data.length + ' return data: ' + JSON.stringify(data))
						deferred.resolve({
							rows: data.length,
							insertIds: insertIds, 
							affectedRows: affectedRows, 
							changedRows: changedRows,
							affectedRecords: affectedRecords,
							changedRecords: changedRecords,
							duplicates: duplicates,
							added: added
						});					
					})
					.catch ( function (err) {
						console.log("error with bulk insertion: " + err);
						deferred.reject("error adding records: " + err);
						// deferred.resolve({
						// 	rows: result.length, 
						// 	insertIds: insertIds, 
						// 	affectedRows: affectedRows, 
						// 	changedRows: changedRows,
						// 	affectedRecords: affectedRecords,
						// 	changedRecords: changedRecords
						// });
					});

					// console.log("updated " + result.length + ' record(s)');
				})
				.catch ( function (err) {
					var msg = Record.parse_standard_error(err);
					console.log("Error uploading data: " + msg);
					err.context = 'upload Data';
					deferred.reject(msg);
				});
			}
			else {
				var msg = "Data: " + data[0].length + '; headers: ' + headers.length + '; F: ' + Object.keys(fields).length + '; A: ' + Object.keys(attributes).length;
				console.log(msg);
				var e = new Error('missing data or headers');
				deferred.reject(e);
			}
		})
		.catch ( function (err) {
			deferred.reject(err);
		});

		return deferred.promise;
	},

	uploadRecord : function (options, payload) {
		// upload single record ... may include attribute updates (appends)
		var deferred = q.defer();
		if (!options) { options = {} }

		console.log("*** Upload Record: " + JSON.stringify(options));
		// options for non-explicit updates (eg using external attribute as reference)
		var conditions = options.conditions;
		var include_tables = options.include_tables; 
		var id = options.id;
		var model = options.model;
		var table = options.table || model;
		var upload_type = options.upload_type;
		var attributes = options.attributes || [];
		var fieldData = options.fieldData || {};
		var onDuplicate = options.onDuplicate || '';

		var bulk_insert = {};

		if (! payload) {
			console.log("no payload ?");
			deferred.reject('user credentials unavailable... please see LIMS admin');
		}
		else {
			var user = payload.userid;
			var timestamp = '<now>';

			var append_promises = [];
			if (upload_type === 'append') {
				// new records if applicable ...
				console.log("\n** will Add " + model + " record(s): " + JSON.stringify(fieldData));
				// append_promises.push(Record.createNew(model, fieldData));
				bulk_insert[model] = [fieldData];
			}

			q.all(append_promises)
			.then ( function (added) {
				// console.log("*** Added new records...");
				var promises = [];
				var update_index = 0;
				var attribute_index = 0;
				
				var appended;
				var update_count;
				var attribute_count;

				if (upload_type === 'append') {
					// appends only 
					id = added.insertId;
					appended = id;
					console.log("added " + id);
				}
				else {
					// updates only 
					if (Object.keys(fieldData).length) {
						console.log("\n** will Update Fields: " + JSON.stringify(fieldData));
						promises.push( Record.update(model, id, fieldData, { conditions: conditions, include_tables: include_tables }, payload) );							
						update_index = 1;
					}
				}

				if (attributes.length) {
					var append_attributes = [];
					for (var i=0; i<attributes.length; i++) {
						var att_id = attributes[i].id;
						var value = attributes[i].value;
						append_attributes.push( Attribute.insertHash(model, id, att_id, value, user, timestamp) );
					}

					bulk_insert[table + '_Attribute'] = append_attributes;
					// promises.push( Record.createNew(table + '_Attribute', append_attributes, { onDuplicate: onDuplicate}) );
					// attribute_index = update_index + 1;
					console.log("\n** will Update Attributes: " + JSON.stringify(append_attributes)  );
				}

				q.all(promises)
				.then (function (result) {
					var returnval = { insertId: appended };
					var affected = 0;
					var changed  = 0;
					var found = 0;
					if (update_index) { 
						var got = result[update_index-1];
						console.log("updates returned: " + JSON.stringify(got))
						returnval['update'] = got;

						if (got.set && got.set.affectedRows) {
							affected += got.set.affectedRows;
							found += got.set.affectedRows;
						}
						if (got.set.changedRows) {
							changed += got.set.changedRows;
						}

						if (got.updated && got.updated.affectedRows) {
							affected += got.updated.affectedRows;
						}
						if (got.updated.changedRows) {
							changed += got.updated.changedRows;
						}
					}

					returnval['changedRows'] = changed;
					returnval['affectedRows'] = affected;
					returnval['bulk_insert'] = bulk_insert;

					deferred.resolve(returnval);
				})
				.catch ( function (err) {
					console.log("Failed to update record(s)");
					deferred.reject(err);
				});
			})
			.catch (function (err) {
				console.log("error adding new record");
				deferred.reject(err);
			});
		}

		return deferred.promise;
	},	

	parseMetaFields : function (model, headers) {
	// parses meta fields (used to determine what headers apply to fields and/or attributes in uploaded file.  also returns index to id field if found)
		var deferred = q.defer();

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;

		var fields = {};
		var attributes = {};
		var ids = {};

		// console.log("parse " + model + ': ' + headers.join(','));

		var check_attributes = [];
		for (var i=0; i<headers.length; i++) {
			var header = headers[i];
			var alias;
			if (header) { alias = header.replace(/ /g,'_') }

			// if (Mod.alias && alias && Mod.alias(alias)) {
			if ( Record.alias(model, alias) && Record.alias(model, alias) !== alias ) {
				// eg - id for legacy table (id -> User_ID )
				fields[alias] = Record.alias(model, alias);				
			}
			else if (alias && Mod.attributes && Mod.attributes[alias]) {
				// any defined attribute of the given model
				fields[alias] = header;

				if (header === 'id') {
					ids = { alias : alias, index: i};
				}
				else if ( Record.alias(model, 'id') === alias) {
					ids = { alias : alias, index: i};
				}
			}
			else if (alias && Record.unalias(model,alias) ) {
				// eg actual legacy id field ( User_ID )
				fields[alias] = alias;
				if (Record.unalias(model, alias) === 'id') {
					ids = { alias: alias, index: i};
				}
			}
			else {
				// check for attributes tied to this model... 
				check_attributes.push(i);
			}
			
			if (header === 'id' || header === 'ID' || header === table || alias === table + '_ID') {
				ids = { alias : alias, index: i};
			}
		}

		if (check_attributes.length) {

			var query = "Select Attribute_Name, Attribute_ID FROM Attribute WHERE Attribute_Class = '" + table + "'";
			Record.query_promise(query)
			.then (function (result) {
				var names = _.pluck(result,'Attribute_Name');
				var att_ids   = _.pluck(result,'Attribute_ID');

				for (var i=0; i<check_attributes.length; i++) {
					var att = headers[check_attributes[i]];
					console.log(check_attributes[i] + " Att: " + att);
					var alias = att.replace(/ /g,'_');

					var index = names.indexOf(alias);
					if (index >=0 ) {
						attributes[alias] = {id: att_ids[index], name: names[index], index: check_attributes[i]};
					}
					else {
						console.log(" Not recognized as either a field or a header");
					}
				}

				deferred.resolve( { fields: fields, attributes: attributes, ids: ids });
			})
			.catch ( function (err) {
				deferred.reject(err);
			})
		}
		else {
			deferred.resolve( { fields: fields, attributes: [], ids: ids});
		}

		return deferred.promise;
	},

	parseValue : function (value, options, payload) {
		// parses values that may be formatted for specific purposes (eg '<today>, '<id>','<SQL_statement>' ...)

		if (! options ) { options = {} }

		var defaultTo = options.defaultTo;
		var model = options.model;  // used for <id> values (retrieves id field name)
		var field = options.field;  // used for <increment> values
		var debug = options.debug;
		var index = options.index;
		var action  = options.action;  // action eg insert or update (eg affects <increment>) 

		if (!payload) { payload = {} }

		var Mod = {};
		if (sails && sails.models && sails.models[model]) { Mod = sails.models[model] }

		if (value === null || value === 'NULL' ||  value === undefined || value === '<NULL>') {
			value = null;
		}
		else if (value.constructor === Array ) {
			console.log("retrieve " + index + " element from array");
			if (! index) { index = 0 }
			value = value[index];
		}

		var noQuote = 0;

		if (typeof value == 'number') { value = value.toString() }

		var onDuplicate;
		
		if (value == null) { }			
		else if (value.constructor === String) {
			if (value.match(/^<userid>$/i)) {
				// change this to access user id and phase out alDente_ID ... 
				value = payload.userid || 0;
				if (debug) console.log("replacing <user> with " + value);
			}
			else if (value.match(/^<user>$/i)) {
				console.log("PHASE OUT - use userid or external_ID");
				value = payload.external_ID || 0;
				if (debug) console.log("replacing <external_ID> with " + value);				
			}
			else if (value.match(/^<external_id>$/i)) {
				value = payload.external_ID || 0;
				if (debug) console.log("replacing <external_ID> with " + value);				
			}
			else if (value.match(/^<increment>$/i) ) {
				if (action === 'insert') {  }  // leave onDuplicate set in createNew function
				else if (field) { value = field + " + 1 " }
				else { console.log('should supply field if updating, or insert action') }
				
				if (debug) { console.log("V: increment") }
				// NOTE:  Requires setting out onDuplicate OUTSIDE OF THIS Function !!!! (onDuplicate is left hanging here... )
				/*	
				value = 1; 
				if (field) {
					value = '<increment>';  // leave so it can be parsed out in 'createNew'
					onDuplicate = " ON DUPLICATE KEY UPDATE " + field + "=" + field + " + 1";
					console.log("replacing <increment> with SQL ");
				}
				else {
					console.log("No field specified to increment");
					sails.config.errors.push("no field specfied for increment");
				}
				*/
			}
			else if (value.match(/^<now>$/i)) {
				value = 'NOW()'; 
				if (debug) console.log("replacing <now> with " + value);
				noQuote = 1;
			}
			else if (value.match(/^<today>$/i)) {
				value = 'CURDATE()'; 
				if (debug) console.log("replacing <today> with " + value);
				noQuote = 1;
				if (debug) { console.log('using current data: ' + value) }
			}
			else if (value.match(/^<id>$/i)) { 
				var idField = Record.alias(model, 'id');
				value = idField;
				if (debug) { console.log('using id field: ' + value) }
			}
			else if (value.match(/^<.*>$/)) {
				value = value.replace(/^</,'');
				value = value.replace(/>$/,'');
				if (debug) { console.log("SQL statement detected: " + value) }
				noQuote = 1;
			}

			// account for redundant quotes ... 

			if (value.constructor === String && value.match(/^\"/) && value.match(/\"$/)) {
				noQuote = 1;
			}
		}
		else if (value && value.constructor === Date) {
			value = JSON.stringify(value);
			noQuote=1;
		}


		if (value === null && defaultTo) {
			return defaultTo;
		}
		else if (value === null) {
			return 'null';					
		}
		else if (noQuote) {
			return value;
		}
		else {
			return "\"" + value + "\"";
		}
	},

	parse_standard_error : function (err) {
        // Convert warning / error errs into more readable format
        // (if <match> is included in value, then the regexp of the key will be evaluated and the match replaced in the value string)
        //   eg 'Error creating \\w+' : "<match> - no record created" -> yields "Error creating Employee - no record created" 
        //
        var Map = {
            "Duplicate entry \'.+\' encountered" : "<match>",
            'Unknown column'  : "Unrecognized column in database (?) - please inform LIMS administrator",
            "Error saving \\w+" : "<match>",
        };

        console.log("Parse " + err.constructor + ' err ' + err);

        if (err.constructor === Object) {
        	err = JSON.stringify(err);
        }
        else if (err.constructor === Array ) {
        	err = err.join('; ');
        }
        else if (err.constructor === String) {

        }
        else { 
        	var string = err.toString();
        	err = string;
        }

		console.log("\nStringified error: \n" + err);        

        var strings = Object.keys(Map);

        var errors = [];
        for (var i=0; i<strings.length; i++) {
            
            var test = strings[i];
            if (Map[strings[i]].match(/<match>/)) {
                test = new RegExp(test);
                console.log("Checking errors for regexp :" + test);
            }

            var found = err.match(test);
            if (found) {
                console.log("match found for " + test);
                var err = Map[strings[i]].replace('<match>', found);
                errors.push( err );
            }
        }

        console.log("Parsed Error: " + err);
        console.log(JSON.stringify(errors));
        if (! errors.length) { errors.push(err) }
        return errors;
    },

    load_FK : function (table, fields) {
    	// Legacy 
    	var deferred = q.defer();

    	var FK = {};
    	FK[table] = {};

    	var field_list = fields.join("','");
    	var query = "SELECT DBField_ID as fk, Field_Name as field, DBTable_Name as dbtable FROM DBField,DBTable WHERE FK_DBTable__ID=DBTable_ID AND Field_Name IN ('" + field_list + "') AND DBTable_Name = '" + table + "'";
    	console.log(query);
    	Record.query_promise(query)
    	.then (function (result) {
    		for (var i=0; i<result.length; i++) {
    			var table = result[i].dbtable;
    			var field = result[i].field;
    			var ref = result[i].fk;
    			
    			FK[table][field] = ref;
    		}
    		deferred.resolve(FK);
    	})
    	.catch ( function (err) {
    		console.log("could not get FK values");
    		deferred.reject(err);
    	});

    	return deferred.promise;
    },

    delete_record : function (model, id) {

    	var deferred = q.defer();
    	
    	var Mod = sails.models[model] || {};    	
    	var	table = Mod.tableName || model;

		// add access check potentially ...
		// var idfield = table;
		var idfield = Record.alias(model, 'id');

		var sql = "DELETE FROM " + table + " WHERE " + idfield + "=" + id;
		
		console.log(sql);
		Record.query_promise(sql)
		.then (function (result) {
			deferred.resolve(result);
		})
		.catch ( function (err) {
			deferred.reject(err);
		})

		return deferred.promise;
    
    }
};


