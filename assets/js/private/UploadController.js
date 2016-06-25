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

		$scope.validated = false;

		if ($scope.data && $scope.data[$scope.page-1] && $scope.data[$scope.page-1].data) {
			$scope.currentPage = $scope.data[$scope.page-1];
		}		

		$scope.messages.push("Initialize");
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
									var msg = col + ': ' + header[col] + ' -> ' + headers.indexOf(header[col]);
									$scope.columns = col;  // exclude this column since it is the first repeat ... 
									$scope.warnings.push("Repeat column heading found : " + " limiting to " + $scope.columns+ ' columns ' + msg);
									console.log("Repeat column heading found ... limiting to " + $scope.columns + ' columns ')
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

		var model = $scope.model || 'container'; // default for now testing.. 

		$scope.message("Validating " + model + " : " + $scope.headers.join(','))
		$http.post('/parseMetaFields', { model: model, headers: $scope.headers })
		.then ( function (result) {
			var found = result.data;

			console.log("\n** Meta Fields: " + JSON.stringify(result));
			
			var fields = Object.keys(found.fields);
			var attributes = Object.keys(found.attributes);
			var id_index = _.pluck(found.ids, 'index');

			if (! id_index ) {
				$scope.error("no id column");
				$scope.validated = false;
			}
			else if (attributes.length + fields.length !== $scope.headers.length) {
				$scope.error("Expected " + $scope.headers.length + " Fields, but only found " + attributes.length + ' attributes + ' + fields.length + ' fields');
				$scope.validated = false;
			}
			else {
				$scope.message($scope.headers.length + " fields / attributes found"); 
				$scope.validated = true;
			}
		})
		.catch ( function (err) {
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

		var model = $scope.model || 'container'; // default for now testing.. 

		console.log("CALL uploadData with " + JSON.stringify($scope.headers));

		$http.post('/uploadData', { model: model, headers: $scope.headers, data: data })
		.then ( function (result) {
			console.log("Upload Result " + JSON.stringify(result));
		})
		.catch ( function (err) {
			$scope.error(err);
		});
	}
}]);
