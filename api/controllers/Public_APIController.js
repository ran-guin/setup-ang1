/**
 * Public_APIController
 *
 * @description :: Server-side logic for managing public_apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getPrinterGroups : function ( req, res ) {

		Record.query_promise("Select distinct Printer_Group_Name from Printer_Group")
		.then (function (result) {
			res.send(result.data);
		})
		.catch (function (err) {
			console.log("Error retrieving printer groups");
			res.send(err);
		})
	},

};

