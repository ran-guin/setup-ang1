/**
* Upload.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var xlsx = require('node-xlsx');
'use strict';

module.exports = {

	attributes: {
		type : { 
			type : 'string',
			enum : ['update', 'upload', 'custom']
		},
		timestamp : { type : 'time' },
		details : { type : 'json' },
		filename : { type : 'string' },
		model : { type : 'string' },    // reference DBtable 
		template : { type : 'string'},  // could change to lookup
	},


  	uploadFile : function (file, options) {

		var deferred = q.defer();

		if (!options) { options = {} }

		var page = options['page'] || 1;
		var skip = options['skip'] || 0;
		var inverse_matrix = options.inverse || false;  // inverse default row / column names (eg a,b,c as rows instead of columns)																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																					
		var reverse_map = options.reverse_map || false;

		file
	    .upload({
	    	maxBytes: 40000000
	    }, function (err, uploadedFiles) {                                   
			if (err) deferred.reject(err); // res.serverError(err);
			else if (uploadedFiles.length == 0) { 
				var e = new Error('No file uploaded');                                 
				deferred.reject(e);
			}
			else {
				// assume only one file for now, but may easily enable multiple files if required... 
				console.log("Parsing contents...of page " + page + ' [ skip ' + skip + ' line(s)]');
				var f = 0; // file index

				if (uploadedFiles[f]) { console.log("ok")}
				var grid = uploadedFiles[f].fd
				console.log("grid uploaded");

				try {
					var obj = xlsx.parse(grid);
					var i = page - 1;  // only upload one page at a time for now... 

					if (obj[i] && obj[i].data) {						
						var rows = obj[i].data.length;
						var cols = obj[i].data[0].length;

						var fields = obj[i].data[0];

						var nullrecords = 0;
						var empty_limit = 5; // number of empty rows before aborting... 	
						
						var records = [];
						var cells = [];
						var map = {};

						for (j=skip; j<rows; j++) {
							var record = [];
							var row  = [];
							var nullrecord = true;
							for (k=0; k<cols; k++) {
								var cell_value = obj[i].data[j][k];
								var cell;
								if (inverse_matrix) {
									cell = String.fromCharCode('A'.charCodeAt(0) + k) + (j+1).toString();
								}
								else {
									cell = String.fromCharCode('A'.charCodeAt(0) + j) + (k+1).toString();									
								}

								if (cell_value !== null) { 
									nullrecord = false;
 								}


 								if (reverse_map && cell_value) {
 									// point unique value to grid position
 									map[cell_value] = cell;
 								}
 								else if (cell_value) {
 									// point unique grid position to value 
 									map[cell] = cell_value;
 								}
							}

							if (nullrecord) { nullrecords++ }
							if (nullrecords > empty_limit) { j= rows.length }

						} 

						console.log("Upload Data: " + JSON.stringify(map));
						deferred.resolve({grid: obj, map: map, headers: fields});
					}
					else {
						console.log(" No data from page " + i  );
						deferred.reject("could not find grid data");
					}
				}
				catch (e) {
					console.log("ERROR: " + e);
					deferred.reject(e); 
				};
			}
		});
	
		return deferred.promise;
	},

	uploadMatrixFile : function (file, options) {
		var deferred = q.defer();

		if (!options) { options = {} }

		var Samples = options.samples;
		var update = options.update;
		var force = options.force;

		var data = [];
		var errors = [];
		var warnings = [];
		var messages = [];

		var reverse_map = false;
		if (update && update.match(/position/)) { reverse_map = true }
		else if (!Samples) {
			console.log("cannot update barcodes without Samples");
			deferred.reject();
		}

		Upload.uploadFile(file, { inverse_matrix: true, reverse_map : reverse_map })
		.then ( function (result) {
			var grid_map = result.map;

			var query = "SELECT Attribute_ID as att_Id FROM Attribute WHERE Attribute_Name = 'Matrix_Barcode'";
			Record.query_promise(query)
			.then ( function (result) {
				if (result && result.length==1) {
					var MatrixAttribute_ID = result[0].att_Id;
					if (Samples && update.match('barcode')) {
						console.log("updating matrix barcode for localized samples");
						Upload.uploadMatrixAttributes(Samples, grid_map, {attribute:MatrixAttribute_ID, force: force})
						.then ( function (ok) {
							deferred.resolve(ok);
						})
						.catch ( function (err) {
							deferred.reject (err);
						});
					}
					else if (!Samples && update.match('position')) {
						console.log("updating position for existing matrix barcodes");
						Upload.uploadMatrixPositions(grid_map, {attribute:MatrixAttribute_ID, force: force})
						.then ( function (ok) {
							deferred.resolve(ok);
						})
						.catch ( function (err) {
							deferred.reject (err);
						});						
					}
					else { 
						errors.push('can only update matrix barcodes for scanned samples; if no samples scanned, matrix barcodes must exist to enable position specfication');
						deferred.reject('invalid update request');
					}
				}
				else {
					deferred.reject("could not retrieve Matrix Barcode Attribute");
				}
			})
			.catch ( function (err) {
				console.log('failed looking for matrix barcode attribute');
				deferred.reject(err);
			});
		})
		.catch ( function (err) {
			conslole.log("Error uploading file");
			deferred.reject(err);
		});

		return deferred.promise;
	},

	uploadMatrixAttributes : function (Samples, map, options) {
		console.log("uploading matrix attributes...");
		console.log(JSON.stringify(map));

		var deferred = q.defer();

		if (!options) { options = {} }
		var MatrixAttribute_ID = options.attribute;
		var force = options.force;

		var data = [];
		var errors = [];
		var warnings = [];
		var messages = [];

		var barcoded_ids = [];
		var barcoded_value = [];

		var positions = Object.keys(map);
		
		var empty = 0;
		var applied = 0;
		new_codes = [];
		// for (var i=0; i<rows; i++) {
		// 	for (var j=1; j<=cols; j++) {
		for (var i=0; i<positions.length; i++) {			
				var posn = positions[i];	
				// // var posn =  row_labels[i];
				// //if (i<10) { posn = posn + '0' }
				// posn = posn + j.toString();

				// map[posn] = obj[f].data[i][j-1];

				if ( map[posn].match(/(EMPTY|No Tube)/i) ) { empty++ }
				// console.log("MAP " + map[posn]);

				applied = applied + 1;
				new_codes.push( map[posn] );
			// }

		}

		if (applied > Samples.length + empty) {
			var expected = applied - empty;
			warnings.push(expected + " Matrix tubes expected, but only " + Samples.length + " current Samples found");
		}
		else if (Samples.length + empty > applied) {
			warnings.push(Samples.length + " active Samples, but data supplied for " + applied);
		}

		console.log(Samples.length + ' Sample(s) found');
		if (empty) { 
			console.log(empty + ' marked as empty');
			warnings.push(empty + ' Empty wells identified (okay)');
		}
		
		// First check for conflicts (matrix barcode already set to another sample )
		var query = "SELECT FK_Plate__ID as id, Attribute_Value as barcode from Plate_Attribute where FK_Attribute__ID = " + MatrixAttribute_ID;
		query = query + " AND Attribute_Value IN ('" + new_codes.join("','") + "')";
		console.log(query);
		Record.query_promise(query)
		.then ( function (result) {
			console.log(JSON.stringify(result));

			var barcoded_ids = _.pluck(result, 'id');
			var barcoded_values  = _.pluck(result, 'barcode');

			var exists = {};
			for (var i=0; i<result.length; i++) {
				exists[result[i].barcode] = result[0].id;
			}


			for (var i=0; i<Samples.length; i++) {
				console.log("Sample #" + i + ": " + JSON.stringify(Samples[i]));
				var id = Samples[i].id;
				var position = Samples[i].position;
				if (position) {
					var mapped = map[position] || map[position.toUpperCase()];
					if (mapped) {
						var barcoded_index = barcoded_ids.indexOf(id);
						console.log('MB: ' + id + ' : ' + barcoded_index + ' <> ' + mapped);
						
						if (barcoded_index >= 0) {
							if (barcoded_values[barcoded_index] === mapped) {
								console.log("Already mapped... ignoring");
								warnings.push(position + ': BCG#' + barcoded_ids[barcoded_index] + ' already defined as: ' + mapped + ' (okay ... skipping)');
							}
							else {
								errors.push(position + ': BCG#' + barcoded_ids[barcoded_index] + " conflict: '" + barcoded_values[barcoded_index] + "' (in DB) != '" + mapped + "' (in file) ... aborting");
							}
						}
						else if ( exists[mapped] ) {
							if (exists[mapped] === id) {
								messages.push(position + ": Barcode already defined for " + id + " as: " + mapped);
							}
							else {
								errors.push(position + ': ' + mapped + " is already assigned to another sample ! [BCG" + exists[mapped] + "] - please investigate !");
							}
						}
						else {
							messages.push(position + ": Set matrix barcode for BCG# " + id + ": " + mapped);
							data.push([id, mapped]);
						}
					}
					else {
						warnings.push(position + ": Nothing mapped");
					}
				}
				else {
					errors.push("No position data for sample #" + i + ' : ' + id);
				}					
			}

			console.log("upload " + JSON.stringify(data));

			sails.config.warnings = warnings;

			if (errors.length) {
				// sails.config.errors = errors;
				console.log("Errors: " + JSON.stringify(errors));
				
				var e = new Error(errors[errors.length-1]);
				e.context = 'uploadMatrix';

				deferred.reject(e);
			}
			else if (!force && warnings.length) {
				console.log("Warnings: " + JSON.stringify(warnings));				
				deferred.reject(warnings);
			}
			else {
				sails.config.messages = messages; // only show on success... 

				console.log("Map: " + JSON.stringify(map));
				console.log("Matrix Data: " + JSON.stringify(data));

				var attribute = MatrixAttribute_ID;

				if (data.length) {
					console.log("upload data: ");
					console.log(JSON.stringify(attribute));
					console.log(JSON.stringify(data));

					Attribute.uploadAttributes('Plate', attribute, data)
					.then ( function (result) {
						console.log("Response: " + JSON.stringify(result));
						if (result.affectedRows) {
							console.log(JSON.stringify(sails.config.messages));
							sails.config.messages.push(result.affectedRows + " Matrix barcodes associated with samples");
						}
						deferred.resolve(result);		
					})	
					.catch ( function (err) {
						console.log("Upload Error");
						deferred.reject(err);
					});
				}
				else {
					warnings.push("nothing to update");
					deferred.resolve(	);
				}
			}	
		})
		.catch ( function (err) {
			warnings.push("Could not check for barcode conflicts first ... aborting");
			deferred.reject(err);
		});

		return deferred.promise;
	},

	uploadMatrixPositions : function (map, options) {
		// input maps matrix_barcode -> rack position
		console.log("Relocate matrix barcoded tubes...");
		console.log(JSON.stringify(map));
		if (!options) { options = {} }

		var rack = options.rack;  // if rack specified (positions should be empty)
		var MatrixAttribute_ID = options.attribute;

		var deferred = q.defer();

		var f = 0; // file index

		var barcodes = Object.keys(map);
		
		var applied = 0;
		var empty = 0;
		new_codes = [];
		var reposition = {};

		for (var i=0; i<barcodes.length; i++) {
			console.log(barcodes[i] + " => ");
			var posn = map[barcodes[i]];
			console.log(posn);
			
			if (!barcodes[i]) { empty++ }
			else if (barcodes[i].match(/(EMPTY|No Tube)/i) ) { empty++ }
			else {	
				applied = applied + 1;
				new_codes.push( barcodes[i]);
			}
		}
	
		// retrieve ids associated with supplied matrix barcodes
		var query = "SELECT FK_Plate__ID as id, Attribute_Value as barcode from Plate_Attribute where FK_Attribute__ID = " + MatrixAttribute_ID;
		query = query + " AND Attribute_Value IN ('" + new_codes.join("','") + "')";
		console.log(query);

		Record.query_promise(query)
		.then ( function (result) {
			console.log(JSON.stringify(result));
			var ids = {};
			for (var i=0; i<result.length; i++) {
				reposition[result[i].id] = map[result[i].barcode];
				console.log("Move " + result[i].id + ' -> ' + map[result[i].barcode]);
			}

			if (result.length === new_codes.length) {
				console.log('successfully found ' + result.length + ' samples');
			}

			deferred.resolve(reposition);
		})
		.catch ( function (err) {
			e.context = 'uploadMatrixPositions';
			deferred.reject(e);
		});		
		
		return deferred.promise;
	},

	uploadMatrixFileOld : function (file, Samples, options) {

		var deferred = q.defer();

		if (!options) { options = {} }
		var update = options.update;
		var force = options.force;

		var ids = _.pluck(Samples, 'id');
		var query = "SELECT FK_Plate__ID as id, Attribute_ID as att_Id, Attribute_Value as barcode FROM Attribute";
		query = query + " LEFT JOIN Plate_Attribute ON (FK_Attribute__ID=Attribute_ID AND FK_Plate__ID IN (" + ids.join(',') +'))';
		query = query + " WHERE Attribute_Name = 'Matrix_Barcode'";

		var data = [];
		var errors = [];
		var warnings = [];
		var messages = [];

		console.log(query);
		Record.query_promise(query)
		.then ( function (barcoded) {
			console.log('Barcodes: ' + JSON.stringify(barcoded));
			var MatrixAttribute_ID = barcoded[0].att_Id;
			console.log('attribute id: ' + MatrixAttribute_ID);

			var barcoded_ids = [];
 			var barcoded_value = [];

			if (barcoded.length && barcoded[0].id) {
				warnings.push(barcoded.length + ' Barcodes already defined');
				barcoded_ids = _.pluck(barcoded, 'id');
				barcoded_values  = _.pluck(barcoded, 'barcode');
			}

			file.upload({
		    	maxBytes: 100000
		    }, function (err, uploadedFiles) {
				if (err) {
					sails.config.errors.push(err);
					deferred.reject(err);
				}
				else if (uploadedFiles.length == 0) {
					errors.push("no files supplied");
					var e = new Error('no files supplied');
					deferred.reject(e);
				}
				else {
					// assume only one file for now, but may easily enable multiple files if required... 
					console.log("Parsing contents...");
					var f = 0; // file index

					var matrix = uploadedFiles[f].fd

					try {					
						var obj = xlsx.parse(matrix);

						console.log(JSON.stringify(obj));

						var f = 0;
						var rows = obj[f].data.length;
						var cols = obj[f].data[f].length;

						row_labels = ['A','B','C','D','E','F','G','H'];

						console.log("Found " + rows + ' x ' + cols + ' matrix');
						var map = {};
						var applied = 0;
						var empty = 0;

						new_codes = [];
						for (var i=0; i<rows; i++) {
							for (var j=1; j<=cols; j++) {
							
								var posn =  row_labels[i];
								//if (i<10) { posn = posn + '0' }
								posn = posn + j.toString();

								map[posn] = obj[f].data[i][j-1];

								if ( map[posn].match(/(EMPTY|No Tube)/i) ) { empty++ }
								console.log("MAP " + map[posn]);

								applied = applied + 1;
								new_codes.push( map[posn] );
							}

						}

						if (applied > Samples.length + empty) {
							var expected = applied - empty;
							warnings.push(expected + " Matrix tubes expected, but only " + Samples.length + " current Samples found");
						}
						else if (Samples.length + empty > applied) {
							warnings.push(Samples.length + " active Samples, but data supplied for " + applied);
						}

						console.log(Samples.length + ' Sample(s) found');
						if (empty) { 
							console.log(empty + ' marked as empty');
							warnings.push(empty + ' Empty wells identified (okay)');
						}
						
						// First check for conflicts (matrix barcode already set to another sample )
						var query = "SELECT FK_Plate__ID as id, Attribute_Value as barcode from Plate_Attribute where FK_Attribute__ID = " + MatrixAttribute_ID;
						query = query + " AND Attribute_Value IN ('" + new_codes.join("','") + "')";
						console.log(query);
						Record.query_promise(query)
						.then ( function (result) {
							console.log(JSON.stringify(result));
							var exists = {};
							for (var i=0; i<result.length; i++) {
								exists[result[i].barcode] = result[0].id;
							}


							for (var i=0; i<Samples.length; i++) {
								console.log("Sample #" + i + ": " + JSON.stringify(Samples[i]));
								var id = Samples[i].id;
								var position = Samples[i].position;
								if (position) {
									var mapped = map[position] || map[position.toUpperCase()];
									if (mapped) {
										var barcoded_index = barcoded_ids.indexOf(id);
										console.log('MB: ' + id + ' : ' + barcoded_index + ' <> ' + mapped);
										
										if (barcoded_index >= 0) {
											if (barcoded_values[barcoded_index] === mapped) {
												console.log("Already mapped... ignoring");
												warnings.push(position + ': BCG#' + barcoded_ids[barcoded_index] + ' already defined as: ' + mapped + ' (okay ... skipping)');
											}
											else {
												errors.push(position + ': BCG#' + barcoded_ids[barcoded_index] + " conflict: '" + barcoded_values[barcoded_index] + "' (in DB) != '" + mapped + "' (in file) ... aborting");
											}
										}
										else if ( exists[mapped] ) {
											if (exists[mapped] === id) {
												messages.push(position + ": Barcode already defined for " + id + " as: " + mapped);
											}
											else {
												errors.push(position + ': ' + mapped + " is already assigned to another sample ! [BCG" + exists[mapped] + "] - please investigate !");
											}
										}
										else {
											messages.push(position + ": Set matrix barcode for BCG# " + id + ": " + mapped);
											data.push([id, mapped]);
										}
									}
									else {
										warnings.push(position + ": Nothing mapped");
									}
								}
								else {
									errors.push("No position data for sample #" + i + ' : ' + id);
								}					
							}

							console.log("upload " + JSON.stringify(data));

							sails.config.warnings = warnings;

							if (errors.length || (! force && warnings.length)) {
								// sails.config.errors = errors;
								console.log("Errors: " + JSON.stringify(errors));
								
								var e = new Error(errors[errors.length-1]);
								e.context = 'uploadMatrix';

								deferred.reject(e);
							}
							else {
								sails.config.messages = messages; // only show on success... 

								console.log("Map: " + JSON.stringify(map));
								console.log("Matrix Data: " + JSON.stringify(data));

								var attribute = MatrixAttribute_ID;

								if (data.length) {
									console.log("upload data: ");
									console.log(JSON.stringify(attribute));
									console.log(JSON.stringify(data));

									Attribute.uploadAttributes('Plate', attribute, data)
									.then ( function (result) {
										console.log("Response: " + JSON.stringify(result));
										if (result.affectedRows) {
											console.log(JSON.stringify(sails.config.messages));
											sails.config.messages.push(result.affectedRows + " Matrix barcodes associated with samples");
										}
										deferred.resolve(result);		
									})	
									.catch ( function (err) {
										console.log("Upload Error");
										deferred.reject(err);
									});
								}
								else {
									warnings.push("nothing to update");
									deferred.resolve(	);
								}
							}	
						})
						.catch ( function (err) {
							warnings.push("Could not check for barcode conflicts first ... aborting");
							
						});
					}
					catch (e) {
						e.context = 'uploadMatrix';
						deferred.reject(e);
					}
				}			
			});
		})
		.catch ( function (err) {
			console.log("Error getting current attributes: " + err);
		});


		return deferred.promise;

	},
};

