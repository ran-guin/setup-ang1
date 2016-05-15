/**
* Barcode.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  },

  prefix : function (model) {
  	var Prefixes = {
  		'Plate' : 'Bcg',
  		'Solution' : 'Sol',
  		'Location' : 'Loc',
  		'Equipment' : 'Eqp'
  	};

  	if (model == undefined) {
  		return Prefixes;
  	}
  	else {
  		return Prefixes[models];
  	}
  },

  printLabels : function (model, ids) {
    var msg = "Print " + model + " Labels: " + ids
    sails.config.messages.push(msg);
    return { message: msg };
  },

  parse : function (barcode) {

  	var P = Barcode.prefix();
  	var classes = Object.keys(P);

  	var Scanned = {};
  	var errors = [];

  	console.log("Parse " + barcode + " : " + JSON.stringify(P));
  	console.log("classes: " + classes.join(','));

  	function barcodeId (barcode) {
  		var match = barcode.match(/\d+/,'i');
  		if (match == undefined) { return match }
  		else { return match[0] }
  	}

  	for (var i=0; i< classes.length; i++) {
  		var regex = new RegExp(P[classes[i]] + '\\d+', 'ig');
  		var range = new RegExp(P[classes[i]] + '\\d+\\s*\-\s*' + P[classes[i]] + '\\d+', 'ig');

  		Scanned[classes[i]] = [];

  		// First extract range if applicable //
  		var range_matches = barcode.match(range);
  		if (range_matches) {
  			barcode = barcode.replace(range,'');
  			var maxCount = 100;
  			var range_list = [];
  			for (j=0; j<range_matches.length; j++) {
	  			var limits = range_matches[j].match(regex).map(barcodeId);

	  			if (limits) {
	  				var min = parseInt(limits[0]);
	  				var max = parseInt(limits[1]);

	  				if (min > max) {
	  					errors.push("Invalid Range: " + min + " > " + max);
	  				}
	  				else if ( max-min > maxCount ) {
	  					errors.push("Range too large: > " + maxCount );
	  				}
	  				else {
	  					for (k=min; k<=max; k++) {
	  						Scanned[classes[i]].push(k);
	  					}
		  				console.log("Found " + classes[i] + " Range: " + min + ' -> ' + max );
	  				}
	  			}
	  		}
  		}

  		// Extract individual barcodes if remaining ... //
  		var matches = barcode.match(regex);

  		if (matches) { 
	  		barcode = barcode.replace(regex,'');	
  			var scanned = matches.map(barcodeId);
  			if (scanned) {
  				for (j=0; j<scanned.length; j++) {
  					Scanned[classes[i]].push(parseInt(scanned[j]));
  				}
  			}
  		}
  	}

  	if (barcode != '') { errors.push("Unrecognized string in barcode: " + barcode) }
	 
	if (errors.length) { console.log("Errors: " + JSON.stringify(errors)) }

  	return Scanned;
  }

};

