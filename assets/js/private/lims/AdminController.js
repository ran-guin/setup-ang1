'use strict';

var app = angular.module('myApp');

app.controller('AdminController', 
['$scope', '$rootScope', '$http', '$q' , 
function adminController ($scope, $rootScope, $http, $q ) {

	$scope.access = 'lab';
	$scope.all_users = false;

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);
	}

	$scope.activate_user = function () {

		var status = 'active';
		var access = 'lab';

		if ($scope.access == 'deactivate') { status = 'inactive' }
		else if ($scope.access == 'lab admin') { access = 'lab admin'}
		else if ($scope.access == 'admin' ) { access = 'admin' }

		var data = { user : { id: $scope.limsuser.id, access: access, status: status} };

		console.log('Set access for ' + $scope.limsuser.id + ' to ' + status + ' ' + access + ' = ' + $scope.access);

		$http.post('/User/activate', data)
		.then ( function (response) {
			var msg = "Activated  " + $scope.limsuser.name + " with " + response.data.access + ' access';
			console.log(msg);
			$scope.message(msg);
		})
		.catch ( function (err) {
			console.log("Error: " + err);
			$scope.error("Error granting user access: " + err);
		});
	}
}]);