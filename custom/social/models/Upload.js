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

				var obj;
				try {
					obj = xlsx.parse(matrix);
					var i = page;  // only upload one page at a time for now... 

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
				}
			}
		});
	
		return deferred.promise;
	}

};

