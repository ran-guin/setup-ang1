'use strict';

var app = angular.module('myApp');

app.controller('ViewController', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ViewController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded view controller');

	$scope.view = '';

   	$scope.load = function(config) {
        console.log('load : ' + JSON.stringify(config));

    }

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);

		$scope.view = config['view'];
		$scope.data = config['data'];
		$scope.id = config['id'];
		$scope.file = config['file'];
		$scope.excel = config['excel'];
	}

	$scope.generate = function () {
		var url = "/view";

		var options = $scope.view || {};
		
		options.id = $scope.id;
		options.generate = true;
		options.fields = ['Employee_Name', 'thaws'];

		console.log("POST: " + url);
		console.log(JSON.stringify(options));

		$http.post(url, options)
		.then ( function (result) {
			console.log("requested data generation for this view");
			console.log(JSON.stringify(result));
			$scope.message("Generated Results");
		})
		.catch ( function (err) {
			console.log("Error generating view");
		});
	}

	$scope.regenerate = function () {
		console.log("regenerate...");
		$scope.generate();
	}

	$scope.download = function () {
		if ($scope.file) {

			var url = '/download';
			var options = { file: $scope.file };

			$http.post(url, options)
			.then ( function (result) {
				console.log('downloaded file: ' + $scope.file);
			})
			.catch ( function (err) {
				console.log("Error downloading file");
			})
		}
		else{
			console.log("no file to download - remember to select 'generate excel file' when generating results");
		}
	}

	
}]);
