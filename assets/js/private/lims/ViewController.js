'use strict';

var app = angular.module('myApp');

app.controller('ViewController', 
    ['$scope',  function ViewController ($scope) {
  
    console.log('loaded view controller');

	$scope.view = '';

   	$scope.load = function(config) {
        console.log('load : ' + JSON.stringify(config));

    }

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);


	}


	
}]);
