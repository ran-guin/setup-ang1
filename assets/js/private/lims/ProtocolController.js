var app = angular.module('myApp');

app.controller('ProtocolController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function protocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol controller');        
    $scope.context = 'Protocol';
    $scope.stepNumber = 1;

    $scope.initialize = function (config) {
        if (config && config['Samples']) {
            // both protocol tracking and standard Container page 
 
            console.log("parsed: " + config['Samples'].constructor);
            if (config['Samples'].constructor === String) {
                $scope.Samples = JSON.parse(config['Samples'])
            }
            else {
                $scope.Samples = config['Samples'] || {};   // array of sample info                
            }
 
            $scope.load_Sample_info();

            $scope.last_step = config['last_step'];

            $scope.load_Sample_info();
      }

        if (config && config['Steps']) { 
            console.log("loaded protocol steps");
            $scope.Steps = config['Steps'];
            $scope.steps = $scope.Steps.length;
            $scope.protocol = config['protocol'];


            if ($scope.last_step && $scope.last_step.protocol && $scope.protocol && $scope.last_step.protocol == $scope.protocol.name) {
                console.log("noted last step: " + JSON.stringify($scope.last_step));
                for (var i=0; i<$scope.Steps.length; i++) {
                    if ($scope.Steps[i].step_number === $scope.last_step.number) {
                        if (i >= $scope.Steps.length-2) {
                            console.log("Already completed last step ...");
                            $scope.warnings.push('Already completed this step');
                        }
                        else if ( $scope.last_step.status === 'Completed Protocol') {
                            $scope.messages.push("Completed '" + $scope.last_step.protocol + "' protocol");
                        }
                        else if ( $scope.last_step.status === 'Completed Transfer') {
                            var format = $scope.Samples[0].container_format;

                            if ($scope.last_step.name.match(format) ) {
                                console.log("Target plates found");
                                $scope.stepNumber = i+2;
                                $scope.messages.push("Continuing protocol after '" + $scope.last_step.name + "' ...");

                            }
                            else {
                                console.log($scope.last_step.name + ' not ' + format);
                                $scope.stepNumber = i+1;
                                $scope.messages.push("already completed '" + $scope.last_step.name + "' ... repeat if required or fetch target samples to continue protocol");
                            }
                        }
                        else {
                            $scope.stepNumber = i+2;
                            console.log("point to next step if applicable");
                            $scope.messages.push("already completed: '" + $scope.last_step.name + "' ... continuing to next step");
                        }
                        i = $scope.Steps.length; // stop here.. 
                    }
                }
            }
            else {
                console.log("Last Step : " + JSON.stringify($scope.last_step));
                console.log("Protocol: " + JSON.stringify($scope.protocol));
                $scope.messages.push("Starting new protocol " + $scope.timestamp);
            }

            $scope.warning = "Already Completed";

            $scope.Options = config['Options'] || {};   

            $scope.Attributes = config['Attributes'];
            $scope.attribute_list = [];
            if ($scope.Attributes ) { 
                $scope.attribute_list = Object.keys($scope.Attributes);
            }

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

            $scope.list_mode = 'serial';
            $scope.listExamples = {
                'serial' : " x,y,z... -> x,x, y,y, z,z ...",
                'parallel' : " x,y,z... -> x,y,z... x,y,z...",
                'split'    : " multiple values applied to respective splits",
            }; 

            $scope.listExample = $scope.listExamples[$scope.list_mode];
        }

        $scope.LoadPoints = [{ Id: '1', Text: 'loadPointA' },{ Id: '2', Text: 'loadPointB' }];        
        $scope.cargo = {
            CargoItems: [{
                LoadPoint: $scope.LoadPoints[0]
            }, {
                LoadPoint: $scope.LoadPoints[1]
            }]
        };
        console.log("initialization complete...");

    }

    $scope.exitThisProtocol = function exitThisProtocol () {
        console.log("Exit Protocol");
        $scope.status = 'Completed';
    }

    $scope.load_Sample_info = function load_Sample_info () {

        var ids = [];
        for (var i=0; i<$scope.Samples.length; i++) {
            if ($scope.Samples[i].id) { ids.push($scope.Samples[i].id) }
        }
        $scope.plate_list = ids.join(',');
        $scope.plate_ids  = ids;

        $scope.N = $scope.plate_ids.length;
        
        if ($scope.Samples[0] && $scope.Samples[0]['container_format']) {
            $scope.container_format = $scope.Samples[0]['container_format'];
        }
        else { $scope.container_format = 'undefined' }

        if ($scope.Samples[0] && $scope.Samples[0]['sample_type']) {
            $scope.sample_type = $scope.Samples[0]['sample_type'];
        }
        else { $scope.sample_type = 'undefined' }

        // console.log("Samples: " + $scope.plate_list);
    }

    $scope.forward = function forward(action) {

        var state = action || 'Completed';

        $scope['status' + $scope.stepNumber] = state;

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

        $scope.reset_messages();

        $scope.uninjectData();

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
            for (var i=0; i<$scope.attribute_list.length; i++) {
                var att = $scope.Attributes[ $scope.attribute_list[i] ];
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

        var status = 'In Process';
        if ( $scope.stepNumber >= $scope.steps ) { status = 'Complete' }

        var data =  {
            'ids': $scope.plate_ids,
            'Prep' : PrepData,
            'Plate' : PlateData,
            'Plate_Attribute' : PlateAttributes,
            'Prep_Attribute'  : PrepAttributes,
            'status' : status,
        };

        console.log("\nDATA: " + JSON.stringify(data));

        $scope.updateLookups();  // use lookup dropdowns to populate ng-model

        console.log("Transfer ? : " + $scope.Step.transfer_type +  ' = ' + $scope.transfer_type);
        if ($scope.Step.transfer_type) {

            var qty = $scope['transfer_qty' + $scope.stepNumber];
            if ( $scope['transfer_qty' + $scope.stepNumber + '_split']) {
                qty = $scope['transfer_qty' + $scope.stepNumber + '_split'].split(',');
            }  
            var qty_units = $scope['units_label'];
            console.log("Q = " + JSON.stringify(qty) + ' ' + qty_units);

            var Target = { 
                'format' : $scope.Step.Target_format,
                'sample_type'   : $scope.Step.Target_sample,
                'qty'           : qty,
                'qty_units'     : qty_units,
            };

            var Options = {
                'transfer_type' : $scope.Step.transfer_type,
                'reset_focus'   : $scope.Step.reset_focus,
                'split'         : $scope['Split' + $scope.stepNumber],
                'pack'          : $scope.pack_wells,
                'distribution_mode' : $scope['distribution_mode' + $scope.stepNumber],
            }

            console.log("Distribute: ");
            console.log("Target: " + JSON.stringify(Target));
            console.log("Options: " + JSON.stringify(Options));

            // Define Data ...

 
            var Map = $scope.distribute($scope.Samples, Target, Options);  // change to promise (test.. )
 
            data['Sources'] = $scope.Map.Samples;
            //data['Targets'] = $scope.Map.Xfer;
            data['CustomData'] = Map.Xfer;

            data['Target'] = Target;
            data['Transfer_Options'] = Options;

            //data['Transfer'] = ;
        } 

        console.log("Send: " + JSON.stringify(data));
        console.log("Called: " + url);

        if (action == 'Test') {
            console.log('Targets: ' + JSON.stringify(data['Targets']));

        }
        else {
            $http.post(url, data)
            .then ( function (returnVal) {
                var result = $scope.parse_messages(returnVal.data);

                console.log("\n **** Step Posted Successfully ***");
                console.log(JSON.stringify(result));

                if ($scope.Step.transfer_type && ! $scope.Step.reset_focus && result.Samples) {
                    console.log("Focus on " + result.Samples.length + " new Sample records ");

                    $scope.Samples = result.Samples;
                    $scope.load_Sample_info();
                    /*
                    var promiseResults = result;
                    
                    // console.log("\n** Retrieved: " + promiseResults);

                    for (var i=0; i<promiseResults.length; i++) {
                        if (promiseResults[i].Samples) {
                            console.log("Found regenerated sample list..." + i);
                            console.log( JSON.stringify(promiseResults[i].Samples) );
                            $scope.Samples = promiseResults[i].Samples;
            
                            $scope.load_Sample_info();
                        }
                        else {
                            console.log("no sample info in result: " + i);
                        }
                    }
                    */
                }
                else if ($scope.Step.transfer_type) {
                    console.log("RETAINED focus " + $scope.Step.reset_focus);
                }

                if ($scope.stepNumber < $scope.steps) {
                    console.log('completed... go to next step');
                    $scope.forward(action)
                }
                else {
                    $scope.status = 'Completed';
                    $scope.messages.push("Completed '" + $scope.protocol.name + "'' Protocol")
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
            }
        }
        console.log('split Plate data: ' + JSON.stringify(recordData));
        return recordData;
    }

    /* Enable split distribution in parallel or in series */
    $scope.splitField = function splitField (field, separator) {

        var input = $scope[field];

        if (input && input.match(/,/)) {
            console.log("\n** Split ** " + field + ' : ' + $scope[field]);
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
  
            var split = $scope['Split' + $scope.stepNumber];          
            if (split > 1 ) {
                console.log("Require split to be " + split);
                if (input_array.length > 1 && input_array.length != split) {
                    $scope.errMsg = "Multiple value count must match split count";
                    $scope['form' + $scope.stepNumber].$invalid = true;
                    console.log("FAIL");
                }
            }


            if (prefix && (input_array.length > 1) && (input_array[0] == '')) { input_array.shift() }  // remove first element 

            console.log('test: ' + JSON.stringify(input_array) );

            var split = $scope['Split' + $scope.stepNumber] || 1;
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
 
            if (entered > 1) { 
                $scope['ListTracking' + $scope.stepNumber] = true;
            }  

            console.log("\n** SPLIT: " + $scope[field] + ' OR ' + $scope[field + '_split']);
   
            return array;
        }
        else { console.log('not multiple values...') }

    }

    $scope.reset_list_mode = function reset_list_mode ( mode ) {

        if ($scope['Split' + $scope.stepNumber] > 1) {
            $scope.list_mode = 'split';
        }
        else {
            $scope.list_mode = mode;
            // $scope.list_mode = $scope['list_mode' + $scope.stepNumber];
        }

        $scope.listExample = $scope.listExamples[$scope.list_mode];            
        console.log($scope.list_mode + ' -> reset list example to ' + $scope.listExample);
    }

    $scope.distribute = function distribute (Sources, Target, Options) {
        var targetKey = 'transfer_type' + $scope.stepNumber;

        console.log("Transfer Type = " + $scope.Step.transfer_type);

        var Xfer = [];
        if (Target) {

            var newMap = new wellMapper();
 
            newMap.from(Sources);
            $scope.newMap = newMap;

            $scope.Map = $scope.newMap.distribute(Sources, Target, Options);
            
            var warnings = $scope.Map.warnings;
            if (warnings && warnings.length) { $scope.warnings = warnings }

            console.log("map: " + JSON.stringify($scope.Map.Xfer));

        }
        else {
            $scope.Map = {};
            console.log("distribution N/A");
        }
        return $scope.Map;
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
