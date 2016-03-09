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

            $scope.Samples = config['samples'];
            $scope.N = $scope.Samples.split(',').length;

            $scope.user = 'Ran';  // TEMP
            $scope.PrepFields = [];
            
            $scope.SplitFields = {};
            $scope.split_mode = 'Parallel';  // or parallel ... eg split 1,2 x 2 -> 1,2,1,2 (parallel) or 1,1,2,2 (serial)
            
            $scope.FK_Employee__ID = 2;  // test data 
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


    $scope.reset_Split_mode = function () {
        var fields = Object.keys($scope.SplitFields);

        for (var i=0; i<fields.length; i++) {
            $scope.splitField(fields[i]);
            console.log('reset split strategy for ' + fields[i]);
        }

    }
    /* Enable split distribution in parallel or in series */
    $scope.splitField = function splitField (field) {

        var input = $scope[field];
 
        if (input) {
            $scope[field + '_split'] = $scope[field];
            var input_array = input.split(/\s*,\s*/);

            var split = $scope.Split || 1;
            var Nx = $scope.N * split;
            var entered = input_array.length;

            var factor = Nx / entered;
            var round = Math.round(factor);
            
            console.log("Array: " + JSON.stringify(input_array) + " x " + factor);
     
            if (factor == round) {
                 $scope[field+'_errors'] = '';
                 $scope.formDisabled  = false;
            }
            else {
                // $scope.errMsg = "# of entered values must be factor of " + $scope.N;
                $scope[field+'_errors'] = "# of entered values must be factor of " + $scope.N;
                $scope.formDisabled  = true;
           }

            var array = [];
            var offset = 0;
            var index = 0;

            if ($scope.split_mode == 'Serial') {
                $scope.splitExample = " A,B,C -> A, A...B, B...C, C...";
                for (var i=0; i<Nx; i++) {
                     
                    array[i] = input_array[index];
                    offset++;
                    if (offset >= round) {
                        offset=0;
                        index++;
                    }
 
                }
            }
            else {
                $scope.splitExample = " A,B,C -> A, B, C...A, B, C...";
                for (var i=0; i<Nx; i++) {
                    array[i] = input_array[index];

                    index++;
                    if (index >= entered) {
                        index=0;
                    }
 
                }                
            }

     
            $scope[field + '_split'] = array.join(','); 

            console.log(field + ' split to: ' + JSON.stringify($scope[field+'_split']));
            
            $scope.SplitFields[field] = array;

            if (entered > 1) $scope.SplitTracking = true;  
  
            return array;
        }
        else { console.log('no value...') }
    }

    /* Retrieve data from fields which are splittable ... eg may accept different values for each of N samples based on comma-delimited list */
    $scope.splitData = function ( input ) {
        var recordData = [];
        for (var n=0; n< $scope.N; n++) {
            recordData[n] = {};
            for (var i=0; i< input.length; i++) {
                var fld = input[i];
                
                if ($scope[fld + '_split']) { 
                    var splitV = $scope[fld + '_split'].split(',');
                    recordData[n][fld] = splitV[n];
                }
                else if ($scope[fld]) {
                    recordData[n][fld] = $scope[fld];
                }

            }
        }
        console.log('split Plate data: ' + JSON.stringify(recordData));
        return recordData;
    }

    $scope.complete = function complete (action) {
        // complete step (if validated)
        $scope.Prep_Action = action;

        var url = "/Lab_protocol/complete-step";

        var PlateData = $scope.splitData($scope.input);
        console.log("split " + $scope.input);

        var PrepData = { 'Prep_Name' : $scope.Step.Protocol_Step_Name };
        var PrepFields = ['FK_Lab_Protocol__ID', 'FK_Employee__ID', 'Prep_Action','Prep_Comments'];
        for (var i=0; i< PrepFields.length; i++) {
            PrepData[PrepFields[i]] = $scope[PrepFields[i]] || $scope.Step[PrepFields[i]];
        }
        console.log("PREP DATA: " + JSON.stringify(PrepData));

        var data =  {
            'Prep' : PrepData,
            'Plate' : PlateData,

            ids: $scope.samples,
        };

        console.log("Send: " + JSON.stringify(data));
        console.log("Called: " + url);

        $http.post(url, data)
        .then ( function (result) {
            console.log("Step Saved");
            console.log(JSON.stringify(result));
        });
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
