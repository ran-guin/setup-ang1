'use strict';

var app = angular.module('myApp');

app.controller('AdminController', 
['$scope', '$rootScope', '$http', '$q' , 
function adminController ($scope, $rootScope, $http, $q ) {

	$scope.newSlottedBox = function () {

		$scope.reset_messages();
		var url = "/Rack/newBox";

		var data = {
			name : $scope.name,
			parent : $scope.parent,
			size   : $scope.size,
		}

		$http.post(url, data)
		.then ( function (result) {
			var data = result.data;
			var msg = data.message;
			console.log("admin returned:" + JSON.stringify(result));
			$scope.message(msg);
			console.log("MESSAGE: " + msg);
			console.log(JSON.stringify(result));
		})
		.catch ( function (err) {
			$scope.error(err);
		})
	} 
}]);