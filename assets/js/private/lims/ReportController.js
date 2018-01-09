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
		// if (config['tables']) { $scope.view_table = config['tables'] }
		// if (config['view']) { $scope.view_field = config['view']['fields'].split(',') }

		$scope.form = {
			report: $scope.view,
			table: {},
			field: {}
		};

		var tatts = ['title','table_name', 'join_condition','left_join'];
		var fatts = ['field','prompt', 'type', 'mandatory','pre_picked','default_search'];

		var boolean = ['left_join','mandatory','pre_picked'];

		console.log($scope.view.field_data.length + " FIELDS RETRIEVED...");
		console.log(JSON.stringify($scope.view.field_data[0]));
				
		$scope.tableChanged = false;
		$scope.fieldChanged = false;

		for(var i=0; i<$scope.view.field_data.length; i++) {
			var table = $scope.view.field_data[i].title;
			var field = $scope.view.field_data[i].prompt;

			if (! $scope.form.table[table]) {
				$scope.form.table[table] = {};

				for (var j=0; j<tatts.length; j++) {
					var tatt = tatts[j]
					if (boolean.indexOf(tatt)>=0) {
						if ($scope.view.field_data[i][tatt]) { 
							$scope.form.table[table][tatt] = true
						}
						else {
							$scope.form.table[table][tatt] = false
						}
					}
					else {
						$scope.form.table[table][tatt] = $scope.view.field_data[i][tatt];						
					}
				}
			}
			if (! $scope.form.field[field]) {
				$scope.form.field[field] = {};
				for (var k=0; k<fatts.length; k++) {
					var fatt = fatts[k]
					if (boolean.indexOf(fatt)>=0) {
						if ($scope.view.field_data[i][fatt]) { 
							$scope.form.field[field][fatt] = true
						}
						else {
							$scope.form.field[field][fatt] = false
						}
					}
					else {
						$scope.form.field[field][fatt] = $scope.view.field_data[i][fatt];
					}
				}
			}			
		}

		console.log('Config');
		console.log(JSON.stringify($scope.view_field));

		$scope.viewChanged = false;
		
	}
	
}]);
