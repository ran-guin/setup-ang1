/**
 * TestController
 *
 * @description :: Server-side logic for managing tests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


	test : function (req, res) {
		
		res.render("customize/Test");
	},

	print: function (req, res) {

		// check printer list
	    var Printer = require('node-printer');
	    var options = { media: 'Custom.200x600mm', n:3 };

	    var Plist = Printer.list();

	    console.log('Printer List: ' + JSON.stringify(Plist));
		console.log("Test Printing");

		sails.config.messages.push("Printers: " + JSON.stringify(Plist));

		var printer_name = 'z4m-6';

		if (!printer_name && Plist.length == 1) { printer_name = PList[0] }

		if (Plist.indexOf(printer_name) >= 0) {
		    var printer = new Printer(printer_name);

		    var test = printer.printText('Hello');

		    var barcode_image = bwipjs.toBuffer({bcid: 'code128', text: barcode});

		    var job = printer.printBuffer(buffer);

			var result = Barcode.testPrint('Test123','z4m-6');
			
			sails.config.messages.push('Printed to ' + printer_name);
			return res.render('customize/private_home');
	
		}
		else {
			sails.config.errors.push("Could not find printer " + printer_name);
			return res.render('customize/private_home');
		}
	}

};

