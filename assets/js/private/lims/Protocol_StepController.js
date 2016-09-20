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

    $scope.Record.original_custom_settings = $scope.Record.custom_settings;
    $scope.Record.original_input = $scope.Record.input_options;

    $scope.attributes = {};
    $scope.attributes['container'] = [];
    $scope.attributes['prep'] = [];

    $scope.show_input = false;
    $scope.show_custom = false;

    $scope.input = [];
    $scope.changed = {};
    $scope.changes = 0;

    $scope.custom = [];
    $scope.selectList = [];

    // $scope.custom.input = {}; // ?? or just use key & value ?
    // $scope.custom.default = {};

    console.log("Original Input: " + $scope.Record.original_input);

    $scope.initialize = function initialize (config) {
    	if (config && config['record']) {
    		$scope.Record = config['record'];
    	}
        if ($scope.Record.step_number) { $scope.action = 'edit'}
        else { $scope.action = 'save' }
        
        $scope.initialize_payload(config);
        $scope.input_options = config['input_options'] || [];

        $scope.custom_options = config['custom_options'] || [];

        console.log(JSON.stringify(config));
        console.log('initialized step');
        $scope.preload();

        $scope.reset_input();
        $scope.reset_custom();
    }
    
    $scope.$watch('Target_format', function (val) {
        console.log("detected format change to " + val);
        $scope.reset_input();
        $scope.reset_custom();
    });

    $scope.$watch('Target_sample', function (val) {
        console.log("detected sample change to " + val);
        $scope.reset_input();
        $scope.reset_custom();
    });

    $scope.preload = function (force) {

        if  (force || ! $scope.preloaded) {
            $scope.Record.original_input = $scope.Record.input_options;
            console.log("Original Input: " + $scope.Record.original_input);
            $scope.preloaded = 1;

            var defaults = $scope.Record.input_defaults.split(':');
            var formats = $scope.Record.input_format.split(':');
            var input = $scope.Record.input_options.split(':');

            var xfer = {};
            var custom_settings = '';
            var custom = $scope.Record.custom_settings;

            // check custom options 
            if (custom) {
    
                $scope.custom = [];
                custom_settings = JSON.parse(custom);
 
                // add special transfer fields first (embed in others ?)
                $scope.custom.push({
                    'name' : 'transfer_type',
                    'default' : custom_settings.transfer_type,
                });

                $scope.transfer_type = custom_settings.transfer_type;

                $scope.custom.push({
                    'name' : 'Target_format',
                    'default' : custom_settings.Target_format,
                });

                if (custom_settings.Target_format) {
                    var List = $scope.MenuList['Target_format'];
                    console.log("set target format " + JSON.stringify(List));
                    if (List) {
                        var ids = _.pluck(List, 'id');
                        var index = ids.indexOf(custom_settings.Target_format);
                        console.log(index + " IDS: " + JSON.stringify(ids));
                        $scope.Target_format = List[index];
                        console.log(index + " USE: " + JSON.stringify(List[index])); 
                    }
                }

                $scope.custom.push({
                    'name' : 'Target_sample',
                    'default' : custom_settings.Target_sample,
                });

                console.log("Custom Settings: " + JSON.stringify(custom_settings));

                console.log("custom options: " + $scope.custom_options.join(','))
                for (var i=0; i<$scope.custom_options.length; i++) {
                    var index = i + $scope.custom.length;

                    var name = $scope.custom_options[i];

                    var required = false;
                    var defaultTo = custom_settings[name];
                    if (custom[name + '*']) { 
                        defaultTo = custom_settings[name + '*'];
                        required = true;
                    }

                    var setting = {};
                    if (defaultTo) {
                        setting = {
                                'name' : name,
                                'default' : defaultTo,
                                'required' : required,
                                'selected' : true,
                        }

                        $scope.transfer_step = true;
                    }
                    
                    $scope.custom.push(setting);
                }
            }

            console.log("Preload names: " + input.join(','));
            console.log("input names: " + $scope.input_options.join(','));
            console.log("transfer ? " + $scope.transfer_step );

            var Default = {};
            var Format  = {};
            var Mandatory = {};

            // check standard input_options
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
                    $scope.input[i].name = opt;
                    $scope.input[i].selected = true;
                    $scope.input[i].default = defaults[index];
                    $scope.input[i].format = formats[index];
                    console.log("I : " + index + " from " + input.join(','));
                    console.log("D: " + defaults[index]);
                    console.log("F: " + formats[index]);                    
                }
            }

            // check unaccounted for input options (= Attributes)
            var i = $scope.input_options.length;
            for (var j=0; j<input.length; j++ ) {
                var opt = input[j];

                var required = false;
                if (opt.match(/\*/)) { required = true }
                
                opt = opt.replace(/\*/,'')
                
                console.log("check input for " + opt)
                var index = $scope.input_options.indexOf(opt);
                var i2 = $scope.input_options.indexOf(opt + '*');
                
                console.log("Index of " + opt + " + " + index + ' or ' + i2);
                if (index === -1 && i2 === -1) {
                    $scope.input[i] = $scope.input[i] || {};

                    var name = opt;
                    if (required) { $scope.input[i].required = true }

                    $scope.input[i].name = name;
                    $scope.input[i].selected = true;
                    $scope.input[i].default = defaults[index];
                    $scope.input[i].format = formats[index]; 

                    var att = { 
                        name : name,
                        default : defaults[index],
                        format : formats[index],
                        selected : true,
                    };

                    $scope.attributes['container'].push(att);                   
                    i++;
                }
                else {
                    console.log("skip " + opt);
                }
            }

            console.log("INPUT: " + JSON.stringify($scope.input));
            console.log("CUSTOM: " + JSON.stringify($scope.custom));
            console.log("format: " + $scope.Target_sample)
        }
    }

    $scope.add_attribute = function (type) {
        var key = type + '_attribute';
        
        var att = {};

        att.name = $scope[key].name;
        att.id = $scope[key].id;

        att.format = $scope[type + '_att_format'];
        att.default = $scope[type + '_att_default'];
        att.selected = true;

        $scope.attributes[type].push(att);
        $scope.reset_input();

        console.log(JSON.stringify(att));
    }

    $scope.reset_custom = function () {

        if  ($scope.Record.original_custom_settings) {
            console.log("Original Custom still : " + $scope.Record.original_custom_settings);
        }
        else if (! $scope.Record.original_custom_settings) {
            $scope.Record.original_custom_settings = $scope.Record.custom_settings;
            console.log("Original Custom 2: " + $scope.Record.original_custom_settings);
        }

        var json = '';

        var primary_transfer_settings = ['transfer_type', 'Target_format', 'Target_sample'];
        for (var i=0; i<primary_transfer_settings.length; i++) {
            var setting = primary_transfer_settings[i];
            
            // var parsed = JSON.parse($scope.Record.custom_settings);

            var val = $scope[setting]; // parsed[setting];
            console.log(setting + " : " + JSON.stringify(val));
            if (val && val.constructor === Object) {
                val = val.id;
            }

            if (val === null || val === undefined || val === 'undefined') { }
            else {
               if (json) { json = json + ', ' }
               json = json + '"' + setting + '" : "' + val + '"';
            }
        }

        for (var i=0; i<$scope.custom.length; i++) {            
            if ($scope.custom[i] && $scope.custom[i].selected) {
                var setting = $scope.custom[i].name;
                var val = $scope.custom[i].id;
                console.log("Set " + setting + ' to ' + val + ' or ' + $scope.custom[i].default);
                if (! val) { // } && $scope.custom[i].default ) {
                    val = $scope.custom[i].default || 'true';
                }
                if (json) { json = json + ', ' }
                json = json + '"' + setting + '" : "' + val + '"';
                console.log("JSON: " + json);
            }           
        }
        if (json) { json = "{" + json + " }" }
        
        console.log('json cs ocs:');
        console.log(json);
        console.log($scope.Record.custom_settings);
        console.log($scope.Record.original_custom_settings);

        if ( json === $scope.Record.original_custom_settings) {
            delete $scope.changed['custom_settings'];
            $scope.Record.custom_settings = json;
            console.log('json original restored: ' + json);
        }
        else if ( 0 && $scope.Record.custom_settings === json) {
            console.log('json not changed');
            delete $scope.changed['custom_settings'];
        }
        else {
            $scope.Record.custom_settings = json;
            $scope.changed['custom_settings'] = json;
            console.log('Changed: ' + JSON.stringify($scope.changed));
        }

        $scope.changes = Object.keys($scope.changed).length;
    }
            
    $scope.reset_originals = function () {
        $scope.Record.custom_settings = $scope.Record.original_custom_settings;
        $scope.Record.input_options   = $scope.Record.original_input;
        console.log("Reset originals .. ");

    }

    $scope.reset_input = function (field) {

        console.log('reset input ...');
        console.log(JSON.stringify($scope.input));
        if (field) {
            if ( $scope.changed[field] !== $scope.Record[field] ) {
                $scope.changed[field] = $scope.Record[field];
                console.log('changed ' + field);
            }
        }
        else {
            var input_list = [];
            var input_formats = [];
            var input_defaults = [];

            var input_count = 0;
            var default_count = 0;
            var format_count = 0;

            $scope.selectList = [];
            for (var i=0; i<$scope.input.length; i++) {
                if ($scope.input[i] && $scope.input[i].selected) {
                    var name = $scope.input[i].name;
                    if ($scope.input[i].required) { name = name + '*' }
                    input_list.push(name);
                    input_count++;
                    
                    input_defaults.push($scope.input[i].default);
                    if ($scope.input[i].default && $scope.input[i].default.length) { default_count++ }

                    input_formats.push($scope.input[i].format);
                    if ($scope.input[i].format && $scope.input[i].format.length) { format_count++ }

                    $scope.selectList.push(name);
                    console.log("add input for " + name);
                }
                else {
                    console.log($scope.input[i].name + " not selected");
                }
            }

            var att_types = ['container','prep'];

            for (var j=0; j<att_types.length; j++) {
                for (var i=0; i<$scope.attributes[att_types[j]].length; i++) {
                    var att = $scope.attributes[att_types[j]][i];
                    console.log("Att = " + JSON.stringify(att));
                    if (att.required) { att = att + '*' }
                    if (att.selected) {
                        input_list.push(att.name);
                        input_count++;
                        
                        input_defaults.push(att.default);
                        if (att.default && att.default.length) { default_count++ }

                        input_formats.push(att.format);
                        if (att.format && att.format.length) { format_count++ }

                        console.log("add attribute to input_options: " + att);
                    }
                }

            }
            console.log("Input: " + JSON.stringify(input_list));
            console.log("Format: " + JSON.stringify(input_formats));
            console.log("Defaults: " + JSON.stringify(input_defaults));

            if (input_count && $scope.Record.input_options !== input_list.join(':') ) {
                $scope.Record.input_options = input_list.join(':');
                $scope.changed['input_options'] = $scope.Record.input_options;
            }
            
            if (default_count && $scope.Record.input_defaults !== input_defaults.join(':') ) {
                console.log($scope.Record.input_defaults + ' -> ' + input_defaults.join(':'));
                $scope.Record.input_defaults = input_defaults.join(':');
                $scope.changed['input_defaults'] = $scope.Record.input_defaults;
            }
           
            if (format_count && $scope.Record.input_formats !== input_formats.join(':') ) {
                $scope.Record.input_formats = input_formats.join(':');
                $scope.changed['input_formats'] = $scope.Record.input_formats;
            }            
        }

        $scope.changes = Object.keys($scope.changed).length;
    }

    $scope.save = function (type) {
        
        $scope.reset_input();
        $scope.reset_custom();

        console.log("Changed: " + JSON.stringify($scope.changed));
        
        var data = {'id' : $scope.Record.id };

        if ($scope.action === 'edit') {
            var flds = Object.keys($scope.changed);
            console.log("Change " + flds.join(','));

            if (flds.length) {
                for (var i=0; i<flds.length; i++) {
                    var fld = flds[i];
                    data[fld] = $scope.Record[fld];
                }

                console.log("Record: " + JSON.stringify($scope.Record));
                console.log("UPDATE: " + JSON.stringify(data));

                $http.post('/protocol_step/update', data)
                .then ( function (response) {
                    console.log('RESPONSE:' + JSON.stringify(response));
                    if (response.data && response.data.error) {
                        console.log("error: " + response.data.error);
                        $scope.error(response.data.error);
                    }
                    else if (response.data && response.data.result && response.data.result.set) {
                        var updated = response.data.result.set.affectedRows;
                        $scope.reset_messages();
                        $scope.message("Updated " + updated + " Record(s)");
                        
                        $scope.Record.original_custom_settings = $scope.Record.custom_settings;
                        $scope.reset_input();
                        $scope.reset_custom();
                        console.log("updated " + updated + ' Records');
                    }
                    else {
                        console.log("cound not parse result: " + JSON.stringify(result));
                    }

                })
                .catch ( function (err) {
                    console.log("Error posting step");
                    console.log(err);
                });
            }
            else {
                console.log("nothing changed");
                $scope.message("No fields altered");
            }
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
            
            console.log("Record: " + JSON.stringify($scope.Record));
            console.log("SAVE: " + JSON.stringify(data));

            $http.post('/record/', 'protocol_step', data)
            .then ( function (result) {
                console.log('RESPONSE:' + JSON.stringify(result));
            })
            .catch ( function (err) {
                console.log("Error posting step");
                console.log(err);
            });
        }


    }    

}]);
