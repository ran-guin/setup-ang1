'use strict';

var app = angular.module('myApp');

app.controller('NewProtocolController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function newProtocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol administrator');        

    $scope.context = 'Lab_Protocol';

    $scope.Steps = [];
    $scope.stepNumber = 1;
    $scope.Step = { Number : $scope.stepNumber };
    $scope.Steps.push($scope.Step);

    $scope.initialize = function initialize () {
        console.log('initialized NPC');
    }

    $scope.initialize();

    $scope.forward = function forward() {
        $scope.stepNumber++;
        
        $scope.reload();

        if ($scope.Steps.length < $scope.stepNumber ) {  
            console.log("create new step #" + $scope.stepNumber + " of " + $scope.Steps.length);
            $scope.Step = { Number : $scope.stepNumber };
            $scope.Steps.push($scope.Step);
            console.log("CURRENT STEP : " + JSON.stringify($scope.Steps[$scope.stepNumber-1]));
        }
        else { 
            console.log("retrieve existing step #" + $scope.stepNumber);
            $scope.Step = $scope.Steps[$scope.stepNumber-1];
        }
    }

    $scope.reload = function reload() {
        var keys = Object.keys($scope.Step);
        console.log("KEYS: " + JSON.stringify(keys));
    }
 
    $scope.back = function back() {
        $scope.stepNumber--;
        $scope.Step = $scope.Steps[$scope.stepNumber-1];

        console.log('back');
    }

    $scope.toggle = function toggle (id) {
        if ($scope.Step[id]) { 
            console.log('turn on ' + id + ':' + $scope.Step[id]);
            // $scope.show[id] = true;
        }
        else { 
            console.log('turn off ' + id + ':' + $scope.Step[id])
            // $scope.Show[id] = false;
        } 
    }

    $scope.save = function save () {

        console.log("Name: " + $scope.name + " : " + $scope.message);

        var fields = ['Solution', 'Transfer', 'Equipment'];
        for (var i=0; i<$scope.Steps.length; i++) {
            console.log("*** Step " + i + " ***");
            //for (var j=0; j<=fields.length; j++) {
            console.log("Set " + JSON.stringify($scope.Steps[i]));
            //}
            
        }   

        console.log("save " + $scope.name + " via API");

        var LPfields = ['name', 'message', 'description'];

        var data = { Steps: $scope.Steps };
        for (var i=0; i<LPfields; i++) {
            data[LPfields[i]] = $scope[LPfields[i]];  // eg Name
        }

        $http.post("/Lab_protocol/save", data )
        .then ( function (result) {
            var id = result.data.id;
            console.log("response: " + JSON.stringify(result));
            console.log("added record: " + id);

        });
    
    }

    $scope.update = function update (id) {
        $scope.Steps[$scope.stepNumber-1][id] = $scope.Step[id];
        console.log("update " + id);
    }

    $scope.add = function complete () {
        // complete step (if validated)
    }

    $scope.summary = function complete () {

    }

}]);
 