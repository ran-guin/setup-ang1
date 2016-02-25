'use strict';

var app = angular.module('myApp');

app.controller('ProtocolController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function protocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol controller');        
    $scope.context = 'Protocol';
    $scope.stepNumber = 1;

    $scope.initialize = function( config ) {
        //  config = { steps: , } 

        if (config && config['steps']) { 
            console.log("loaded protocol steps");
            $scope.Steps = config['steps'];
            $scope.steps = $scope.Steps.length;
        }

        console.log("Steps: " + JSON.stringify($scope.Steps) );

        $scope.reload();
        console.log("protocol initialization complete...");

    }

    $scope.forward = function forward() {
        $scope.stepNumber++;
        console.log('forward');
        $scope.reload();
    }
 
    $scope.back = function back() {
        $scope.stepNumber--;
        console.log('back');
        $scope.reload();
    }

    $scope.complete = function complete () {
        // complete step (if validated)
    }

    $scope.skip = function skip () {
        // skip step (if allowed)
    }

    $scope.repeat = function repeat () {
        // go back one step (if allowed)
    }

    $scope.reload = function reload () {

        $scope.Step = $scope.Steps[$scope.stepNumber-1];

        console.log("Source: " + JSON.stringify($scope.Steps) );
        console.log("GOT STEP " + $scope.stepNumber + " : " + $scope.Step);
        // start custom block //
        $scope.input = $scope.Step['Input'].split(':');
        $scope.defaults = $scope.Step['Protocol_Step_Defaults'].split(':');
        $scope.formats   = $scope.Step['Input_Format'].split(':');
        // end custom block //

        $scope.Show = {};
        $scope.Default = {};
        $scope.Format = {}; 

        for (var i=0; i<$scope.input.length; i++) {
            var input = $scope.input[i];
            $scope.Show[input] = true;
            if ($scope.defaults.length > i) { $scope.Default[input] = $scope.defaults[i]; $scope[input] = $scope.defaults[i] }
            if ($scope.formats.length > i) { $scope.Format[input] = $scope.formats[i] }
        }
        console.log("Step: " + $scope.stepNumber + ' / ' + $scope.steps);
        console.log("Step: " + JSON.stringify($scope.Step));
        console.log("Show: " + JSON.stringify($scope.Show));
        console.log("Defaults: " + JSON.stringify($scope.Default));
        console.log("Format: " + JSON.stringify($scope.Format));
        console.log("Input: " + JSON.stringify($scope.input));
    }

}]);
