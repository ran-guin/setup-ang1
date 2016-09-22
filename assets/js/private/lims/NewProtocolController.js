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

    $scope.initialize = function (config, options) {
        console.log("initialize protocol controller");
        $scope.initialize_payload(config);

        console.log("Config: " + JSON.stringify(config));
        
        if (config && config['Steps']) {
            console.log("Steps: " + JSON.stringify(config['Steps']));
            $scope.Steps = config['Steps'];
            $scope.name = $scope.Steps[0].name;
            $scope.description = $scope.Steps[0].description;
            $scope.Container_format = $scope.Steps[0].Container_format;
            $scope.Sample_type = $scope.Steps[0].Sample_type;
            $scope.action = 'edit';
            $scope.Step = $scope.Steps[0];
            console.log('detected init to ' + $scope.Sample_type);
        }
        else {
            $scope.action = 'create';
        }
    }

    $scope.$watch('Steps', function (val) {
        console.log("detected update to steps..." + $scope.Steps[0].Sample_type);
        // $scope.Container_format = val[0].Container_format;
        // $scope.Sample_type = 5; // $scope.Steps[0].Sample_type;
        // $scope.Steps[0].Sample_type = 6; // $scope.Steps[0].Sample_type;
        $scope.Sample_type = 6;
        $scope.Container_format = 5;
    });

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

    $scope.update_protocol = function update () {
        console.log("updating protocol...");
       
        var id = $scope.Steps[0].Lab_protocol;

        var data = {
            id : id,
            name : $scope.name,
            description : $scope.description,
            createdBy : $scope.payload.userid,
            status : 'Active',
            Container_format : $scope.applicable_format,
            Sample_type : $scope.applicable_sample,
            repeatable : $scope.repeatable,
            createdAt : '<now>',
        };

        console.log(JSON.stringify($scope.Steps));
 
        console.log("Update protocol " + id);
        $http.post('/lab_protocol/update', data)
        .then ( function (resp) {
            console.log("Updated: " + JSON.stringify(resp));
            $scope.message("Updated protocol");
        })
        .catch ( function (err) {
            console.log("Error updating protocol");
            console.log(err);
            $scope.error(err);
        });
    }

    $scope.save = function save () {

        var data = {
            name : $scope.name,
            description : $scope.description,
            createdBy : $scope.payload.userid,
            status : 'Active',
            Container_format : $scope.applicable_format,
            Sample_type : $scope.applicable_sample,
            repeatable : $scope.repeatable,
            createdAt : '<now>',
        }

        console.log("POST data: " + JSON.stringify(data));

        $http.post('/record/add/lab_protocol', { data: data })
        .then ( function (resp) {
            var id = resp.data.insertId;

            console.log("ADDED lab_protocol: " + id);
            for (var i=0; i<$scope.Steps.length; i++) {
                console.log('Add step ' + i);
                $scope.Steps[i].step_number = i;
                console.log("call");
                $scope.save_step(id, i);
            }
            $scope.completed = 1;
        })
        .catch ( function (err) {
            console.log(err);
            $scope.error(err);
        });
    }

    $scope.save_step = function save_step(id, i) {
        
        var Step = $scope.Steps[i];
        console.log("save step " + JSON.stringify(Step));

        var stepData = { 
            Lab_protocol: id, 
            step_number: Step.step_number,
            name : Step.name,
            message : Step.message,
            instructions : Step.instructions, 
        };
        
        console.log("Add protocol_step: " + JSON.stringify(stepData));
        $http.post("/record/add/protocol_step", { data: stepData} )
        .then ( function (result) {
            var id = result.data.insertId;
            $scope.Steps[i].id = id;
            console.log("response: " + JSON.stringify(result));
            $scope.message("saved " + Step.name + " step..." + id);
        })
        .catch ( function (err) {
            $scope.error(err);
            console.log("Error saving step(s) " + err);
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
 