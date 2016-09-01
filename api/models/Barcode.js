/**
* Barcode.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var bwipjs = require('bwip-js');
var request = require('request');

module.exports = {

  attributes: {

  },

  prefix : function (model) {
  	var Prefixes = {
  		'Plate' : 'Bcg',
  		'Solution' : 'Sol',
  		'Rack' : 'Loc',
  		'Equipment' : 'Eqp',
      'Set' : 'Set',
    };

  	if (model == undefined) {
  		return Prefixes;
  	}
  	else {
  		return Prefixes[models];
  	}
  },

  printLabel : function (barcode, code, printer) {
    
    console.log("print label...");
    return;
  },


  print_Labels : function (model, ids, type ) {

    var deferred = q.defer();

    default_type = {
      'container' : 1,
      'rack' : 2,
      'solution' : 3
    }

    var deferred = q.defer();

    if (! type) {
      type = default_type[model];
    }

    var group = sails.config.payload.printer_group;

    if (! type) {
        console.log("nothing printed");
        deferred.resolve();
    }
    else if (!group) {
      console.log("missing printer group (?)");
      deferred.reject("missing label type");
    }
    else {
      var payload = sails.config.payload;

      var params = "database=" + payload.db + '&';
      params = params + 'host=' + payload.host + '&';
      params = params + 'user=' + payload.db_user + '&';
      params = params + 'id=' + ids + '&';
      // params = params + 'printer=' + printer + '&';
      params = params + 'printer_group=' + payload.printer_group + '&';
      params = params + 'model=' + model + '&';

      console.log("params: " + params);
        
      var url = "http://bcgpdev5.bccrc.ca/SDB_rg/cgi-bin/barcode_printer.pl?" + params;
      console.log("url: " + url);

      request( { url: url, method: "GET"},
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                  console.log(body)
              }
              else { console.log("posted print request"); }
          }
      );

    }
  },

  parse : function (barcode) {

  	var P = Barcode.prefix();
  	var classes = Object.keys(P);

  	var Scanned = {};
  	var errors = [];

  	console.log("Parse " + barcode + " : " + JSON.stringify(P));
  	console.log("classes: " + classes.join(','));

    barcode = barcode.replace(/\s/g,'');

  	function barcodeId (barcode) {
  		var match = barcode.match(/\d+/,'i');
  		if (match == undefined) { return match }
  		else { return match[0] }
  	}

  	for (var i=0; i< classes.length; i++) {
  		var regex = new RegExp(P[classes[i]] + '\\d+\,?\s*', 'ig');
  		var range = new RegExp(P[classes[i]] + '\\d+\\s*\-\s*' + P[classes[i]] + '\\d+', 'ig');

      // var range2 = new RegExp(P[classes[i]] + '\\d+\\s*\-\s*' + P[classes[i]] + '\\d+', 'ig');

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

    if (barcode != '') { errors.push("Unrecognized string in barcode: '" + barcode + "'") }
  	Scanned['Unformatted'] = barcode;

  	if (errors.length) { console.log("Errors: " + JSON.stringify(errors)) }
    Scanned['Errors'] = errors;

    return Scanned;
  },

  interpret : function (barcode) {
    var Scanned = {};

    var deferred = q.defer();
    
    if (barcode) { 
      Scanned = Barcode.parse(barcode);

      if (Scanned['Unformatted'] && Scanned['Unformatted'].length && ! Scanned['Unformatted'].match(/a-zA-Z/) ) {
        console.log("** Matrix Barcode Detected ** " + Scanned['Unformatted']);

        var Mbarcodes = Scanned['Unformatted'].match(/.{10}/g);
        if (Mbarcodes) {
          console.log("List: " + JSON.stringify(Mbarcodes));
          
          var query = "Select FK_Plate__ID from Plate_Attribute,Attribute WHERE FK_Attribute__ID = Attribute_ID "
            + " AND Attribute_Name='Matrix_Barcode'"
            + " AND Attribute_Value IN ('" + Mbarcodes.join("','") + "')"; 
          console.log(query);

          Record.query_promise(query)
          .then ( function (result) {
            if (result.length) {
              console.log("R: " + JSON.stringify(result));
              Scanned['Plate'] = _.pluck(result,'FK_Plate__ID');   // need to adjust slightly to accept multiple scanned barcodes ... 
              deferred.resolve(Scanned);
            }
            deferred.resolve(Scanned);
          })
          .catch (function (err) {
              console.log("Error checking for Matrix Barcode");
              deferred.reject(err);
          });
        }
        else {
          console.log("Unidentified barcode string: " + Scanned['Unformatted']);
          deferred.resolve(Scanned); 
        }

      }
      else {
        deferred.resolve(Scanned);
      }
    }
    else {
      deferred.resolve(Scanned);
    }

    return deferred.promise;
  }
};

