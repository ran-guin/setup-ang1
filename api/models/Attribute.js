/**
 * Attribute.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');

module.exports = {

	/* LEGACY */
	migrate: 'safe',
	
	tableName: 'Attribute',
	attributes: {

	},

	models : [ 'container', 'prep' ],  // models with attributes...

	insertHash : function (model, id, att_id, value) {
		var hash = {};

		var Mod = sails.models[model];

		var table = Mod.tableName || model;

		var field = 'FK_' + table + '__ID';  // Legacy

		var hash = {
			FK_Attribute__ID : att_id,
			Attribute_Value : value
		};

		hash[field] = id;

		return hash;
	},

	'load_Prep_Attributes' : function (input, cb) {		

		var Plate_attributes = [];
		var Prep_attributes = [];

		console.log(message + " Input: " + JSON.stringify(input[0]) + '...');
		for (j=0; j<input.length; j++) {
			var att1 = input[j].replace('Plate_Attribute=','');
			var att2 = input[j].replace('Prep_Attribute=','');
			if (att1 != input[j]) { Plate_attributes.push(att1) }
			else if (att2 != input[j]) { Prep_attributes.push(att2) }

			// console.log("Plate Atts: " + JSON.stringify(Plate_attributes));
			// console.log("Prep Atts: " + JSON.stringify(Prep_attributes));
		}	
		
		return cb(null, { 'Plate' : Plate_attributes, 'Prep' : Prep_attributes });

	},

	'options' : function (Aclass, attribute, cb) {		

		console.log("find " + Aclass + " : " + attribute);
		var q = "SELECT * from Attribute WHERE Attribute_Class = '" + Aclass + "' AND Attribute_Name = '" + attribute + "'";
		console.log("query: " + q);

		Attribute.query(q, function (err, result) {
		// Attribute.findOne({ 'Attribute_Class': Aclass, 'Attribute_Name': attribute})    // findOne probably requires standard id field ... 
			//console.log("got result: " + JSON.stringify(result));
			return cb(null, result);
		});

	},

	clone : function (model, sources, targets, resetData, options) {
		var split = options.split || 1;
		var deferred = q.defer();

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;

		if ( Attribute.models.indexOf(model) ) {
			console.log('clone attributes for ' + table + ' Record(s): ' + targets.join(',' ));

			var source_list = sources.join(',');
			var fields = 'FK_' + table + '__ID as reference_id, FK_Attribute__ID as id, Attribute_Name name, Attribute_Type type, Attribute_Value as value';
			var query = "SELECT " + fields + " FROM " + table + '_Attribute, Attribute'
				+ " WHERE FK_Attribute__ID=Attribute_ID AND Inherited='Yes' AND FK_" + table + '__ID IN (' + source_list + ')';

			var insertPrefix = "INSERT INTO " + table + '_Attribute (FK_' + table + '__ID, FK_Attribute__ID, Attribute_Value) VALUES ';

			var Map = {};
			var split_index = {};
			for (var i=0; i<sources.length; i++) {
				if ( ! split_index[sources[i]] ) { 
					split_index[sources[i]] = 0;
					Map[sources[i]] = [];
				}

				Map[sources[i]][split_index[sources[i]]] = targets[i];
				split_index[sources[i]]++;
			}

			var target_index

			console.log("Map: " + JSON.stringify(Map));

			Record.query(query, function (err, attributeData){
				
				if (err) { deferred.reject("Error retrieving attributes: " + err) }
				else {
					if (attributeData.length) {
						console.log("Attribute Data: " + JSON.stringify(attributeData[0]) + '...');
						var insert = [];
						for (j=0; j< split; j++) {
							for (var i=0; i<attributeData.length; i++) {
								var att = attributeData[i];
								var target = Map[att.reference_id][j];
											
								var insertion = '(' + target + ',' + att.id + ",'" + att.value + "')"; 
								insert.push(insertion);	
							}
						}
						var sqlInsert = insertPrefix + insert.join(',');

						Record.query(sqlInsert, function (insertError, attUpdate){
							if (insertError) { 
								var parsed_error = Record.parse_standard_error(insertError);
								deferred.reject("error updating attributes: " + parsed_error) 
							}
							else {
								deferred.resolve({attributes: attUpdate});
							}
						});
					}
					else {
						console.log("no attributes to transfer");
						deferred.resolve({attributes: {} });
					}
				}
			});
		}
		else {
			console.log('no attributes tracked for ' + model);
			deferred.resolve();
		}

		return deferred.promise;
	},

	increment : function (table, ids, attributes) {
		
		var deferred = q.defer();
		/*
		var increments = [];
		if (att.type == 'Count') {
			// after copying existing increment attributes, update them if applicable //
			increments.push(insertion);
		}
		if (increments.length) {
			console.log("Update increment attributes " + increments.join('; '));

			var addInc = insertPrefix + increments.join(',')
				+ ' ON DUPLICATE KEY UPDATE Attribute_Value=Attribute_Value+1'; 

			console.log("Increments: " + addInc)
			Record.query(addInc, function (incrementError, incUpdate){
				if (incrementError) { deferred.reject("Error with increment attribute(s): " + incrementError) }
				else { deferred.resolve({attributes: attUpdate, increments: incUpdate}) }
			})
		}
		*/
		deferred.resolve( 'okay' ); //{ table: table, ids: ids, attributes: attributes});
		return deferred.promise;

	},

	'save' : function ( model, ids, data ) {
		var deferred = q.defer();

		var attModel = model + '_Attribute';   // Legacy

		if (! data 
			|| data == 'undefined' 
			|| Object.keys(data) == 'undefined' 
			|| Object.keys(data).length == 0 ) {
				console.log('no ' + model + ' attribute data...');
				deferred.resolve({});
		}
		else {
			var atts = Object.keys(data);
			console.log("KEYS: " + JSON.stringify(atts));
			console.log("IDS: " + JSON.stringify(ids));

			var add = [];

			for (var i=0; i<atts.length; i++) {
				for (var j=0; j<ids.length; j++) {
					var insertData = { 
						'FK_Attribute__ID' : atts[i], 
						//'Attribute_Value' : data[atts[i]],
					};


					var val = Record.parseValue(data[atts[i]], { index: j, action: 'insert'} );
					console.log("\n** Parse " + data[atts[i]] + ' with index: ' + j + ' -> ' + val);

					insertData['Attribute_Value'] = val;					
					insertData['FK_' + model + '__ID'] = ids[j];
					insertData['Set_DateTime'] = "<now>";
					insertData['FK_Employee__ID'] = sails.config.payload.userid;

					add.push(insertData);
				}
			}

			console.log(model + " Att data: " + JSON.stringify(add[0]) + '...');

			Record.createNew(attModel, add )
			.then (function (AttResult) {
				deferred.resolve(AttResult);
			})
			.catch ( function (err) {
				console.log("Error saving attributes: " + err);
				deferred.reject(err);
			});
		}

		return deferred.promise;
	},

	uploadAttributes : function (model, attribute, data) {
		/*
		var ids = data['ids'];
		var map = data['map'];

		var positions = Object.keys(map);
		*/
		var deferred = q.defer();

		console.log("Upload Attributes: ");
		console.log("model = " + model + "; attribute = " + attribute);

		var upload = [];
		var table = model + '_Attribute';
		for (var i=0; i<data.length; i++) {
			upload[i] = {};
			upload[i]['FK_' + model + '__ID'] = data[i][0];
			upload[i]['Attribute_Value'] = data[i][1];
			upload[i]['FK_Attribute__ID'] = attribute;
			upload[i]['FK_Employee__ID'] = sails.config.payload.userid;
			upload[i]['Set_DateTime'] = '<now>';
		}

		console.log("upload: " + JSON.stringify(upload[0]) + '...');

		Record.createNew( table, upload )
		.then ( function (result) {
			console.log("\nuploaded attributes: " + JSON.stringify(result));
			deferred.resolve(result);			
		})
		.catch ( function (err) {
			console.log("error uploading attributes: ");
			console.log(err);
			deferred.reject(err);
		});

		return deferred.promise;
	},

};

