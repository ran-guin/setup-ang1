'use strict';

var app = angular.module('myApp');

app.controller('UploadController', 
['$scope', '$rootScope', '$http', '$q' , 
function uploadController ($scope, $rootScope, $http, $q) {


	$scope.headers = [];
	$scope.data = [];

	$scope.initialize = function (config) { 
		if (config) {
			$scope.data = config['data'];
		}

		$scope.page = 1;
		$scope.skip = 0;
		$scope.starting_row = 2;
		$scope.starting_column = 1;
		$scope.rows = 0;
		$scope.columns = 0;

		$scope.header_row = 1;
		$scope.header_rows = 1;

		$scope.onDuplicate = '';  // allow for Ignore or Update... (Note: update only works for mysql...)

		$scope.validated = false;

		if ($scope.data && $scope.data[$scope.page-1] && $scope.data[$scope.page-1].data) {
			$scope.currentPage = $scope.data[$scope.page-1];
		}		
 
 		$scope.model = 'container'
		$scope.initiate_page();

	}

	$scope.initiate_page = function () {

		$scope.reset_messages();
		$scope.messages.push("Attempting to auto-locate data for uploading...");
		if ($scope.currentPage.data && $scope.currentPage.data.length) {
			// find first row with values in first two columns
			for (var row=0; row< $scope.currentPage.data.length; row++) {
				if ( $scope.currentPage.data[row]
					&& $scope.currentPage.data[row].length >= 2
					&& $scope.currentPage.data[row][0]
					&& $scope.currentPage.data[row][1] 
					) { 
						$scope.starting_row = row + $scope.header_rows + 1; 
						$scope.header_row = row + 1;
						row = $scope.currentPage.data.length 
						
						var header = $scope.currentPage.data[$scope.header_row-1];
						console.log($scope.header_row + " HEADER: " + header.join(','));
						var headers = [];
						$scope.columns = 0;
						for (var col=0; col<header.length; col++) {
							if (header[col] && header[col].length) {
								// ok
								if ( headers.indexOf(header[col]) >= 0 ) {
									$scope.columns = col;  // exclude this column since it is the first repeat ... 
									var msg = "'" + header[col] + "' column repeated.  Truncating data here after " + $scope.columns + ' columns ';
									$scope.warning(msg);
									$scope.warning("Note: you may extend the number of columns manually below, but you must change the headers to ensure they are unique");
									col=$scope.currentPage.data.length;
								}
								else {
									headers.push(header[col])
									$scope.columns++;
								}
							}
							else {
								$scope.messages.push("empty data column found... setting columns to " + col);
								col = $scope.currentPage.data.length;
							}
						}

						$scope.rows = 0;
						for (row=$scope.starting_row; row<=$scope.currentPage.data.length; row++) {
							if (! $scope.currentPage.data[row-1][0]) {
								$scope.rows = row-1;
								row = $scope.currentPage.data.length;
							} 
							else {
								$scope.rows++;
							}

						}
				}
				else {
					if ($scope.starting_row) { $scope.rows = row - $scope.starting_row }
				}
			}

			if ($scope.starting_row && $scope.columns) { 
				$scope.messages.push('Found ' + $scope.columns + " columns x " + $scope.rows + ' Records.  Starting on Row: ' + $scope.starting_row);
				$scope.get_block({ retain_messages : true });
			}
			else { $scope.warnings.push("Could not auto-set starting row & column length") }
		}
	}

	$scope.get_block = function (options) {

		if (!options) { options = {} }		
		if ( ! options.retain_messages ) { $scope.reset_messages() }
		$scope.validate_settings();
		
		if ($scope.data && $scope.data[$scope.page-1] && $scope.data[$scope.page-1].data) {
			$scope.currentPage = $scope.data[$scope.page-1];
		}		

		if ($scope.currentPage) {
	
			console.log('PAGE DATA' + JSON.stringify($scope.currentPage));

			console.log("Page: " + $scope.page + ' of ' + $scope.data.length);
			
			$scope.header_row = $scope.starting_row - 1;
			var header = $scope.currentPage.data[$scope.header_row-1];

			// $scope.currentHeaders = $scope.headers;
			$scope.headers = [];
			for (var col=$scope.starting_column; col<=$scope.starting_column + $scope.columns - 1; col++) {
				
				//var resetHeader = $scope.currentHeaders[col-1] || header[col-1];
				if (header && header[col-1]) {
					$scope.headers.push(header[col-1]);
				}
				else {
					$scope.errors.push("Header at column " + col + ' is undefined');
					$scope.headers.push(null);
				}
			}

			$scope.dataBlock = [];
			console.log("LOAD " + $scope.starting_row + ' (' + $scope.rows + ') x ' + $scope.starting_column + ' (' + $scope.columns );

			for (var row=$scope.starting_row; row<=$scope.starting_row+$scope.rows-1; row++) {
				var thisRow = [row];
				for (var col=$scope.starting_column; col<=$scope.starting_column+$scope.columns-1; col++) {
					if ($scope.currentPage.data[row-1] != null ) {
						thisRow.push($scope.currentPage.data[row-1][col-1]);
					}
					else {
						$scope.warning("Data on row " + row + ' is undefined - skipping row')
					}
				}
				if (thisRow.length === $scope.columns+1) { $scope.dataBlock.push(thisRow) }
			}
		}
	}

	$scope.validate_settings = function () {
		if ($scope.starting_row < 1) {
			$scope.starting_row = 1;
			$scope.error("Cannot start data on row before row 1");
		}
		if ($scope.starting_column < 1) {
			$scope.starting_column = 1;
			$scope.error("Cannot start column before column 1");
		}
		$scope.reload_headers();
		console.log("HEADERS " + JSON.stringify($scope.headers));
	}	

	$scope.reload_headers = function () {
		$scope.headers = [];
		for (var i=$scope.starting_column; i<=$scope.starting_column+$scope.columns-1; i++) {
			$scope.headers.push( $scope.currentPage.data[$scope.header_row-1][i-1]);
		}
	}

	$scope.validate_data = function () {
		$scope.reset_messages();

		$scope.reload_headers();
		console.log("HEADERS: " + $scope.headers.join(','));

		var model = $scope.model; // default for now testing.. 

		$scope.message("Validating headers for " + $scope.columns + ' columns for ' + $scope.rows + " Records starting on row " + $scope.starting_row + ' of Page ' + $scope.page );

		$http.post('/parseMetaFields', { model: model, headers: $scope.headers })
		.then ( function (result) {
			var found = result.data;

			console.log("\n** Meta Fields: " + JSON.stringify(result));
			
			var fields = Object.keys(found.fields);
			var attributes = Object.keys(found.attributes);

			var okay = true;
			for (var i=0; i<$scope.headers.length; i++) {
				var header = $scope.headers[i];
				var el = document.getElementById(header);

				header = header.replace(/ /g, '_');

				console.log("element : " + header);

				if ( el && fields.indexOf(header) >=0 ) { 
					el.style = 'border-color:green';
					$scope.message("'" + header + "' is a recognized field for " + model);
				}
				else if ( el && attributes.indexOf(header) >=0 ) { 
					el.style = 'border-color:green';
					$scope.message("'" + header + "' is a recognized attribute for " + model);
				}
				else if (el) { 
					$scope.error("'" + header + "' not a recognized field or attribute for " + model + " - (case sensitive)");
					el.style = 'border-color:red';
					okay = false;
				}
				else { 
					$scope.error(header + " not a recognized field or attribute for " + model);
					console.log("Attributes: " + JSON.stringify(attributes));
					okay = false;
				}
			}

			if (!okay) {
				var e = new Error(model + ' Data validation errors');
				$scope.remoteLog(e, 'warning', 'Validation Errors');
				$scope.validated = false;
			}
			else {
				if (found.ids && found.ids.index != null )  {
					var id_index = found.ids.index;
					$scope.message("Using column: '" + $scope.headers[id_index] + "' as an ID reference for " + model);
				}
				else { 
					$scope.message("No ID field supplied - using 1st column: " + $scope.headers[0] + ' as a reference (okay) for ' + model);
				}

				if (found.ids && found.ids.index != null ) {
					$scope.message("confirming " + model + " id list");
					$scope.validated = okay;
				}
				else {
					$scope.message("Validating reference attributes");

					console.log("BLOCK " + JSON.stringify($scope.dataBlock));
					var list = [];
					for (var i=0; i<$scope.dataBlock.length; i++) {
						var v = $scope.dataBlock[i][1];
						list.push(v);
					}

					var alias = $scope.headers[0].replace(/ /g,'_');

					var query = "SELECT DISTINCT FK_Plate__ID as id, Attribute_Value as ref FROM Plate_Attribute,Attribute WHERE FK_Attribute__ID=Attribute_ID ";
					query = query + " AND Attribute_Name like '" + alias + "' AND Attribute_Value IN ('" + list.join("','") + "')";

					console.log("Q: " + query);

					$scope.reference = {};  // clear previous references... 

					$http.post('/remoteQuery', { query : query })
					.then ( function (result) {
						var list = result.data;
						if (list.length == $scope.rows) {
							$scope.validated = okay;
							for (var i=0; i<list.length; i++) {
								var id = list[i].id;
								var ref = list[i].ref;
								$scope.reference[ref] = id;
							}
							$scope.message("Found reference IDs for all " + list.length + " " + $scope.headers[0] + " values " + okay);
							$scope.validated = okay;
						}
						else {
							$scope.error("Could not find all records associated with reference column.  Found " + list.length + ' OF ' + $scope.rows)
							$scope.validated = false;
						}
					})
					.catch( function (err) {
						$scope.error("Error confirming attribute data from query " + query);
						err.context = 'confirming attribute data';

						$scope.remoteLog(err,'warning');
						$scope.validated = false;
					});
				}
			}

		})
		.catch ( function (err) {
			$scope.remoteLog(err,'warning');
			$scope.validated = false;
			$scope.error(err);
		});		
	}

	$scope.modify = function () {
		$scope.validated = false;
	}


	$scope.upload = function () {
		
		var data = $scope.dataBlock;
		$scope.reload_headers();

		var model = $scope.model; // default for now testing.. 

		console.log("\n** Upload Headers: " + JSON.stringify($scope.headers));
		console.log("\n** Upload References: " + JSON.stringify($scope.reference));

		$scope.reset_messages();
		$http.post('/uploadData', { model: model, headers: $scope.headers, data: data, reference: $scope.reference, onDuplicate: $scope.onDuplicate })
		.then ( function (result) {
			console.log("Upload Result " + JSON.stringify(result));
			if (result.data && result.data.error) {
				$scope.parse_standard_error(result.data.error);
				// $scope.error(msg[0]);
			}
			else {
				if (result.data && result.data.length) {
					var count = 0;
					var total_changed = 0;
					for (var i=0; i<result.data.length; i++) {
						var messages = [];
						var more = result.data[i].affectedRows || 0;
						
						if (result.data[i].message) {
							messages.push(result.data[i].message);
						}

						if (result.data[i].set) { 
							if (result.data[i].set.affectedRows) {
								more += result.data[i].set.affectedRows;
							}
							if (result.data[i].set.message) {
								messages.push(result.data[i].set.message);
							}
						}
						if (result.data[i].updated) { 
							if (result.data[i].updated.affectedRows) {							
								more += result.data[i].updated.affectedRows;
							}
							if (result.data[i].updated.message) {
								messages.push(result.data[i].updated.message);
							}
						}							

						var msg = '' + messages.join('; ');
						count = count + more;

						var change_message = msg.match(/Changed: (\d+)/);
						if (change_message && change_message[1]) {
							// may need to adjust for multiple changed messages (?)
							var changed = parseInt(change_message[1]) || 0;
							total_changed = total_changed + changed;
						}
					}

					if (count) {
						$scope.message("Added/Updated " + count + " Data Record(s)");
						if ($scope.onDuplicate === 'replace') { $scope.message('(Note: replaced records count as 2 updates (delete + insert)') }
					}
					if (total_changed) {
						$scope.message(total_changed + " Values Edited");
					}
					if (!count && !total_changed) {
						$scope.message('No changes detected')
					}
				}
				else { 
					$scope.warning("No rows affected");
				}
			}
		})
		.catch ( function (err) {
			var msg = $scope.parse_standard_error(err);
			$scope.remoteLog(err,'warning');
			$scope.error(msg);
		});
	}
}]);
