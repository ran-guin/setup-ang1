var app = angular.module('myApp');

app.controller('ProtocolController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function protocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol controller');        
    $scope.context = 'Protocol';

    $scope.step = {};       // step specific attributes
    $scope.protocol = {};   // protocol specific attributes
    $scope.active = {};     // attributes of active samples

    $scope.step.stepNumber = 1;

    $scope.initialize = function (config, options) {

        $scope.initialize_mapper(config, options);

        if (config && config['Samples']) {
            // both protocol tracking and standard Container page 
 
            console.log("parsed: " + config['Samples'].constructor);
            if (config['Samples'].constructor === String) {
                $scope.active.Samples = JSON.parse(config['Samples'])
            }
            else {
                $scope.active.Samples = config['Samples'] || {};   // array of sample info                
            }

            console.log("S #: " + $scope.active.Samples.length);

            $scope.load_Sample_info();
            console.log("loaded");
            $scope.active.last_step = config['last_step'];
 
            $scope.load_Sample_info();
            $scope.active.valid_plate_sets = [];
        }

        if (config && config['Steps'] && config['protocol']) { 
            console.log("loaded protocol steps");
            $scope.Steps = config['Steps'];
            $scope.protocol.steps = $scope.Steps.length;
            $scope.active.protocol = config['protocol'];

            $scope.active.plate_set = config['plate_set'];

            console.log("plate set " + $scope.active.plate_set);

            if ($scope.active.plate_set === 'new') {
                console.log("Generate New plate set...");
                $scope.save_plate_set();
            }
            else { 
                console.log("Retrieved existing plate set " + $scope.active.plate_set);
            }

            if ($scope.active.last_step && $scope.active.last_step.protocol && $scope.active.protocol && $scope.active.last_step.protocol == $scope.active.protocol.name) {
                console.log("noted last step: " + JSON.stringify($scope.active.last_step));
                for (var i=0; i<$scope.Steps.length; i++) {
                    if ($scope.Steps[i].step_number === $scope.active.last_step.number) {
                        if (i >= $scope.Steps.length-2) {
                            console.log("Already completed last step ...");
                            $scope.warnings.push('Already completed this step');
                        }
                        else if ( $scope.active.last_step.status === 'Completed Protocol') {
                            $scope.messages.push("Completed '" + $scope.active.last_step.protocol + "' protocol");
                        }
                        else if ( $scope.active.last_step.status === 'Completed Transfer') {
                            var format = $scope.active.Samples[0].container_format;

                            if ($scope.active.last_step.name.match(format) ) {
                                console.log("Target plates found");
                                $scope.active.stepNumber = i+2;
                                $scope.messages.push("Continuing protocol after '" + $scope.active.last_step.name + "' ...");

                            }
                            else {
                                console.log($scope.active.last_step.name + ' not ' + format);
                                $scope.active.stepNumber = i+1;
                                $scope.messages.push("already completed '" + $scope.active.last_step.name + "' ... repeat if required or fetch target samples to continue protocol");
                            }
                        }
                        else {
                            $scope.active.stepNumber = i+2;
                            console.log("point to next step if applicable");
                            $scope.messages.push("already completed: '" + $scope.active.last_step.name + "' ... continuing to next step");
                        }
                        i = $scope.Steps.length; // stop here.. 
                    }
                }
            }
            else {
                console.log("Last Step : " + JSON.stringify($scope.active.last_step));
                console.log("Protocol: " + JSON.stringify($scope.active.protocol));
                $scope.messages.push("Starting new protocol " + $scope.timestamp);
            }

            $scope.warning = "Already Completed";

            $scope.Options = config['Options'] || {};   

            $scope.Attributes = config['Attributes'];
            $scope.attribute_list = [];
            if ($scope.Attributes ) { 
                $scope.attribute_list = Object.keys($scope.Attributes);
            }

            $scope.PrepFields = [];
            
            // well specific attributes handled in WellController //
            // eg SplitFields, split_mode, distribution_mode, target_format etc.
            
            $scope.user = 'Ran';  // TEMP - use payload ... 
            $scope.FK_Employee__ID = 2;  // test data 

            console.log("Steps: " + JSON.stringify($scope.Steps) );
            $scope.reload();

            $scope.SplitFields = {};

            $scope.step.list_mode = 'serial';
            $scope.listExamples = {
                'serial' : " x,y,z... -> x,x, y,y, z,z ...",
                'parallel' : " x,y,z... -> x,y,z... x,y,z...",
                'split'    : " multiple values applied to respective splits",
            }; 

            $scope.step.listExample = $scope.listExamples[$scope.step.list_mode];
        }
        else {
            // No protocol loaded ... 
            $scope.active.plate_set = 'new';  // set default .. 
            $scope.get_plate_sets();
        }

        console.log("initialization complete...");

    }

    $scope.exitThisProtocol = function exitThisProtocol () {
        console.log("Exit Protocol");
        $scope.protocol.status = 'Completed';
    }

    $scope.load_Sample_info = function load_Sample_info () {
        var ids = [];
        for (var i=0; i<$scope.active.Samples.length; i++) {
            if ($scope.active.Samples[i].id) { ids.push($scope.active.Samples[i].id) }
        }
        $scope.active.plate_list = ids.join(',');
        $scope.active.plate_ids  = ids;

        $scope.active.N = $scope.active.plate_ids.length;
        
        if ($scope.active.Samples[0] && $scope.active.Samples[0]['container_format']) {
            $scope.active.container_format = $scope.active.Samples[0]['container_format'];
        }
        else { $scope.active.container_format = 'undefined' }

        if ($scope.active.Samples[0] && $scope.active.Samples[0]['sample_type']) {
            $scope.active.sample_type = $scope.active.Samples[0]['sample_type'];
        }
        else { $scope.active.sample_type = 'undefined' }

        // console.log("Samples: " + $scope.active.plate_list);
    }

    $scope.set_plate_set = function (set) {
        $scope.active.plate_set = set;
    }

    $scope.get_plate_sets = function () {

        var count = $scope.active.plate_ids.length;
        console.log("using " + count + ' ids');

        var condition = " FK_Plate__ID IN (" + $scope.active.plate_ids.join(',') + ") GROUP BY Plate_Set_Number HAVING COUNT(*) = " + count;
        
        var searchData = {
            scope: { 'Plate_Set' : [ 'DISTINCT Plate_Set_Number as PS'] },
            condition : condition,
        };

        $http.post('/Record/search', searchData)
        .then ( function (result) {
            console.log("RESULT: " + JSON.stringify(result));
            $scope.valid_plate_sets = [];
            if (result.data && result.data[0] && result.data[0][0]) {
                for (var i=0; i<result.data[0].length; i++) {
                    $scope.valid_plate_sets.push(result.data[0][i].PS);
                }
            }
            console.log("Retrieved SET: " + JSON.stringify($scope.valid_plate_sets));
        })
        .catch ( function (err) { 
            console.log("Error getting sets: " + err);
        }); 
    }

    $scope.save_plate_set = function (parent) {

        $http.post('/Record/search', { scope : { 'Plate_Set' : [ 'Max(Plate_Set_Number) as MaxPS'] }})
        .then ( function (result) {
           if (result.data && result.data[0] && result.data[0][0]) {
                var maxPS = result.data[0][0].MaxPS || 1
                console.log("SAVE SET " + JSON.stringify(maxPS));

                var data = [];
                for (var i=0; i<$scope.active.Samples.length; i++) {
                    var record = { FK_Plate__ID : $scope.active.Samples[i].id, Plate_Set_Number: maxPS+1 , FKParent_Plate_Set__Number: parent }    
                    data.push(record);
                }
                
                $http.post("Record/save", { model: 'plate_set', data: data} )
                .then (function (result) {
                    $scope.active.plate_set = maxPS + 1;
                    console.log("SAVED Plate Set: " + $scope.active.plate_set);
                    $scope.valid_plate_sets.push($scope.active.plate_set);
                })
                .catch ( function (err) {
                    $scope.errors.push("Error saving plate set");
                    console.log("Error saving plate set");
                })


            }
            else { console.log('max ps result in incorrect format') }
        })
        .catch ( function (err) {
            console.log("Error retrieving max plate set");
        });
    }    

    $scope.forward = function forward(action) {

        var state = action || 'Completed';

        $scope['status' + $scope.step.stepNumber] = state;

        $scope.step.stepNumber++;
        console.log('forward');
        $scope.reload();
    }
 
    $scope.back = function back() {
        $scope.step.stepNumber--;
        console.log('back');
        $scope.reload();
    }

    // OLD ??? 
    $scope.reset_Split_fields = function (fields) {
        
        if (! fields) { fields = Object.keys($scope.SplitFields) }

        for (var i=0; i<fields.length; i++) {
            $scope.splitField(fields[i]);
            console.log('reset split strategy for ' + fields[i]);
        }

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
            'Prep_Action' : action,
            'Prep_Comments' : $scope['comments' + $scope.step.stepNumber],
            'Prep_DateTime' : $scope.timestamp,
            // 'FK_Plate_Set__Number' : $scope.active.plate_set,  // legacy ... in Plate_Prep... 
         };

        console.log("PREP DATA: " + JSON.stringify(PrepData));
        var PlateInfo = ['plate_list', 'solution', 'equipment','solution_qty','solution_qty_units', 'transfer_qty','transfer_qty_units'];

        // Legacy fields //
        var map = {
            'plate_list' : 'FK_Plate__ID',
            'solution' : 'FK_Solution__ID',
            'equipment' : 'FK_Equipment__ID',
            'solution_qty' : 'Solution_Quantity',
            'solution_qty_units' : 'Solution_Quantity_Units',
            'transfer_qty' : 'Transfer_Quantity',
            'transfer_qty_units' : 'Transfer_Quantity_Units'
        };

        $scope['plate_list_split'] = $scope.active.plate_list;  // test.. should be reverse split
        console.log("split Data to " + $scope.active.N + ' values');

        var PlateData = $scope.splitData(PlateInfo, $scope.active.N, map);

        console.log("load " + $scope.active.N + ' plate ids...');
        for (var i=0; i<$scope.active.N; i++) {
            PlateData[i]['FK_Plate__ID'] = $scope.active.Samples[i].id;
            PlateData[i]['FK_Plate_Set__Number'] = $scope.active.plate_set;
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
                var key = att.name + $scope.step.stepNumber;
                if (att.type == 'Count' && att.model == 'Plate') { 
                    $scope[key] = '<increment>';
                    PlateAttributes[att.id] = $scope[key];
                }
                else if (att.model == 'Plate' && $scope.SplitFields[key] && $scope.SplitFields[key].length ) {
                    PlateAttributes[att.id] = $scope.SplitFields[key];
                    console.log(key + ' : ' + $scope.SplitFields[key]);
                }
                else if (att.model == 'Plate' && $scope[key] != null && $scope[key].length ) {
                    PlateAttributes[att.id] = $scope[key];
                    console.log(key + ' : ' + $scope[key]);
                }
                else if (att.model == 'Prep' && $scope[key] != null) {
                    PrepAttributes[att.id] = $scope[key];
                    console.log(key + ' = ' + $scope[key]);
                }
                else {
                    console.log("Invalid Attribute: " + JSON.stringify(att))
                }
            }
            console.log("Plate Attribute Data: " + JSON.stringify(PlateAttributes));
            console.log("Plate Attribute Data: " + JSON.stringify(PrepAttributes));
        }

        var status = 'In Process';
        if ( $scope.step.stepNumber >= $scope.protocol.steps ) { status = 'Complete' }

        var data =  {
            'ids': $scope.active.plate_ids,
            'Prep' : PrepData,
            'Plate' : PlateData,
            'Plate_Attribute' : PlateAttributes,
            'Prep_Attribute'  : PrepAttributes,
            'status' : status,
        };

        console.log("\nDATA: " + JSON.stringify(data));

        $scope.updateLookups();  // use lookup dropdowns to populate ng-model

        var loc = 'location' + $scope.step.stepNumber;
        if ( $scope[loc] ) {
            data['Move'] = $scope.SplitFields[loc] || $scope[loc];
            console.log("Move Sample(s) to: " + JSON.stringify(data['Move']) );
        }

        console.log("Transfer ? : " + $scope.Step.transfer_type +  ' = ' + $scope.transfer_type);

        var promises = [];
        if (action != 'Skipped' && $scope.Step.transfer_type) {
            // Define Data ...
            // promises.push( $scope.distribute() ); 
            console.log("queue distribution..."); 
            $scope.distribute(); // WellMapper call ... 
            console.log('distributed');
        } 

        $q.all(promises)
        .then (function (result) {

            console.log("Call url: " + url);

            console.log(JSON.stringify(result));
            if (promises.length) { 
                data['Transfer_Options'] = $scope.Map.Options;
                data['Transfer'] = $scope.Map.Transfer;
            }

            console.log("post: " + JSON.stringify(data));
            $http.post(url, data)
            .then ( function (returnVal) {
                console.log("Returned: " + JSON.stringify(returnVal));

                var result = $scope.parse_messages(returnVal.data);

                console.log("\n **** Step Posted Successfully ***");
                console.log(JSON.stringify(result));

                if (result.error && result.error.length) { 
                    console.log("Errors encountered");
                    $scope.errors = $scope.parse_standard_error(result.error);
                    $scope.errors.push("Skip step if necessary to continue");
                }
                else {
                    if (result.warning && result.warning.length) { 
                        console.log("Warnings encountered");
                        scope.warnings = parse_standard_error(result.warning);
                    }
                    console.log("no errors encountered...");
                    if ($scope.Step.transfer_type && ! $scope.Step.reset_focus && result.Samples) {
                        console.log("Focus on " + result.Samples.length + " new Sample records ");

                        $scope.active.Samples = result.Samples;
                        $scope.save_plate_set( $scope.active.plate_set );
                        $scope.load_Sample_info();
                        /*
                        var promiseResults = result;
                        
                        // console.log("\n** Retrieved: " + promiseResults);

                        for (var i=0; i<promiseResults.length; i++) {
                            if (promiseResults[i].Samples) {
                                console.log("Found regenerated sample list..." + i);
                                console.log( JSON.stringify(promiseResults[i].Samples) );
                                $scope.active.Samples = promiseResults[i].Samples;
                
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

                    if ($scope.step.stepNumber < $scope.protocol.steps) {
                        console.log('completed... go to next step');
                        $scope.forward(action)
                    }
                    else {
                        $scope.protocol.status = 'Completed';
                        $scope.messages.push("Completed '" + $scope.active.protocol.name + "'' Protocol")
                    }
                }

                if (action == 'Debug') {
                    $scope.errMsg = JSON.stringify(result,null,4);
                }
            })
            .catch ( function (err) {
                console.log("Encountered error : " + err);
                $scope.error(err);
            });
        })
        .catch (function (err) {
            console.log("");
            $scope.error(err);
        })
    }

    /* Retrieve data from fields which are splittable ... eg may accept different values for each of N plate_ids based on comma-delimited list */
    $scope.splitData = function ( input, N, map) {
        var recordData = [];
        for (var n=0; n<N; n++) {
            recordData[n] = {};
            for (var i=0; i< input.length; i++) {
                var fld = input[i];
                var key = fld + $scope.step.stepNumber;

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
        console.log("ENTER SPLITFIELD " + field + " : " + input);
        if (field.match(/split/i)) {
            console.log("reset specs");
            $scope.step.fill_by = 'column';
            $scope.distribute();
        }

        var trim = new RegExp($scope.step.stepNumber + '$');
        var model = field.replace(trim,'');

        var prefix = $scope.Prefix(model);
            
        if (input && ( input.match(/,/) || input.match(prefix) ) ) {
            console.log("\n** Split ** " + field + ' : ' + $scope[field]);
            $scope[field + '_split'] = input;

            if (prefix) { 
                separator = prefix;
            }
            else {
                separator = ',';
            }
            console.log("Split " + field + ' ON ' + separator + ' : ' + prefix);

            var splitExpr = new RegExp('\\s*' + separator + '\\s*', 'ig');

            var input_array = input.split(splitExpr);
  
            var split = $scope['Split' + $scope.step.stepNumber];          
            if (split > 1 ) {
                console.log("Require split to be " + split);
                if (input_array.length > 1 && input_array.length != split) {
                    $scope.errMsg = "Multiple value count must match split count";
                    $scope['form' + $scope.step.stepNumber].$invalid = true;
                    console.log("FAIL");
                }
            }

            if (prefix && (input_array.length > 1) && (input_array[0] == '')) { input_array.shift() }  // remove first element 

            console.log('test: ' + JSON.stringify(input_array) );

            var split = $scope['Split' + $scope.step.stepNumber] || 1;
            var Nx = $scope.active.N * split;
            var entered = input_array.length;

            var factor = Nx / entered;
            var round = Math.round(factor);
            
            console.log("Array: " + JSON.stringify(input_array) + " x " + factor);
     
            if (factor == round) {
                 $scope[field+'_errors'] = '';
                 $scope.formDisabled  = false;
            }
            else {
                // $scope.errMsg = "# of entered values must be factor of " + $scope.active.N;
                $scope[field+'_errors'] = "# of entered values must be factor of " + $scope.active.N;
                $scope.errors.push("# of entered values must be factor of " + $scope.active.N);
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
                $scope['ListTracking' + $scope.step.stepNumber] = true;
            }  

            console.log("\n** SPLIT: " + $scope[field] + ' OR ' + $scope[field + '_split']);
   
            return array;
        }
        else { 
            console.log('not multiple values...');
            $scope[field + '_split'] = null;
            $scope.SplitFields[field] = null;
        }

    }

    $scope.reset_list_mode = function reset_list_mode ( mode ) {

        if ($scope['Split' + $scope.step.stepNumber] > 1) {
            $scope.list_mode = 'split';
        }
        else {
            $scope.list_mode = mode;
            // $scope.list_mode = $scope['list_mode' + $scope.step.stepNumber];
        }

        $scope.listExample = $scope.listExamples[$scope.list_mode];            
        console.log($scope.list_mode + ' -> reset list example to ' + $scope.listExample);
    }

    $scope.distribute = function distribute () {
        console.log("Distribute samples...");
        var deferred = $q.defer(); 

        var targetKey = 'transfer_type' + $scope.step.stepNumber;

        var qty = $scope['transfer_qty' + $scope.step.stepNumber];
        if ( $scope['transfer_qty' + $scope.step.stepNumber + '_split']) {
            qty = $scope['transfer_qty' + $scope.step.stepNumber + '_split'].split(',');
        }  
        var qty_units = $scope['units_label'];
        console.log("Q = " + JSON.stringify(qty) + ' ' + qty_units);

        var Target = { 
            'Container_format' : $scope.Step.Target_format,
            'Sample_type'   : $scope.Step.Target_sample,
            'qty'           : qty,
            'qty_units'     : qty_units,
        };

        var split = $scope['Split' + $scope.step.stepNumber] || $scope.Step['split'];
        var fill =  $scope.map.fill_by || $scope.Step['fill_by'];
        
        var Options = {
            'transfer_type' : $scope.Step.transfer_type,
            'reset_focus'   : $scope.Step.reset_focus,
            'split'         : $scope['Split' + $scope.step.stepNumber] || $scope.Step['split'],   // $scope['Split' + $scope.step.stepNumber],
            'pack'          : $scope.Step['pack'],    // $scope.pack_wells,
            'distribution_mode' : $scope['distribution_mode' + $scope.step.stepNumber],
            'fill_by'  : $scope.map.fill_by || $scope.Step['fill_by'],
            'target_size' : $scope.Step['target_size'],
        }
        
        console.log(" S: " + split + "; F: " + fill);


        console.log("Distribute: ");
        console.log("Target: " + JSON.stringify(Target));
        console.log("Options: " + JSON.stringify(Options));

        var newMap = new wellMapper();

        console.log("New Map: " + JSON.stringify(newMap));

        newMap.from($scope.active.Samples);
        $scope.newMap = newMap;

        // $scope.Map = $scope.newMap.distribute(Sources, Target, Options);
        
        console.log("call well redistribution...");
        $scope.redistribute_Samples($scope.active.Samples, Target, Options)
        .then ( function (Map) {
            var warnings = Map.warnings;
            if (warnings && warnings.length) { $scope.warnings = warnings }

            console.log("\n*** Distribution Map: " + JSON.stringify(Map));
            
            $scope.Map = Map.Map;
            $scope.map.Options = Map.Options;
            $scope.map.Transfer = Map.Transfer;

            deferred.resolve(Map);
        })
        .catch ( function (err) {
            console.log("Error calling redistribute");
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
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

        $scope.Step = $scope.Steps[$scope.step.stepNumber-1];

        if (! $scope.Step ) { $scope.error("No Steps Defined for this Protocol !") }
        else {
            $scope.input = $scope.Step['input_options'].split(':');
            $scope.defaults = $scope.Step['input_defaults'].split(':');
            $scope.formats   = $scope.Step['input_format'].split(':');

            var custom_options = $scope.Step['custom_settings'];

            console.log("\n** Load custom options: " + custom_options);
            $scope.parse_custom_options(custom_options);

            if ($scope.Step['transfer_type']) { $scope.distribute() }

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
                var id = key + $scope.step.stepNumber;

                $scope.Show[key] = true;
                if ($scope.defaults.length > i) {
                    var def = $scope.defaults[i] || '';
                    if (key.match(/\_qty$/)) {
                        var units = def.match(/[a-zA-Z]+/);
                        if (units && units.length) {
                            console.log(JSON.stringify(units));

                            $scope.Default[key + '_units'] = units[0]; // units only
                            $scope[key + '_units' + $scope.step.stepNumber] = units[0];
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
            console.log("Step: " + $scope.step.stepNumber + ' / ' + $scope.protocol.steps);
            console.log("Step: " + JSON.stringify($scope.Step));
            console.log("Show: " + JSON.stringify($scope.Show));
            console.log("Defaults: " + JSON.stringify($scope.Default));
            console.log("Format: " + JSON.stringify($scope.Format));
            console.log("Input: " + JSON.stringify($scope.input));

            $scope.errMsg = '';
        }
    }

    $scope.parse_custom_options = function (custom_options) {
        
        var Opts = {};
        if (custom_options) { 
            Opts = JSON.parse(custom_options)
        }

        var keys = $scope.mapping_keys;
        for (var i=0; i<keys.length; i++) {
            if ( $scope[ keys[i] + $scope.step.stepNumber ] ) {
                $scope.Step[keys[i]] = $scope[ keys[i] + $scope.step.stepNumber];
                console.log("manually set custom key: " + keys[i] + ' = ' + $scope[ keys[i]]);
            }
            else if (Opts[keys[i]]) {
                $scope.Step[keys[i]] = $scope[ keys[i] + $scope.step.stepNumber] || Opts[keys[i]];
                console.log("Custom: " + keys[i] + ' = ' + Opts[keys[i]]);
            }
        }

        if ($scope.Step['transfer_type'] && ! $scope.Step['target_size']) {
            $scope.Step['target_size'] = $scope.active.Samples[0].box_size;
            console.log("Use box size of original sample: " + $scope.Step['target_size']);
        }

        $scope.Custom_Options = Opts;
    }


    $scope.ngalert = function ngalert(msg) {
        console.log("NG ALERT: " + msg);
    }

}]);
