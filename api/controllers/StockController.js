/**
 * StockController
 *
 * @description :: Server-side logic for managing stocks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
			return res.send({error : err});
		});
	},

	received : function (req, res) {

		var type = 'Solution';
		var element = req.param('element') || 'injectedData';

		var fields = ['Stock_Catalog_Name as name', 'Stock_Received as rcvd', 'Stock_Number_in_Batch as qty', 'Stock_ID as stock_batch'];
		var tables = ['Stock','Stock_Catalog'];
		var conditions = [];
		var group = [];
		var left_joins = [];
		var order = ['Stock_Received DESC'];

		if ( type.match(/(Solution|Reagent)/) ) {
			fields.push('GROUP_CONCAT(DISTINCT Solution_ID) as ids');
			fields.push('Solution_Status as status');
			fields.push("count(distinct Solution_ID) as active")
			left_joins.push('Solution ON Solution.FK_Stock__ID=Stock_ID');
			group.push('Stock_ID, Solution_Status');
		}

		var query = Record.build_query({ tables : tables, fields: fields, left_joins: left_joins, group: group, conditions: conditions, order: order});

		console.log(query);
		Record.query_promise(query)
		.then (function (result) {
			return res.render('customize/injectedData', { 
				fields : ['name', 'ids', rcvd', 'qty', 'status','stock_batch'], 
				data : result, 
				title: 'Received Stock', 
				element: element
			});
		})
		.catch ( function (err) {
			return res.render('customize/injectedData', {
				data : null,
				title : 'Received Stock',
				element : element
			});
		});
	}
};

