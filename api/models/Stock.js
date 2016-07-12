/**
 * Stock.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');

module.exports = {

	tableName : 'Stock',
	migrate : 'safe',

	attributes: {

	},

	legacy_map : {
		'number_in_batch' : 'Stock_Number_in_Batch',
		'received' : 'Stock_Received',
		'type' : 'Stock_Type',
		'lot_number' : 'Lot_Number',
		'notes' : 'Stock_Notes',
		'catalog' : 'FK_Stock_Catalog__ID',
	},

	receive : function (data) {

		var deferred = q.defer();

		console.log("Data: " + JSON.stringify(data));
		var StockData = data['Stock'];

		var barcode = data['barcode'];

		if (StockData && StockData.type) {
			var type = StockData.type;
			var N    = StockData.number_in_batch;

			StockData = Record.to_Legacy(StockData, Stock.legacy_map);
			console.log("Stock Data: " + JSON.stringify(StockData));

			Record.createNew('stock', StockData)
			.then ( function (stock) {
				
				console.log(JSON.stringify(stock));
				if (stock.insertId) {
					var stock_id = stock.insertId;
		
					console.log("Add additional records for each " + type);
					console.log(JSON.stringify(data[type]));
					if (type === 'Reagent' && data['Reagent']) {
						// Add individual Reagent records
						console.log('load data...' + JSON.stringify(data));
						var ReagentData = data['Reagent'];
						console.log("Reagent data : " + JSON.stringify(ReagentData));

						ReagentData['Stock'] = stock_id;

						console.log("Pre & Reagent Data: " + JSON.stringify(ReagentData));
						ReagentData = Record.to_Legacy(ReagentData, Solution.legacy_map);
						console.log("Reagent Data: " + JSON.stringify(ReagentData));

						var Reagents = [];
						for (var i=0; i<N; i++) {
							Reagents.push(ReagentData);
							Reagents[i]['Solution_Number'] = i+1;
						}
						Record.createNew('solution', Reagents)
						.then ( function (result) {
							if (barcode) {
								console.log("print reagent barcodes ...");
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
						deferred.reject("Problem parsing " + type + ' data ...');
					}
				}
				else {
					deferred.reject("No Stock ID generated ?");
				}
			})
			.catch ( function (err) {
				console.log("Problem creating stock record");
				deferred.reject(err);
			});
		}
		else {
			deferred.reject("No Stock Data Type supplied");
		}

		return deferred.promise;
	},

};
