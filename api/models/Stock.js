/**
 * Stock.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');
var _ = require('underscore-node');

module.exports = {

	tableName : 'Stock',
	migrate : 'safe',

	attributes: {

	},

	alias : {
		'id' : 'Stock_ID',
		'number_in_batch' : 'Stock_Number_in_Batch',
		'received' : 'Stock_Received',
		// 'type' : 'Stock_Type',
		'lot_number' : 'Stock_Lot_Number',
		'notes' : 'Stock_Notes',
		'catalog' : 'FK_Stock_Catalog__ID',
		'Received_by' : 'FK_Employee__ID',
	},

	barcode : true,

	stock_types : {
		'Reagent' : { model: 'solution' },
		'Equipment' : { model: 'equipment' }
	},
		
	receive : function (data, payload) {

		var deferred = q.defer();

		console.log("Data: " + JSON.stringify(data));
		var StockData = data['Stock'];

		var barcode = data['barcode'];
		var type    = data['type'];

		if (type) {
			// var type = StockData.type;
			var N    = StockData.number_in_batch;

			StockData = Record.to_Legacy(StockData, Stock.alias);
			console.log("Stock Data: " + JSON.stringify(StockData));

			var subModel = '';
			var subType = {};

			Record.createNew('stock', StockData, null, payload)
			.then ( function (stock) {
			
				console.log(JSON.stringify(stock));
				if (stock.insertId) {
					var stock_id = stock.insertId;
		
					console.log("Add additional records for each " + type);
					console.log(JSON.stringify(data[type]));

					if (Stock.stock_types[type]) {
						subModel = Stock.stock_types[type].model;
						subType = sails.models[subModel];
					}

					if (subType && data[type]) {
						// Add individual Reagent records
						// var ReagentData = data['Reagent'];

						// ReagentData['Stock'] = stock_id;
						// ReagentData = Record.to_Legacy(ReagentData, Solution.legacy_map);

						// console.log("Reagent Data: " + JSON.stringify(ReagentData));

						// var Reagents = [];
						
						var subData = data[type];
						subData['Stock'] = stock_id;

						var subType_aliases = subType.alias;
						console.log(subType + ' aliases: ' + JSON.stringify(''));

						subData = Record.to_Legacy(subData, subType_aliases);
						console.log(type + ' Data: ' + JSON.stringify(subData));

						// convert arrays after fields are mapped
						var fields = Object.keys(subData);
						var array_input = {};
						for (var i=0; i<fields.length; i++) {
							if (subData[fields[i]].constructor === Array ) {
								array_input[fields[i]] = subData[fields[i]];
								delete subData[fields[i]];
							}
						}
						var arrays = Object.keys(array_input);

						var subObjects = [];

						for (var i=0; i<N; i++) {

							// var cloned = JSON.stringify(subData);
							// var cloneData = JSON.parse(cloned);
							var cloneData = _.clone(subData);

							// Reagents.push( cloneData );  // clone
							subObjects.push( cloneData );  // clone

							// customized ... 
							var subTable = subType.tableName || subModel;

							// allow array input to apply to individual records ... eg serial numbers for a batch of equipment... 
							for (var j=0; j<arrays.length; j++) {
								subObjects[i][arrays[j]] = array_input[arrays[j]][i];
								console.log(arrays[j] + ' : ' + i + ' = ' + array_input[arrays[j]][i]);
							}

							subObjects[i][subTable + '_Number'] = i+1;
							subObjects[i][subTable + '_Number_in_Batch'] = N;

							subObjects[i][subTable + '_Name']


							console.log("THIS RECORD: " + JSON.stringify(subObjects[i]));
							// if (type == 'Reagent') {
							// 	subObjects[i]['Solution_Number'] = i+1;
							// }
							// else if (type == 'Equipment') {
							// 	subObjects[i]['Equipment_Number'] = i+1;
							// }
						}

						console.log('ADD : ' + JSON.stringify(subObjects));

						Record.createNew(subModel, subObjects, null, payload)
						.then ( function (result) {
							if (barcode) {
								/*
								var insertId = result.insertId;
								var added    = result.affectedRows;

								var ids = [];
								for (var i=0; i<added; i++) {
									ids.push(insertId++);
								}
	*/

								/* handle in createNew ... 
								var ids = Record.insert_Ids(result);

								Barcode.printLabels('solution', ids)
								.then ( function (response) {
									console.log("printed reagent barcodes ...");
								})
								.catch ( function (err) {
									console.log("Error printing solution barcodes " + err);
								})
*/
							}
							else {
								console.log("suppress barcodes...");
							}
							deferred.resolve(result);
						})
						.catch ( function (err) {
							deferred.reject(err);
						});
					}
					else {
						var e = new Error(type + ' Parsing problem');
						e.context = 'receive Stock';
						deferred.reject(e);
					}
				}
				else {
					var e = new Error('No stock id generated');
					e.context = 'receive Stock';

					deferred.reject(e);
				}
			})
			.catch ( function (err) {
				console.log("Problem creating stock record");
				deferred.reject(err);
			});
		}
		else {
			var e = new Error("No Stock data type");
			e.context = 'receive stock';
			deferred.reject(e);
		}

		return deferred.promise;
	},

};

