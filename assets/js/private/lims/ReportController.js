'use strict';

var app = angular.module('myApp');

app.controller('ReportController', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ReportController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded report controller');

	$scope.view = {};
	$scope.page = 'view';
	$scope.tableChanged = {};
	$scope.fieldChanged = {};

	$scope.view = {};
	$scope.view_table = [];
	$scope.view_field = [];


   	$scope.load = function(config) {
        console.log('load : ' + JSON.stringify(config));

    }

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);

		if (config['view']) { $scope.view = config['view'] }
		if (config['tables']) { $scope.view_table = config['tables'] }
		if (config['view']) { $scope.view_field = config['view']['fields'].split(',') }
		$scope.form = {
			report: $scope.view,
			table: $scope.view_table,
			field: $scope.view_field
		};

		console.log('Config');
		console.log(JSON.stringify($scope.view_field));

		$scope.viewChanged = false;
		for (var i=0; i<$scope.view_table.length; i++) {
			$scope.tableChanged[$scope.view_table[i]] = false;
		}
		for (var i=0; i< $scope.view_field.length; i++) {
			$scope.fieldChanged[$scope.view_field[i]] = false;
		}

	}
	
}]);
