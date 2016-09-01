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

    $scope.attributes = {};
    $scope.attributes['container'] = [];
    $scope.attributes['prep'] = [];

    $scope.input = [];

    console.log("Original Input: " + $scope.Record.original_input);

    $scope.initialize = function initialize (config) {
    	if (config && config['record']) {
    		$scope.Record = config['record'];
    	}
        if ($scope.Record.step_number) { $scope.action = 'edit'}
        else { $scope.action = 'save' }
        
        $scope.initialize_payload(config);
        $scope.input_options = config['input_options'] || [];

        console.log(JSON.stringify(config));
        console.log('initialized step');
        $scope.preload();
    }

    $scope.preload = function () {

        if  (! $scope.preloaded) {
            $scope.Record.original_input = $scope.Record.input_options;
            console.log("Original Input: " + $scope.Record.original_input);
            $scope.preloaded = 1;

            var defaults = $scope.Record.input_defaults.split(':');
            var formats = $scope.Record.input_format.split(':');
            var input = $scope.Record.input_options.split(':');

            console.log("Preload names: " + input.join(','));
            console.log("input names: " + $scope.input_options.join(','));
            var Default = {};
            var Format  = {};
            var Mandatory = {};

            for (var i=0; i<$scope.input_options.length; i++) {
                var opt = $scope.input_options[i] || '';

                $scope.input[i] = $scope.input[i] || {};
                
                if (opt.match(/\*/)) { 
                    $scope.input[i].required = true;
                }
                // Mandatory[input] = 1 }
                opt = opt.replace('*','');

                var index = input.indexOf(opt);
                var mandatory = input.indexOf(opt + '*');

                if (mandatory >=0 ) { 
                    $scope.input[i].required = true; 
                    index = mandatory;
                }

                console.log(mandatory +  '/' + index + " opt: " + opt + ' in ' + input.join(','));
                if (index >= 0) {
                    $scope.input[i].selected = true;
                    $scope.input[i].default = defaults[index];
                    $scope.input[i].format = formats[index];
                    console.log("I : " + index + " from " + input.join(','));
                    console.log("D: " + defaults[index]);
                    console.log("F: " + formats[index]);                    
                }
            }
        }
    }

    $scope.add_attribute = function (type) {
        var key = type + '_attribute';
        
        var att = {};

        att.name = $scope[key].name;
        att.id = $scope[key].id;

        att.format = $scope[type + '_att_format'];
        att.default = $scope[type + '_att_default'];

        $scope.attributes[type].push(att);

        console.log(JSON.stringify(att));
    }

    $scope.reset_custom = function () {

        if  ($scope.Record.original_custom) {
            console.log("Original Custom still : " + $scope.Record.original_custom);
        }
        else if (! $scope.Record.original_custom) {
            $scope.Record.original_custom = $scope.Record.custom_settings;
            console.log("Original Custom 2: " + $scope.Record.original_custom);
        }


        var transfer_settings = ['transfer_type', 'Target_format', 'Target_sample', 'transfer_qty', 'split', 'reset_focus'];
        var json = '';
        for (var i=0; i<transfer_settings.length; i++) {
            var setting = transfer_settings[i];
            
            var val = $scope[setting];
            if (setting.match(/^Target/) && val.constructor === Object) {
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

    $scope.reset_input = function (field) {

        console.log('reset input ...');
        console.log(JSON.stringify($scope.input));
        if (field) {
            if ($scope.changed.indexOf(field) == -1) {
                $scope.changed.push(field);
            }
        }
        else {

            var input_list = [];
            var input_formats = [];
            var input_defaults = [];

            for (var i=0; i<$scope.input.length; i++) {
                if ($scope.input[i] && $scope.input[i].selected) {
                    var name = $scope.input[i].name;
                    if ($scope.input[i].required) { name = name + '*' }
                    input_list.push(name)
                
                    input_defaults.push($scope.input[i].default);
                    input_formats.push($scope.input[i].format);

                    console.log("add input for " + name);
                }
            }
            console.log("Input: " + JSON.stringify(input_list));
            console.log("Format: " + JSON.stringify(input_formats));
            console.log("Defaults: " + JSON.stringify(input_defaults));

            $scope.Record.input_options = input_list.join(':');
            $scope.Record.input_defaults = input_defaults.join(':');
            $scope.Record.input_formats  = input_formats.join(':');            
        }
    }

    $scope.save = function (type) {
        
        var data = {};
        if ($scope.action === 'edit') {
            for (var i=0; i<$scope.changed.length; i++) {
                var fld = $scope.changed[i];
                data[fld] = $scope.Record[fld];
            }

            console.log("UPDATE: " + JSON.stringify(data));
        }
        else {
            data = {
                'Lab_protocol' : $scope.Record.Lab_protocol,
                'step_number'  : $scope.Record.step_number,
                'instructions' : $scope.Record.instructions,
                'message'      : $scope.Record.message,

                'input_options' : $scope.Record.input_options,
                'input_format' : $scope.Record.input_format,
                'input_defaults' : $scope.Record.input_defaults,

                'custom_settings' : $scope.Record.custom_settings,
                'prompt' : $scope.Record.prompt,
                'repeatable' : $scope.Record.repeatable,
                'createdBy'  : '<user>',
                'createdAt'  : '<now>',
            }
            
            console.log("SAVE: " + JSON.stringify(data));
        }
    }    

}]);
