'use strict';

var app = angular.module('myApp');

app.controller('Protocol_StepController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function protocol_stepController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol step administrator');        

    $scope.context = 'Protocol_Step';

    $scope.Steps = [];
    $scope.stepNumber = 1;
    $scope.Step = { Number : $scope.stepNumber };
    $scope.Steps.push($scope.Step);

    $scope.initialize = function initialize (config) {
    	if (config && config['record']) {
    		$scope.Record = config['record'];
    	}
        console.log(JSON.stringify(config));
        console.log('initialized step');
    }


}]);
