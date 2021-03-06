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
	idField : 'Attribute_ID',
	nameField: 'Attribute_Name',

	attributes: {

	},

	models : [ 'container', 'prep' ],  // models with attributes...

	insertHash : function (model, id, att_id, value, user, timestamp) {
		var hash = {};

		if (!timestamp) { timestamp = 'CURDATE()' }

		var Mod = sails.models[model];

		var table = Mod.tableName || model;

		var field = 'FK_' + table + '__ID';  // Legacy

		var hash = {
			FK_Attribute__ID : att_id,
			Attribute_Value : value,
			FK_Employee__ID : user,
			Set_DateTime : timestamp
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

	clone : function (model, sources, targets, resetData, options, payload) {
		var split = options.split || 1;
		var deferred = q.defer();

		var Mod = sails.models[model] || {};
		var table = Mod.tableName || model;
		var att_table = table + '_Attribute';
		
		if ( Attribute.models.indexOf(model) >= 0) {
			console.log('clone attributes for ' + table + ' Record(s): ' + targets.join(',' ));

			var source_list = sources.join(',');
			var fields = 'FK_' + table + '__ID as reference_id, FK_Attribute__ID as id, Attribute_Name name, Attribute_Type type, Attribute_Value as value';
			var query = "SELECT " + fields + " FROM " + att_table + ', Attribute'
				+ " WHERE FK_Attribute__ID=Attribute_ID AND Inherited='Yes' AND FK_" + table + '__ID IN (' + source_list + ')';

			// var insertPrefix = "INSERT INTO " + att_table + ' (FK_' + table + '__ID, FK_Attribute__ID, Attribute_Value) VALUES ';

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

			Record.query_promise(query)
			.then ( function (attributeData) {
				if (attributeData.length) {
					var addAttributes = [];
					console.log("Attribute Data: " + JSON.stringify(attributeData) + '...');
					// var insert = [];
					for (var i=0; i<attributeData.length; i++) {
						var att = attributeData[i];
						for (j=0; j<Map[att.reference_id].length; j++) {
							var target = Map[att.reference_id][j];
									
							// var insertion = '(' + target + ',' + att.id + ',"' + att.value + '")'; 
							// insert.push(insertion);	

							var newAttData = {};
							newAttData['FK_' + table + '__ID'] = target;
							newAttData['FK_Attribute__ID'] = att.id;
							newAttData['Attribute_Value'] = att.value;

							addAttributes.push(newAttData);
						}
					}

					// var sqlInsert = insertPrefix + insert.join(',');
					console.log("* NEW ATT " + JSON.stringify(addAttributes));

					Record.createNew(att_table, addAttributes, {}, payload)
					.then (function (result) {
						console.log("created new attribute records");
						deferred.resolve({attributes: result});
					})
					.catch (function (err){
						console.log("Error creating attribute clones");
						deferred.reject(err);
					});
				}
				else {
					console.log("no attributes to transfer");
					deferred.resolve({attributes: {} });
				}				
			})
			.catch ( function (err) {
				deferred.reject("Error retrieving attributes from originals: " + err);
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

		deferred.resolve( 'okay' ); //{ table: table, ids: ids, attributes: attributes});
		return deferred.promise;

	},

	'save' : function ( model, ids, data, options, payload) {
		var deferred = q.defer();

        if (! options) { options = {} }
        var onDuplicate = options.onDuplicate;
            
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
			var increments = {};

			for (var i=0; i<atts.length; i++) {
				for (var j=0; j<ids.length; j++) {
					var insertData = { 
						'FK_Attribute__ID' : atts[i], 
						//'Attribute_Value' : data[atts[i]],
					};


					var val = Record.parseValue(data[atts[i]], { index: j, action: 'insert'} );
					console.log("\n** Parse " + data[atts[i]] + ' with index: ' + j + ' -> ' + val);

					insertData['FK_' + model + '__ID'] = ids[j];
					insertData['Set_DateTime'] = "<now>";
					insertData['FK_Employee__ID'] = payload.external_ID;

					if (val.match(/<increment>/)) {
						if (! increments[atts[i]]) { increments[atts[i]] = [] }
                        insertData['Attribute_Value'] = 1;                    
						increments[atts[i]].push(insertData);
					}
					else {
                        insertData['Attribute_Value'] = val;                    
						add.push(insertData);
					}
				}
			}

            var promises = [];
			if (add.length) { 
                var options = { onDuplicate : 'REPLACE' };
                promises.push( Record.createNew(attModel, add, options, payload) );
                console.log(model + " Att data: " + JSON.stringify(add[0]) + '...');
            }

			var extras = Object.keys(increments);
			for (var i=0; i<extras.length; i++) {
                var datai =  increments[extras[i]];
                var options = { onDuplicate : "UPDATE Attribute_Value=Attribute_Value+1" }
				promises.push( Record.createNew(attModel, datai, options, payload) );
                console.log("Separately add: " + JSON.stringify(datai));
			}

			q.all(promises)
			.then (function (response) {
				var AttResult = response[0];
				deferred.resolve(AttResult);
			})
			.catch ( function (err) {
				console.log("Error saving attributes: " + err);
				deferred.reject(err);
			});
		}

		return deferred.promise;
	},

	uploadAttributes : function (model, attribute, data, payload) {
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
			upload[i]['FK_Employee__ID'] = payload.external_ID;
			upload[i]['Set_DateTime'] = '<now>';
		}

		console.log("upload: " + JSON.stringify(upload[0]) + '...');

		Record.createNew( table, upload, null, payload)
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

