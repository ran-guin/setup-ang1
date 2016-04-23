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

            $scope.Samples = config['Samples'] || {};   // array of sample info
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
            
            $scope.SplitFields = {};
            $scope.split_mode = 'Parallel';  // or parallel ... eg split 1,2 x 2 -> 1,2,1,2 (parallel) or 1,1,2,2 (serial)
            
            $scope.FK_Employee__ID = 2;  // test data 
            console.log("Steps: " + JSON.stringify($scope.Steps) );
            $scope.reload();

            $scope['target_format'] = 3;  // Test only 
            console.log("protocol initialization complete...");
        }


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

    /* Enable split distribution in parallel or in series */
    $scope.splitField = function splitField (field, separator) {

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

    /* Retrieve data from fields which are splittable ... eg may accept different values for each of N plate_ids based on comma-delimited list */
    $scope.splitData = function ( input, map) {
        var recordData = [];
        for (var n=0; n< $scope.N; n++) {
            recordData[n] = {};
            for (var i=0; i< input.length; i++) {
                var fld = input[i];

                var mapped = fld;  /* Enable option for mapping field to custom name */
                if (map && map[fld]) {
                    mapped = map[fld];
                }
                
                if ($scope[fld + '_split']) { 
                    var splitV = $scope[fld + '_split'].split(',');
                    recordData[n][mapped] = splitV[n];
                }
                else if ($scope[fld]) {
                    recordData[n][mapped] = $scope[fld];
                }

            }
        }
        console.log('split Plate data: ' + JSON.stringify(recordData));
        return recordData;
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
            'Prep_Action' : $scope['action'],
            'Prep_Comments' : $scope['comments']
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
        var PlateData = $scope.splitData(PlateInfo, map);        

        console.log("split " + $scope.input);
        console.log("PlateData: " + JSON.stringify(PlateData));

        console.log("Attributes: " + JSON.stringify($scope.Attributes));

        var PlateAttributes = {};
        var PrepAttributes = {};

        if (action != 'Skipped') {
            // Load Attribute Data 
            for (var i=0; i<$scope.Attributes.length; i++) {
                var att = $scope.Attributes[i];
                if (att.type == 'Count' && att.model == 'Plate') { 
                    $scope[att.name] = '<increment>';
                    PlateAttributes[att.id] = $scope[att.name];
                }
                else if (att.model == 'Plate' && $scope.SplitFields[att.name]) {
                    PlateAttributes[att.id] = $scope.SplitFields[att.name];
                    console.log(att.name + ' : ' + $scope.SplitFields[att.name]);
                }
                else if (att.model == 'Prep') {
                    PrepAttributes[att.id] = $scope[att.name];
                    console.log(att.name + ' = ' + $scope[att.name]);
                }
                else {
                    console.log("Invalid Attribute: " + JSON.stringify(att))
                }
            }
        }

        var Transfer;

        if ($scope.Step.Target_format) {
            Transfer = { target_format : $scope.Step.Target_format }
        } 

        var data =  {
            'ids': $scope.plate_ids,
            'Prep' : PrepData,
            'Plate' : PlateData,
            'Plate_Attribute' : PlateAttributes,
            'Prep_Attribute'  : PrepAttributes,
            'Transfer' : Transfer,
        };

        if ($scope['target_format']) {

            $scope.distribute();  // change to promise (test.. )
            data['target_format'] = $scope['target_format'];
            data['Sources'] = $scope.Map.Sources;
            data['Targets'] = $scope.Map.Targets;
        }

        console.log("Send: " + JSON.stringify(data));
        console.log("Called: " + url);

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
                $scope['status'] = 'Completed';
            }

            if (action == 'Debug') {
                $scope.errMsg = JSON.stringify(result,null,4);
            }
        });
    }

    $scope.distribute = function distribute () {
        if ($scope['target_format']) {

            var newMap = new wellMapper();
 
            newMap.from($scope.Samples);
            $scope.newMap = newMap;

            $scope.Map = $scope.newMap.distribute(
                $scope.Samples, 
                { format : $scope['target_format']},
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
        console.log('this: ' + JSON.stringify(data));
    }

    $scope.repeat = function repeat () {
        // go back one step (if allowed)
        $scope.back();
    }

    $scope.reload = function reload () {

        $scope.Step = $scope.Steps[$scope.stepNumber-1];

        // start custom block //
        $scope.input = $scope.Step['input_options'].split(':');
        $scope.defaults = $scope.Step['input_defaults'].split(':');
        $scope.formats   = $scope.Step['input_format'].split(':');

        var name = $scope.Step['name'];
        if (name.match(/^(Transfer|Extract|Aliquot)/) ) {
            if (! $scope.Split) { $scope.Split = 1 } 
        }

        // end custom block //

        $scope.Show = {};
        $scope.Default = {};
        $scope.Format = {};
        $scope.comments = '';

        console.log("parse input for next step... ");
        var Attributes = { Plate : [], Prep : [] };
        for (var i=0; i<$scope.input.length; i++) {
            var input = $scope.input[i];
            var cleaned_input = input.replace('*','');

            $scope.Show[input] = true;
            if ($scope.defaults.length > i) {
                var def = $scope.defaults[i];
                console.log(cleaned_input + " defaults: " + def);
                if (cleaned_input.match(/\_qty$/)) {
                    var units = def.match(/[a-zA-Z]+/);
                    if (units && units.length) {
                        console.log(JSON.stringify(units));
                        $scope.Default[cleaned_input + '_units'] = units[0];
                        $scope[cleaned_input + '_units'] = units[0];
                        def = def.replace(units[0],'');
                    }
                    $scope.Default[cleaned_input] = def;
                    $scope[cleaned_input] = def;
                }
                else {
                    $scope.Default[cleaned_input] = def; 
                    $scope[cleaned_input] = def;
                }
            }
            if ($scope.formats.length > i) { $scope.Format[input] = $scope.formats[i] }
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
