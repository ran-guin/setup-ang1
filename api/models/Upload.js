/**
* Upload.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var xlsx = require('node-xlsx');

module.exports = {

	attributes: {

	},


  	uploadFile : function (file, options) {

		var deferred = q.defer();

		if (!options) { options = {} }

		var page = options['page'] ||  1;
		var skip = options['skip'];																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						

		file
	    .upload({
	    	maxBytes: 500000
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
				var matrix = uploadedFiles[f].fd
				console.log("matrix uploaded");

				try {
					console.log('parse');
					var obj = xlsx.parse(matrix);
					console.log('parsed');
					var i = page - 1;  // only upload one page at a time for now... 

					console.log(i + " OBJ: " + JSON.stringify(obj));
					if (obj[i] && obj[i].data) {
						console.log("Data: " + JSON.stringify(obj[i].data) );

						
						var rows = obj[i].data.length;
						var cols = obj[i].data[0].length;

						var fields = obj[i].data[0];
						console.log("Field: " + fields.join(', '));

						var nullrecords = 0;
						var empty_limit = 5; // number of empty rows before aborting... 	
						var records = [];
						for (j=skip; j<rows; j++) {
							var record = [];
							var nullrecord = true;
							for (k=0; k<cols; k++) {
								var cell = obj[i].data[j][k];
								
								if (cell != null) { 
									nullrecord = false;
									console.log(i + ': [' + j + ',' + k + '] = ' + cell );
								}
								record.push(cell);
							}

							if (nullrecord) { nullrecords++ }
							if (nullrecords > empty_limit) { j= rows.length }

							if (record[0]) { records.push(record) }  // only read records with populated first column ... 
						}

						console.log("Upload Data: " + JSON.stringify(obj));
						deferred.resolve(obj);
					}
					else {
						console.log(" No data from page " + i  );
						deferred.reject("could not find matrix data");
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

	uploadMatrixFile : function (file, Samples, options) {

		var deferred = q.defer();

		if (!options) { options = {} }
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

						new_codes = [];
						for (var i=0; i<rows; i++) {
							for (var j=1; j<=cols; j++) {
							
								var posn =  row_labels[i];
								//if (i<10) { posn = posn + '0' }
								posn = posn + j.toString();

								map[posn] = obj[f].data[i][j-1];
								applied = applied + 1;
								new_codes.push( map[posn] );
							}

						}

						if (applied > Samples.length) {
							warnings.push(applied + " Matrix tubes expected, but only " + Samples.length + " current Samples found");
						}
						else if (Samples.length > applied) {
							warnings.push(Samples.length + " active Samples, but data supplied for " + applied);
						}

						console.log(Samples.length + ' Sample(s) found');
						
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
												warnings.push('BCG#' + barcoded_ids[barcoded_index] + ' already defined as: ' + mapped + ' (okay ... skipping)');
											}
											else {
												errors.push('BCG#' + barcoded_ids[barcoded_index] + ': ' + barcoded_values[barcoded_index] + ' (in DB) != ' + mapped + ' (in file) ... skipping');
											}
										}
										else if ( exists[mapped] ) {
											if (exists[mapped] === id) {
												messages.push("Barcode already defined for " + id + " as: " + mapped);
											}
											else {
												errors.push(mapped + " is already assigned to another sample ! [BCG" + exists[mapped] + "] - please investigate !");
											}
										}
										else {
											messages.push("Set matrix barcode for BCG# " + id + ": " + mapped);
											data.push([id, mapped]);
										}
									}
									else {
										warnings.push("Nothing mapped to " + position);
									}
								}
								else {
									errors.push("No position data for sample #" + i + ' : ' + id);
								}					
							}

							console.log("upload " + JSON.stringify(data));

							sails.config.warnings = warnings;
							// sails.config.errors = errors;
							sails.config.messages = messages;

							if (errors.length || (! force && warnings.length)) {
								console.log("Errors: " + JSON.stringify(errors));
								errors.push("Aborting due to errors");
								
								var e = new Errors('Errors detected');
								e.context = 'uploadMatrix';
								deferred.reject(e);
							}
							else {
								console.log("Map: " + JSON.stringify(map));
								console.log("Matrix Data: " + JSON.stringify(data));

								var attribute = MatrixAttribute_ID;

								if (data.length) {
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

