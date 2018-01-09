/**
* Barcode.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var bwipjs = require('bwip-js');
var request = require('request');

var Logger = require('../services/logger');

module.exports = {

  tableName: 'Barcode_Label',
  migrate: 'safe',
  attributes: {

  },

  prefix : function (table) {
  	var Prefixes = {
  		'Plate' : 'Bcg',
  		'Solution' : 'Sol',
  		'Rack' : 'Loc',
  		'Equipment' : 'Eqp',
      'Set' : 'Set',
      'user' : 'Emp',
    };

  	if (table == undefined) {
  		return Prefixes;
  	}
  	else {
      if (! Prefixes[table]) {
        // check if model supplied instead... 
        var Mod = sails.models[table] || {};
        if (Mod.tableName && Prefixes[Mod.tableName]) {
          return Prefixes[Mod.tableName];
        }
      }
  	}
    return Prefixes[table];

  },

  printLabel : function (barcode, code, printer) {
    
    console.log("print label...");
    return;
  },


  print_Labels : function (model, ids, type, payload) {

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

    var group;
    group = payload.printer_group;

    if (! type) {
        console.log("nothing printed");
        deferred.resolve();
    }
    else if (!group) {
      console.log("no printer group (?)");
      var e = new Error('missing label type');
      deferred.reject(e);
    }
    else {
      console.log("generate print url for " + type);

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

  	Scanned['Unformatted'] = barcode;

  	if (errors.length) { console.log("Errors: " + JSON.stringify(errors)) }
    Scanned['Errors'] = errors;

    return Scanned;
  },

  custom_scan : function (barcode) {
    // input : barcode
    // output : customized scan results with warnings, errors
    var deferred = q.defer();

    Barcode.interpret(barcode)
    .then ( function (Scanned) {

      console.log("Scanned: " + JSON.stringify(Scanned));

      var plate_ids = [];
      var condition = '';
      var promises = [];
      var box_order;

      var errors = Scanned['Errors'] || [];
      var warnings = [];
      var messages = [];

      var objects = [];

      if ( Scanned['Plate'].length) {
        plate_ids = Scanned['Plate'];
        objects.push('Plate');
      }
      else if ( Scanned['Rack'].length ) {
        var boxes = Scanned['Rack'].join(',');
        condition = "Box.Rack_ID IN (" + boxes + ')';
        console.log("condition: " + condition);
        box_order = Scanned['Rack'];
        objects.push('Plate');
      }
      else if ( Scanned['Set'].length ) {
        var sets = Scanned['Set'];
        var query = "Select GROUP_CONCAT(FK_Plate__ID) as ids from Plate_Set WHERE Plate_Set_Number IN (" + sets.join(',') + ")";
        console.log('query: ' + query);
        promises.push( Record.query_promise(query) );
        objects.push('Plate');
      }
      
      if ( Scanned['Solution'].length) {
        console.log("Scanned solution");
        warnings.push("Reagent home page has not yet been set up");
        objects.push('Solution');
      }
      if ( Scanned['Equipment'].length) {
        console.log("Scanned equipment");
        warnings.push("Equipment home page has not yet been set up");        
        objects.push('Equipment');
      }

      if ( Scanned['Unformatted'] ) {
        errors.push("Unrecognized string in barcode: '" + Scanned['Unformatted'] + "'") 
      }

      console.log('run ' + promises.length + ' promises');
      q.all( promises )
      .then ( function (result) { 
        console.log("completed promises");      

        if (result && result[0] && result[0].length 
          && result[0][0].ids && objects[0]==='Plate') {
          var ids = result[0][0].ids;
          condition = "Plate.Plate_ID IN (" + ids + ")";
        }
        else if (result && result[0] && result[0].length ) {
          errors.push("Nothing found in Set(s) " + sets);
        }
    
        if (plate_ids.length || condition) {
          console.log("Load: " + plate_ids.join(',') + ' samples from box(es) ' + boxes);

          Container.loadViewData(plate_ids, condition, { box_order: box_order})
          .then (function (viewData) {
            // console.log("got view data " + JSON.stringify(viewData));

            if (viewData.Samples.length == 0) {
              if (plate_ids.length) {
                warnings.push("expecting ids: " + plate_ids.join(', '));
                // return res.render('customize/private_home', { warnings : warnings} );
              }
              else if (Scanned['Rack'].length) {
                messages.push("Scanned Loc#s: " + Scanned['Rack'].join(', '));
                warnings.push("No Box Contents Detected");
                warnings.push("(Note: Rack / Shelf types are ignored... or Boxes may be full)");
              } 
              else {
                warnings.push("nothing found (?)");
              }
              warnings.push("No useable records retrieved");
              
              deferred.resolve({ found: null, messages: messages, warnings: warnings });
              // return res.render('customize/private_home', );
            }
            else {
              console.log("update viewData");
              viewData.Scanned = Scanned;
              viewData.found = 'Container';
              viewData.messages = messages;
              viewData.warnings = warnings;
              viewData.errors = errors;

              // console.log("ViewData: " + JSON.stringify(viewData));
              deferred.resolve(viewData);
            }
          })
          .catch (function (err) {
            console.log("Error calling loadView for container");
            // Logger.error(err, 'Error loading container data');
            deferred.reject({ messages: messages, warnings: warnings, errors : errors });
            //return res.render('customize/private_home', {messages: messages, warnings: warnings, errors : errors });
          });     
        }
        else {
          // Logger.info('Unrecognized barcode: ' + barcode);
          deferred.reject({ errors: errors, warnings: warnings });
            // return res.render("customize/private_home", { errors: errors, warnings: warnings });
        }
      })
      .catch ( function (err) {
        // errors.push("Error retrieving set");
        // Logger.error(err, 'Error retrieving set');
        console.log("Error retrieving set");
        console.log(err);
        deferred.reject(err);
      })
        // return res.render('customize/private_home', { errors : errors } );
      // })
    })
    .catch ( function (err) {
      console.log("error interpretting");
      // errors.push('Error interpretting barcode: ' + barcode);
      // errors.push(err);

      // Logger.error(err, 'Error interpretting barcode');
      deferred.reject(err);
      //res.render('customize/private_home', { errors: errors } );
    });
        
    return deferred.promise;
  },

  interpret : function (barcode) {
    // input : barcode
    // output 
    var Scanned = {};

    var deferred = q.defer();
    
    if (barcode) { 
      Scanned = Barcode.parse(barcode);

      if (Scanned['Unformatted'] && Scanned['Unformatted'].match(/\d{10}/) ) {

        console.log("checking for matrix barcode(s) in unformatted string: " + Scanned['Unformatted']);

        var Mbarcodes = Scanned['Unformatted'].match(/\d{10}/g);
        if (Mbarcodes) {
          console.log("List: " + JSON.stringify(Mbarcodes));
          
          var query = "Select FK_Plate__ID as id, Attribute_Value as alt_scan from Plate_Attribute,Attribute WHERE FK_Attribute__ID = Attribute_ID "
            + " AND Attribute_Name='Matrix_Barcode'"
            + " AND Attribute_Value IN ('" + Mbarcodes.join("','") + "')"; 
          console.log(query);

          Record.query_promise(query)
          .then ( function (result) {
            if (result.length) {
              var resorted = Record.restore_order(result, Mbarcodes, 'alt_scan');
              Scanned['Plate'] = _.pluck(resorted,'id');   // need to adjust slightly to accept multiple scanned barcodes ... 

              console.log("** Matrix Barcode(s) Detected and order restored ** " + JSON.stringify(resorted));

              for (var i=0; i<result.length; i++) {
                var alt_id = result[i].alt_scan;
                Scanned['Unformatted'] = Scanned['Unformatted'].replace(alt_id, '');
              }

              deferred.resolve(Scanned);
            }
            else {
              deferred.resolve(Scanned);
            }
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

