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
			if (err) return res.serverError(err);
			else if (uploadedFiles.length == 0) {                                   
				deferred.reject("Error: No File Uploaded");
			}
			else {
				// assume only one file for now, but may easily enable multiple files if required... 
				console.log("Parsing contents...of page " + page + ' [ skip ' + skip + ' line(s)]');
				var f = 0; // file index

				if (uploadedFiles[f]) { console.log("ok")}
				var matrix = uploadedFiles[f].fd
				console.log("matrix set");

				try {
					var obj = xlsx.parse(matrix);
					var i = page;  // only upload one page at a time for now... 

					console.log("OBJ: " + JSON.stringify(obj));
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

					console.log("Data: " + JSON.stringify(obj));
					deferred.resolve(obj);
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

		file.upload({
	    	maxBytes: 100000
	    }, function (err, uploadedFiles) {
			if (err) {
				sails.config.errors.push(err);
				deferred.reject(err);
			}
			else if (uploadedFiles.length == 0) {
				sails.config.errors.push("no files supplied");
				deferred.reject('no files supplied');
			}
			else {
				// assume only one file for now, but may easily enable multiple files if required... 
				console.log("Parsing contents...");
				var f = 0; // file index

				var matrix = uploadedFiles[f].fd

//				try {
					var obj = xlsx.parse(matrix);

					console.log(JSON.stringify(obj));

					var f = 0;
					var rows = obj[f].data.length;
					var cols = obj[f].data[f].length;

					columns = ['A','B','C','D','E','F','G','H'];

					var map = {};
					var applied = 0;
					for (var i=1; i<=rows; i++) {
						for (var j=0; j<cols; j++) {
						
							var posn =  columns[j];
							//if (i<10) { posn = posn + '0' }
							posn = posn + i.toString();

							map[posn] = obj[f].data[i-1][j];
							applied = applied + 1;
						}

					}

					var data = [];
					var errors = [];
					var warnings = [];

					if (applied > Samples.length) {
						warnings.push(applied + " Matrix tubes scanned, but only " + Samples.length + " current Samples found");
					}
					else if (Samples.length > applied) {
						warnings.push(Samples.length + " active Samples, but data supplied for " + applied);
					}

					console.log(Samples.length + ' Sample found');

					for (var i=0; i<Samples.length; i++) {
						console.log("Sample #" + i + ": " + JSON.stringify(Samples[i]));
						var id = Samples[i].id;
						var position = Samples[i].position;
						if (position) {
							var mapped = map[position] || map[position.toUpperCase()];
							if (mapped) {
								data.push([id, mapped]);
							}
							else {
								warnings.push("Nothing mapped to " + position);
							}
						}
						else {
							errors.push("No position data for sample #" + i + ' : ' + id);
						}					
					}

					sails.config.warnings = warnings;
					sails.config.errors = errors;

					if (errors.length || (! force && warnings.length)) {
						console.log("Errors: " + JSON.stringify(errors));
						deferred.reject(errors);
					}
					else {
						console.log("Map: " + JSON.stringify(map));
						console.log("Matrix Data: " + JSON.stringify(data));

						var MatrixAttribute_ID = 66;  // testing - replace with query to database... 
						var attribute = MatrixAttribute_ID;

						Attribute.uploadAttributes('Plate', attribute, data)
						.then ( function (result) {
							console.log("Response: " + JSON.stringify(result));
							if (result.affectedRows) {
								console.log(JSON.stringify(sails.config.messages));
								sails.config.messages.push(result.affectedRows + " Matrix barcodes associated with samples");
							}
							console.log('resolved');
							deferred.resolve();		
						})	
						.catch ( function (err) {
							console.log("Upload Error" + JSON.stringify(err));
							deferred.reject(err);
						});
					}		
/*					
				}
				catch (e) {
					deferred.reject("Error loading excel file: " + e);
				}
*/
			}
			
			return deferred.promise;
		});
	},
};

