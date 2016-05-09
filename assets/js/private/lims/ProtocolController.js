var app = angular.module('myApp');

app.controller('ProtocolController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function protocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol controller');        
    $scope.context = 'Protocol';
    $scope.stepNumber = 1;

    $scope.initialize = function (config) {

        if (config && config['Steps']) { 
            console.log("loaded protocol steps");
            $scope.Steps = config['Steps'];
            $scope.steps = $scope.Steps.length;

            console.log("parsed: " + config['Samples'].constructor);
            if (config['Samples'].constructor == 'String') {
                $scope.Samples = JSON.parse(config['Samples'])
            }
            else {
                $scope.Samples = config['Samples'] || {};   // array of sample info                
            }

            $scope.Options = config['Options'] || {};   

            $scope.plate_list = config['plate_ids'];  // simple comma-delimited list
            $scope.plate_ids = $scope.plate_list.split(',');
     
            $scope.N = $scope.plate_ids.length;
            
            if ($scope.Samples[0] && $scope.Samples[0]['container_format']) {
                $scope.container_format = $scope.Samples[0]['container_format'];
            }
            else { $scope.container_format = 'undefined' }

            if ($scope.Samples[0] && $scope.Samples[0]['sample_type']) {
                $scope.sample_type = $scope.Samples[0]['sample_type'];
            }
            else { $scope.sample_type = 'undefined' }

            console.log("Samples: " + $scope.plate_list);

            $scope.Attributes = config['Attributes'];

            $scope.user = 'Ran';  // TEMP
            $scope.PrepFields = [];
            
            // well specific attributes handled in WellController //
            // eg SplitFields, split_mode, distribution_mode, target_format etc.
            
            $scope.FK_Employee__ID = 2;  // test data 
            console.log("Steps: " + JSON.stringify($scope.Steps) );
            $scope.reload();

            $scope['target_format'] = 3;  // Test only 
            console.log("protocol initialization complete...");
            console.log('ids: ' + $scope.plate_ids + '=' + $scope.plate_list);

            $scope.SplitFields = {};
        }

        $scope.LoadPoints = [{ Id: '1', Text: 'loadPointA' },{ Id: '2', Text: 'loadPointB' }];        
        $scope.cargo = {
            CargoItems: [{
                LoadPoint: $scope.LoadPoints[0]
            }, {
                LoadPoint: $scope.LoadPoints[1]
            }]
        };

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



    $scope.reset_Split_mode = function (fields) {
        
        if (! fields) { fields = Object.keys($scope.SplitFields) }

        for (var i=0; i<fields.length; i++) {
            $scope.splitField(fields[i]);
            console.log('reset split strategy for ' + fields[i]);
        }

    }

    $scope.Prefix = function Prefix (model) {
        var P = {
            'solution' : 'Sol',
            'plate' : 'BCG',
            'location' : 'Loc',
            'equipment' : 'Eqp'
        };

        return P[model];
    }

    $scope.complete = function complete (action) {
        // complete step (if validated)
        $scope.action = action;

        var url = "/Lab_protocol/complete-step";

        // Legacy fields 
        var PrepData = { 
            'Prep_Name' : $scope.Step.name ,
            'FK_Lab_Protocol__ID' : $scope.Step['Lab_protocol'],
            'FK_Employee__ID' : 1, 
            'Prep_Action' : $scope['action' + $scope.stepNumber],
            'Prep_Comments' : $scope['comments' + $scope.stepNumber],
            'Prep_DateTime' : $scope.timestamp,
        };

        console.log("PREP DATA: " + JSON.stringify(PrepData));
        var PlateInfo = ['plate_list', 'solution', 'equipment','solution_qty','solution_qty_units', 'transfer_qty','transfer_qty_units'];

        // Legacy fields //
        var map = {
            'plate_list' : 'FK_Plate__ID',
            'solution' : 'FK_Solution__ID',
            'equipment' : 'FK_Equipment__ID',
            'solution_qty' : 'Solution_Qty',
            'solution_qty_units' : 'Solution_Qty_Units',
            'transfer_qty' : 'Transfer_Quantity',
            'transfer_qty_units' : 'Transfer_Quantity_Units'
        };

        $scope['plate_list_split'] = $scope.plate_list;  // test.. should be reverse split
        console.log("split Data to " + $scope.N + ' values');
        var PlateData = $scope.splitData(PlateInfo, $scope.N, map);

        console.log("load " + $scope.N + ' plate ids...');
        for (var i=0; i<$scope.N; i++) {
            PlateData[i]['FK_Plate__ID'] = $scope.Samples[i].id;
        }       

        console.log("split " + $scope.input);
        console.log("PlateData: " + JSON.stringify(PlateData));

        console.log("Attributes: " + JSON.stringify($scope.Attributes));

        var PlateAttributes = {};
        var PrepAttributes = {};

        if (action != 'Skipped') {
            // Load Attribute Data 
            for (var i=0; i<$scope.Attributes.length; i++) {
                var att = $scope.Attributes[i];
                var key = att.name + $scope.stepNumber;
                if (att.type == 'Count' && att.model == 'Plate') { 
                    $scope[key] = '<increment>';
                    PlateAttributes[att.id] = $scope[key];
                }
                else if (att.model == 'Plate' && $scope.SplitFields[key]) {
                    PlateAttributes[att.id] = $scope.SplitFields[key];
                    console.log(key + ' : ' + $scope.SplitFields[key]);
                }
                else if (att.model == 'Plate') {
                    PlateAttributes[att.id] = $scope[key];
                    console.log(key + ' : ' + $scope[key]);
                }

                else if (att.model == 'Prep') {
                    PrepAttributes[att.id] = $scope[key];
                    console.log(key + ' = ' + $scope[key]);
                }
                else {
                    console.log("Invalid Attribute: " + JSON.stringify(att))
                }
            }
        }

        var data =  {
            'ids': $scope.plate_ids,
            'Prep' : PrepData,
            'Plate' : PlateData,
            'Plate_Attribute' : PlateAttributes,
            'Prep_Attribute'  : PrepAttributes,
        };

        console.log("\nDATA: " + JSON.stringify(data));

        $scope.updateLookups();  // use lookup dropdowns to populate ng-model

        if ($scope.Step.Target_format > 0) {

            var Transfer = { 
                'target_format' : $scope.Step.Target_format,
                'sample_type'   : $scope.Step.Target_sample,
                'transfer_type' : $scope.Step.transfer_type,
                'reset_focus'   : $scope.reset_focus,
                'split'         : $scope.Split,
                'pack'          : $scope.pack,
                'distribution_mode' : $scope.distribution_mode,
            };

            $scope.distribute();  // change to promise (test.. )
            
            data['target_format'] = $scope.Step.Target_format;

            data['Sources'] = $scope.Map.Sources;
            data['Targets'] = $scope.Map.Targets;

            data['Transfer'] = Transfer;
        } 

        console.log("Send: " + JSON.stringify(data));
        console.log("Called: " + url);

        if (action == 'Test') {
            console.log('Transfer: ' + JSON.stringify(Transfer));
        }
        else {
            $http.post(url, data)
            .then ( function (result) {
                console.log("Step Saved");
                console.log(JSON.stringify(result));
                if ($scope.stepNumber < $scope.steps) {
                    console.log('completed... go to next step');
                    $scope.forward()
                }
                else {
                    console.log('completed... done');
                    $scope['status' + $scope.stepNumber] = 'Completed';
                }

                if (action == 'Debug') {
                    $scope.errMsg = JSON.stringify(result,null,4);
                }
            });
        }
    }

    /* Retrieve data from fields which are splittable ... eg may accept different values for each of N plate_ids based on comma-delimited list */
    $scope.splitData = function ( input, N, map) {
        var recordData = [];
        for (var n=0; n<N; n++) {
            recordData[n] = {};
            for (var i=0; i< input.length; i++) {
                var fld = input[i];
                var key = fld + $scope.stepNumber;

                var mapped = fld;  /* Enable option for mapping field to custom name */
                if (map && map[fld]) {
                    mapped = map[fld];
                }
                
                if ($scope[key + '_split']) { 
                    var splitV = $scope[key + '_split'].split(',');
                    recordData[n][mapped] = splitV[n];
                }
                else if ($scope[key]) {
                    recordData[n][mapped] = $scope[key];
                }
                console.log(key + ' = ' + $scope[key] + ' or ' + $scope[key + '_split']);
                console.log(n + ": Set " + key + ' = ' + mapped + ' TO ' + recordData[n][mapped]) 

            }
        }
        console.log('split Plate data: ' + JSON.stringify(recordData));
        return recordData;
    }

    /* Enable split distribution in parallel or in series */
    $scope.splitField = function splitField (field, separator) {

        console.log("\n** Split ** " + field);
        var input = $scope[field];

        if (input) {
            $scope[field + '_split'] = input;

            var prefix = $scope.Prefix(field);
            
            if (prefix) { 
                separator = prefix;
            }
            else {
                separator = ',';
            }
            console.log("Split " + field + ' ON ' + separator + ' : ' + prefix);

            var splitExpr = new RegExp('\\s*' + separator + '\\s*', 'ig');

            var input_array = input.split(splitExpr);
            
            if (prefix && (input_array.length > 1) && (input_array[0] == '')) { input_array.shift() }  // remove first element 

            console.log('test: ' + JSON.stringify(input_array) );

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

    $scope.distribute = function distribute () {
        var targetKey = 'target_format' + $scope.stepNumber;
        if ($scope[targetKey]) {

            var newMap = new wellMapper();
 
            newMap.from($scope.Samples);
            $scope.newMap = newMap;

            $scope.Map = $scope.newMap.distribute(
                $scope.Samples, 
                { format : $scope[targetKey]},
                //{ rows : $scope.target_rows, cols : $scope.target_cols},
                { fillBy: $scope.Options.fill_by, pack: $scope.Options.pack }
            );
            
            console.log("Distribution MAP: " + JSON.stringify(newMap));
        }
        else {
            $scope.Map = {};
            console.log("distribution N/A");
        }
    }

    $scope.showErrors = function showErrors() {
        return $scope.errMsg;
    }

    $scope.skip = function skip () {
        // skip step (if allowed)
    }

    $scope.test = function test (data) {
        console.log('test');
        $scope.comments = 'tested';
        if (data > 0) { $scope.forward() }
        else { $scope.back() }
        console.log('reset to: ' + $scope.comments);
    }

    $scope.repeat = function repeat () {
        // go back one step (if allowed)
        $scope.back();
    }

    $scope.reload = function reload () {

        $scope.Step = $scope.Steps[$scope.stepNumber-1];

        $scope.input = $scope.Step['input_options'].split(':');
        $scope.defaults = $scope.Step['input_defaults'].split(':');
        $scope.formats   = $scope.Step['input_format'].split(':');

        var name = $scope.Step['name'];

        $scope.Show = {};
        $scope.Default = {};
        $scope.Format = {};
        $scope.comments = '';

        console.log("parse input for next step... ");
        var Attributes = { Plate : [], Prep : [] };
        for (var i=0; i<$scope.input.length; i++) {
            var input = $scope.input[i];
            var mandatory = input.match(/\*$/);
            var key = input.replace('*','');
            var id = key + $scope.stepNumber;

            $scope.Show[key] = true;
            if ($scope.defaults.length > i) {
                var def = $scope.defaults[i] || '';
                if (key.match(/\_qty$/)) {
                    var units = def.match(/[a-zA-Z]+/);
                    if (units && units.length) {
                        console.log(JSON.stringify(units));

                        $scope.Default[key + '_units'] = units[0]; // units only
                        $scope[key + '_units' + $scope.stepNumber] = units[0];
                        def = def.replace(units[0],''); // strip units 
                    }
                    $scope.Default[key] = def;          // value only
                    $scope[id] = def;
                }
                else {
                    console.log(key + " default = " + def)
                    $scope.Default[key] = def;         // not qty requiring units
                    $scope[id] = def;
                }
            }
            if ($scope.formats.length > i) { $scope.Format[key] = $scope.formats[i] }
        }
        console.log("Attributes: " + JSON.stringify(Attributes));
        console.log("Step: " + $scope.stepNumber + ' / ' + $scope.steps);
        console.log("Step: " + JSON.stringify($scope.Step));
        console.log("Show: " + JSON.stringify($scope.Show));
        console.log("Defaults: " + JSON.stringify($scope.Default));
        console.log("Format: " + JSON.stringify($scope.Format));
        console.log("Input: " + JSON.stringify($scope.input));

        $scope.errMsg = '';
    }

    $scope.ngalert = function ngalert(msg) {
        console.log("NG ALERT: " + msg);
    }

}]);
