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

	console.log("LOAD Admin Controller");


	$scope.activate_user = function (user) {

		var status = 'active';
		var access = 'lab';

		if (user.id && user.name) {  // defined by setup_Menu... 

			if ($scope.access == 'deactivate') { status = 'inactive' }
			else if ($scope.access == 'lab admin') { access = 'lab admin'}
			else if ($scope.access == 'admin' ) { access = 'admin' }

			var data = { user : { id: user.id, access: access, status: status} };

			console.log('Set access for ' + user.name + ' [' + user.id + '] to ' + status + ' ' + access + ' = ' + $scope.access);

			$http.post('/User/activate', data, { headers: $scope.http_headers })
			.then ( function (response) {
				var msg = "Activated  " + user.name;
				if (response.data && response.data.access) {
					msg += " with " + response.data.access + ' access';
				}
				
				console.log(msg);
				$scope.message(msg);
			})
			.catch ( function (err) {
				console.log("Error: " + err);
				$scope.error("Error granting user access: " + err);
			});
		}
		else {
			$scope.error("User must first be selected");
		}
	}
}]);