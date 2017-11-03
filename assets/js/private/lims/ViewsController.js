'use strict';

var app = angular.module('myApp');

app.controller('ViewsController', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ViewsController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded views controller');

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);

		$scope.views = config['views'] || {};
		// console.log('Config: ' + JSON.stringify(config));

		$scope.Vstatus = {};

		for (var i=0; i<$scope.views.length; i++) {
			var v = $scope.views[i];
			console.log(v.custom_name + ' : ' + v.active);
			console.log(i + " View " + JSON.stringify($scope.views[i]));
			if (v.active) { $scope.Vstatus[v.id] = 'active' }
			else { $scope.Vstatus[v.id] = 'inactive' }
		}
		console.log('** Status: ' + JSON.stringify($scope.Vstatus));
	}

	$scope.resetStatus = function (id, status) {
		console.log("reset status for custom view " + id + ' to ' + status);
		var url = '/resetReportStatus';
		var data = { custom_id: id, status: status};

		$http.post(url, data)
		.then (function (result) {
			console.log("changed..");
			$scope.message('succeeded in setting status to ' + status);

			$scope.Vstatus[id] = status;
		})
		.catch ( function (err) {
			$scope.warning(status + ' failed');
		});
	}

}]);
