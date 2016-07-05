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
	}
};

