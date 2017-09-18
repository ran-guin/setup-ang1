'use strict';

var app = angular.module('myApp');

app.controller('ReportController', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ReportController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded report controller');

	$scope.report = '';

   	$scope.load = function(config) {
        console.log('load : ' + JSON.stringify(config));

    }

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);

		$scope.report = config['report'] || {};
		$scope.report_table = config['tables'] || [];
		$scope.report_field = config['fields'] || [];

		$scope.form = {
			report: $scope.report,
			table: $scope.report_table,
			field: $scope.report_field
		};

		$scope.viewChanged = false;
		for var(i=0; i< $scope.report_table.length; i++) {
			$scope.tableChanged[$scope.report_table[i]] = false;
		}
		for var(i=0; i< $scope.report_field.length; i++) {
			$scope.fieldChanged[$scope.report_field[i]] = false;
		}
	}
	
}]);
