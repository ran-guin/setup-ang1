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
	
	attributes: {

	},

	'load_Prep_Attributes' : function (input, cb) {		

		var Plate_attributes = [];
		var Prep_attributes = [];

		console.log(message + " Input: " + JSON.stringify(input));
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
			console.log("got result: " + JSON.stringify(result));
			return cb(null, result);
		});

	},

	clone : function (table, sources, targets) {
		var deferred = q.defer();
		console.log('clone attributes for ' + table + 'record(s): ' + targets.join(',' ));

		var source_list = sources.join(',');
		var fields = 'FK_' + table + '__ID as reference_id, FK_Attribute__ID as id, Attribute_Name name, Attribute_Type type, Attribute_Value as value';
		var query = "SELECT " + fields + " FROM " + table + '_Attribute, Attribute'
			+ " WHERE FK_Attribute__ID=Attribute_ID AND FK_" + table + '__ID IN (' + source_list + ')';

		var insertPrefix = "INSERT INTO " + table + '_Attribute (FK_' + table + '__ID, FK_Attribute__ID, Attribute_Value) VALUES ';

		var Map = {};
		for (var i=0; i<sources.length; i++) {
			Map[sources[i]] = targets[i];
		}

		Record.query(query, function (err, attributeData){
			if (err) { deferred.reject("Error retrieving attributes: " + err) }
			else {
				console.log("attributes: " + attributeData);
				var insert = [];
				for (var i=0; i<attributeData.length; i++) {
					var att = attributeData[i];
					var target = Map[att.reference_id];
								
					var insertion = '(' + target + ',' + att.id + ',' + att.value + ')'; 
					insert.push(insertion);	
				}
				var sqlInsert = insertPrefix + insert.join(',');
				console.log(sqlInsert);

				Record.query(sqlInsert, function (insertError, attUpdate){
					console.log("Update attributes " + sqlInsert);
					if (insertError) { deferred.reject("error updating attributes: " + insertError) }
					else {
						deferred.resolve({attributes: attUpdate});
					}
				});
			}
		})
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

	update : function (table, ids, attributes, values) {
		var deferred = q.defer();
		console.log('update attributes for ' + table + ': ' + ids);
		deferred.resolve({'att1' : 123});

		var update_query = "INSERT INTO " + table 
			+ "_Attribute (FK_Attribute__ID, FK_" + table + "__ID, Attribute_Value)"
			+ " VALUES (" + attID + ',' +  ID + ',' + val + ')'
			+ " ON DUPLICATE KEY UPDATE Attribute_Value=Attribute_Value+1";
		
		console.log("update attributes: " + update_query);

		return deferred.promise;		
	},

	'save' : function ( model, ids, data ) {
		var deferred = q.defer();

		var attModel = model + '_Attribute';   // Legacy

		console.log(model + " ids: " + JSON.stringify(ids));
		console.log(model + ' Attributes: ' + JSON.stringify(data));
		
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
					insertData['Attribute_Value'] = data[atts[i]];					
					insertData['FK_' + model + '__ID'] = ids[j];

					add.push(insertData);
				}
			}

			console.log(model + " Att data: " + JSON.stringify(add));

			Record.createNew(attModel, add )
			.then (function (AttResult) {
				console.log("Added Attribute: " + JSON.stringify(AttResult));
				deferred.resolve(AttResult);
			})
			.catch ( function (err) {
				deferred.reject("Error saving attributes: " + err);
			});
		}

		return deferred.promise;
	},

};

