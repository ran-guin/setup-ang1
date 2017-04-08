/**
 * StockController
 *
 * @description :: Server-side logic for managing stocks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Logger = require('../services/logger');

module.exports = {
	

	receiveForm : function (req, res) {

		return res.render('lims/ReceiveStock');
	},

	receive : function (req, res) {
		var body = req.body;

		console.log("Store received stock...");
		console.log(JSON.stringify(body));

		Stock.receive(body)
		.then (function (result) {
			return res.send(result);
		})
		.catch (function (err) {
			Logger.error(err, "problem receiving stock", 'receive');
			return res.send({error : err});
		});
	},

	received : function (req, res) {

		var element = req.param('element') || 'injectedData';
		var limit = req.param('limit');
		var type = req.param('type');


		var fields = ['Stock_Catalog_Name as name', 'Stock_Lot_Number as lot', 'Stock_Received as rcvd', 'Stock_Number_in_Batch as qty', 'Stock_ID as stock_batch'];
		fields.push('Stock_Notes as notes');

		var tables = ['Stock','Stock_Catalog'];
		var conditions = ['FK_Stock_Catalog__ID = Stock_Catalog_ID'];
		var group = [];
		var left_joins = [];
		var order = ['Stock_ID DESC'];

		if ( type.match(/(Solution|Reagent)/) ) {
			fields.push("Group_Concat( DISTINCT Concat(Solution_Quantity,Solution_Quantity_Units) SEPARATOR ', ') as size");
			fields.push("GROUP_CONCAT(DISTINCT Solution_ID SEPARATOR ', ') as ids");
			fields.push('Solution_Status as status');
			fields.push("count(distinct Solution_ID) as active")
			left_joins.push('Solution ON Solution.FK_Stock__ID=Stock_ID');
			group.push('Stock_Catalog_ID, Stock_ID, Solution_Status');
		}
		else if (type === 'Equipment') {
			fields.push("GROUP_CONCAT(DISTINCT Equipment_ID SEPARATOR ', ') as ids");
			fields.push("GROUP_CONCAT(DISTINCT Serial_Number SEPARATOR ', ') as serial");			
			left_joins.push('Equipment ON Equipment.FK_Stock__ID=Stock_ID');
			group.push('Stock_Catalog_ID, Stock_ID');
		}

		var suffix = '';
		if (limit && limit.match(/^\d+$/)) {
			// leave as is
			suffix = ' (last ' + limit + ')'
		}
		else if (limit === 'today') {
			limit = '';
			suffix = ' (today)'
			conditions.push("Stock_Received = CURDATE()")
		}

		var query = Record.build_query({ tables : tables, fields: fields, left_joins: left_joins, group: group, conditions: conditions, order: order, limit: limit });

		console.log(query);
		Record.query_promise(query)
		.then (function (result) {
			return res.render('customize/injectedData', { 
				fields : fields, 
				data : result, 
				title: 'Received Stock ' + suffix, 
				element: element
			});
		})
		.catch ( function (err) {
			console.log("Error checking received stock: " + err);
			Logger.warning(err, 'could not find recent stock', 'received');
			return res.render('customize/injectedData', {
				data : null,
				title : 'Received Stock',
				element : element
			});
		});
	}
};

