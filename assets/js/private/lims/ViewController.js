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

		var fields = $scope.view.fields;
		var group  = {};
		var search = {};
		var show = {};
		var layer = {};

		$scope.form = {
			view_id: $scope.id,
			show: show,
			fields: fields,
			groupBy:  group,
			search: search,
			layer: layer
		}

		$scope.form.show['Plate_ID'] = true;
		$scope.form.show['FK_Library__Name'] = true;
		$scope.show = ['Plate_ID', 'FK_Library__Name'];

		$scope.form.groupBy['FK_Library__Name'] = true;
		$scope.groupBy = ['FK_Library__Name'];

		$scope.form.layer['FK_Library__Name'] = true;
		$scope.layer = ['FK_Library__Name'];

	}

	$scope.generate = function () {
		var url = "/view";
		var options = $scope.view || {};

		var data = {
			view : $scope.view,
			fields : $scope.show,
			group  : $scope.groupBy,
			layer  : $scope.layer,
			conditions : $scope.conditions
		}		
		console.log("FORM: " + JSON.stringify($scope.form));

		if (0) {
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
	},

	$scope.updateList = function (list, item) {
		console.log("update " + list + ' with ' + item);

		console.log('L1: ' + JSON.stringify($scope[list]));
		if ($scope.form[list][item]) {
			console.log('add ' + item);
			$scope[list].push(item);
		}
		else {
			console.log('remove ' + item);
			var index = $scope[list].indexOf(item);
			if (index >= 0) {
				$scope[list].splice(index, 1);
			}
			
		}
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
