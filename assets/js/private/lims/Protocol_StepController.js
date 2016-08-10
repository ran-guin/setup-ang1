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
    $scope.Record = {};

    $scope.Record.original_custom = $scope.Record.custom_settings;
    $scope.Record.original_input = $scope.Record.input_options;

    console.log("Original Input: " + $scope.Record.original_input);

    $scope.initialize = function initialize (config) {
    	if (config && config['record']) {
    		$scope.Record = config['record'];
    	}
        console.log(JSON.stringify(config));
        console.log('initialized step');
    }

    $scope.preload = function () {

        if  (! $scope.preloaded) {
            $scope.Record.original_input = $scope.Record.input_options;
            console.log("Original Input: " + $scope.Record.original_input);

            var input = $scope[input_options].split(':');
            var defaults = $scope[input_defaults].split(':');
            var formats = $scope[input_format].split(':');

            var Default = {};
            var Format  = {};
            var Mandatory = {};

            for (var i=0; i<input.length; i++) {
                var opt = input[i];
                if (opt.match('*')) { Mandatory[input] = 1 }
                opt = opt.replace('*','');

                if (defaults[i]) { Default[input] = defaults[i] }
                if (formats[i])  { Format[input] = formats[i] }

            }
        }
    }

    $scope.set_custom = function () {

        if  ($scope.Record.original_custom) {
            console.log("Original Custom still : " + $scope.Record.original_custom);
        }
        else if (! $scope.Record.original_custom) {
            $scope.Record.original_custom = $scope.Record.custom_settings;
            console.log("Original Custom 2: " + $scope.Record.original_custom);
        }


        var transfer_settings = ['transfer_type', 'target_format', 'target_sample', 'transfer_qty', 'split', 'reset_focus'];
        var json = '';
        for (var i=0; i<transfer_settings.length; i++) {
            var setting = transfer_settings[i];
            
            var val = $scope[setting];
            if (setting.match(/^target/) && val.constructor === Object) {
                val = val.id;
            }

            if ($scope[setting]) { 
                json = json + '"' + setting + '" : "' + val + '", ';
            }           
        }
        if (json) { json = "{ " + json + " }" }
        $scope.Record.custom_settings = json;
    }
            
    $scope.reset_originals = function () {
        $scope.Record.custom_settings = $scope.Record.original_custom;
        $scope.Record.input_options   = $scope.Record.original_input;
        console.log("Reset originals .. ");

    }

    $scope.set_input = function () {
        var standard_input = ['solution','solution_qty','equipment','equipment_qty','split','comments']

        var format = '';
        var defaultTo = '';
        var input = '';

        for (var i=0; i<standard_input.length; i++) {
            var setting = standard_input[i];

            if ($scope[setting]) { 
                var mandatory = '';
                var def = '';
                var frmt = '';

                if ($scope[setting + "_mandatory"]) { mandatory = '*' }

                if ($scope[setting + '_format']) {
                    frmt = $scope[setting + '_format'];
                }
                if ($scope[setting + '_default']) {
                    def = $scope[setting + '_default'];
                }

                if (input) { 
                    input = input + mandatory + ':';
                    defaultTo = defaultTo + ':';
                    format = format + ':';
                }

                input = input + setting;
                defaultTo = defaultTo + def;
                format = format + frmt;
            }
        }
        $scope.Record.input_options = input;
        $scope.Record.input_format  = format;
        $scope.Record.input_default = defaultTo;
    }     

}]);
