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
		$scope.upload_type = 'update';       // update or append ... 
		$scope.validated = false;

		if ($scope.data && $scope.data[$scope.page-1] && $scope.data[$scope.page-1].data) {
			$scope.currentPage = $scope.data[$scope.page-1];
		}
		else { 
			console.log('no data on page ' + $scope.page);
			$scope.currentPage = {};
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

		if ($scope.currentPage && $scope.currentPage.data) {
	
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
			if ($scope.currentPage.data && $scope.currentPage.data[$scope.header_row-1]) {
				$scope.headers.push( $scope.currentPage.data[$scope.header_row-1][i-1]);
			}
		}
	}

	$scope.validate_data = function () {
		$scope.reset_messages();
		$scope.validated = false;

		$scope.reload_headers();
		console.log("HEADERS: " + $scope.headers.join(','));

		var model = $scope.model; // default for now testing.. 

		$scope.message("Validating " + $scope.columns + ' on Page ' + $scope.page + ' - ' + $scope.rows + " Records starting on row " + $scope.starting_row);

		$http.post('/parseMetaFields', { model: model, headers: $scope.headers })
		.then ( function (result) {
			var found = result.data;

			console.log("\n** Meta Fields: " + JSON.stringify(result));
			
			var fields = Object.keys(found.fields);
			var attributes = Object.keys(found.attributes);

			var field_columns = [];
			var attribute_columns = [];

			var okay = true;
			for (var i=0; i<$scope.headers.length; i++) {
				var header = $scope.headers[i];
				var el = document.getElementById(header);

				header = header.replace(/ /g, '_');

				console.log("element : " + header);

				if ( el && fields.indexOf(header) >=0 ) { 
					el.style = 'border-color:green';
					var index = attributes.indexOf(header);
					$scope.message(i + " - '" + header + "' is a recognized field for " + model);
					field_columns.push(i);
				}
				else if ( el && attributes.indexOf(header) >=0 ) { 
					el.style = 'border-color:green';
					$scope.message(i + " '" + header + "' is a recognized attribute for " + model);
					attribute_columns.push(i);
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

			$scope.attribute_columns = attribute_columns;
			$scope.field_columns = field_columns;
			if (!okay) {
				var e = new Error(model + ' Data validation errors');
				$scope.remoteLog(e, 'warning', 'Validation Errors');
				$scope.validated_meta_fields = false;
			}
			else {
				var id_index;
				var select;
				var reference;
				if (found.ids && found.ids.index != null ) {
					id_index = found.ids.index;
					$scope.message("Using column: '" + $scope.headers[id_index] + "' as an ID reference for " + model);

					var idField = 'id';
					if (found.ids.alias) {
						idField = found.fields[found.ids.alias];
					}
					select = idField;
				}
				else if ($scope.upload_type.match(/update/i) ) {
					$scope.message("No ID field supplied - using 1st column: " + $scope.headers[0] + ' as a reference (okay) for ' + model);
					$scope.message("Validating reference attributes");

					console.log("BLOCK " + JSON.stringify($scope.dataBlock));

					var alias = $scope.headers[0].replace(/ /g,'_');
					id_index = 0;
					select = 'Plate_ID';
					reference = alias;

					$scope.reference = {};  // clear previous references... 
				}
				else {
					// $scope.message("Appending records.. ");
				}

				var list = [];
				var grid = {};
				for (var i=0; i<$scope.dataBlock.length; i++) {
					var v = $scope.dataBlock[i][id_index+1];
					list.push(v);
					grid[i] = v;
				}

				if (!$scope.upload_type) { 
					$scope.message("id reference found: Upload type defaulting to 'update'");
				}

				// $scope.message("confirming " + model + " id list");
				console.log("found ids: " + JSON.stringify(found.ids));
				$scope.validated_meta_fields = okay;

				console.log("field_indices: " + $scope.field_columns.join(','));
				console.log("attribute_indices: " + $scope.attribute_columns.join(','));
				// $scope.message("Updating field columns: " + $scope.field_columns.join(','));
				// $scope.message("Updating attribute columns: " + $scope.attribute_columns.join(','));

				if ($scope.upload_type.match(/update/i)) {
					$http.post('/validate', { 
						model: model, 
						select: select,
						field: select,
						grid: grid,
						prefix: $scope.Prefix(model),
						reference: reference,
						type: $scope.upload_type,
					})
					// $http.post('/remoteQuery', { query : id_query })
					.then ( function (result) {
						console.log("validation result: " + JSON.stringify(result));
						var list = result.data.validated;
						if (list && list.length == $scope.rows) {
							$scope.validated = okay;
							for (var i=0; i<list.length; i++) {
								var id = list[i].id;
								var ref = list[i].ref;
								var index = list[i].index;
								$scope.reference[ref] = id;
							}
							$scope.message("Found reference IDs for all " + list.length + " " + $scope.headers[0] + " values " + okay);
							console.log("Reference ids: " + JSON.stringify($scope.reference));
							
							$scope.validated_data = list;

							$scope.validated = okay;
						}
						else if (list && list.length) {
							$scope.warning("Could not find all records associated with reference column.  Found " + list.length + ' OF ' + $scope.rows)
							console.log(JSON.stringify(result));
							
							$scope.validated = okay;
						}
						else if ($scope.upload_type.match(/update/i) ) {
							$scope.error("no valid records to update");
							$scope.validated = false;
						}
						else {
							$scope.message("Adding new records");
							$scope.validated = true;
						}
					})
					.catch( function (err) {
						$scope.error("Error validating records " + list.join(', '));
						err.context = 'record validation';

						// $scope.remoteLog(err,'warning');
						$scope.validated = false;
					});
				}
				else { $scope.validated = $scope.validated_meta_fields }
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
		var post = {
			model: model, 
			headers: $scope.headers, 
			data: data, 
			reference: $scope.reference, 
			onDuplicate: $scope.onDuplicate,
			upload_type: $scope.upload_type
		}

		$http.post('/uploadData', post)
		.then ( function (result) {
			console.log("Upload Result " + JSON.stringify(result));

			if (result.data && result.data.error) {
				$scope.parse_standard_error(result.data.error);
				// $scope.error(msg[0]);
			}
			else {
				var changes = 0;
				if (result.data ) {
					if (result.data.duplicates) {
						$scope.warning(result.data.duplicates + ' encountered');
					}
					
					if (result.data.affectedRecords) {
						changes++;
						$scope.message(result.data.affectedRecords + ' records identified');
					
						if (result.data.changedRows == result.data.affectedRows) {
							$scope.message(result.data.changedRows + ' fields/attributes updated')
						} 
						else {
							$scope.message(result.data.changedRows + " of " + result.data.affectedRows + " values updated");
						}

						if (result.data.affectedRecords < result.data.rows) {
							var missed = result.data.rows - result.data.affectedRows;
							$scope.warning(missed + ' records not recognized');
						}
					}

					if (result.data.insertIds && result.data.insertIds.length) {
						changes++;
						$scope.message("Added " + result.data.insertIds.length + ' ' + model + " records (new ids: " + result.data.insertIds[0] + ' ...)');
					}
				}
				else { 
					$scope.warning("update results missing");
				}

				if (!changes) {
					$scope.warning('no records found to update');
				}
			}
		})
		.catch ( function (err) {
			console.log("uploadData error: " + err);
			var msg = $scope.parse_standard_error(err);
			$scope.remoteLog(err,'warning');
			$scope.error(msg);
		});
	}
}]);
