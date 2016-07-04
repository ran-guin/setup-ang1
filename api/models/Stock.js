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
	}

	receive : function (data) {

		var deferred = q.defer();

		console.log("Data: " + JSON.stringify(data));
		var StockData = data['Stock'];

		var barcode = data['barcode'];

		if (StockData && StockData.type) {
			var type = StockData.type;
			var N    = StockData.received;

			StockData = Record.to_Legacy(StockData, Stock.legacy_map);
			console.log("Stock Data: " + JSON.stringify(StockData));

			Record.createNew('stock', StockData)
			.then ( function (stock) {
				var stock_id = stock.insertId;
		
				if (type === 'solution') {
					// Add individual Reagent records
					var ReagentData = data['Reagent'];

					ReagentData['Stock'] = stock_id;

					console.log("Pre ß	Reagent Data: " + JSON.stringify(ReagentkData));
					ReagentData = Record.to_Legacy(ReagentData, Solution.legacy_map);
					console.log("Reagent Data: " + JSON.stringify(ReagentkData));

					Record.createNew('solution', ReagentData)
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
					deferred.reject("Not set up yet for " + type + ' types ...');
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

