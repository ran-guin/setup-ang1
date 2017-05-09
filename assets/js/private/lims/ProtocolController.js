var app = angular.module('myApp');

app.controller('ProtocolController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function protocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol controller');        
    $scope.context = 'Protocol';

    $scope.step = {};       // step specific attributes
    $scope.protocol = {};   // protocol specific attributes

    $scope.step.stepNumber = 1;
    $scope.SplitFields = {};
    $scope.backfill_date = null;
 

    $scope.form = {};
    $scope.sample_count = 0;

    $scope.initialize = function (config, options) {
        console.log("initialize protocol");
        $scope.initialize_payload(config);

        if (config && config['backfill_date']) {
            $scope.backfill_date = config['backfill_date'];
        }
 
        if (config && config['Samples']) {
            // both protocol tracking and standard Container page 

            var Samples = config['Samples'] || {};
            if (config['Samples'].constructor === String) {
               Samples = JSON.parse(config['Samples'])
            }

            if ( config['last_step'] ) {
                $scope.active.last_step = config['last_step'];
            }
            else {
                $scope.initialize_Progress(Samples);            
            }

            $scope.validate_Samples(Samples);

            $scope.load_active_Samples(Samples);
            console.log("Loaded active samples");
            
            console.log(JSON.stringify($scope.active.Samples));
            
            $scope.active.protocol = config['protocol'];
            // $scope.active.last_step = config['last_step'];
            
            $scope.sample_count = $scope.active.Samples.length;
        }

        console.log("Steps: " + JSON.stringify(config['Steps']));
        console.log('Protoco: ' + JSON.stringify(config['protocol']));

        if (config && config['Steps'] && config['protocol']) { 

            $scope.initialize_mapper(config, options);

            console.log("loaded protocol steps");
            $scope.Steps = config['Steps'];
            $scope.protocol.steps = $scope.Steps.length;

            var plate_set = config['plate_set'];
            console.log("plate set " + plate_set);
            if (plate_set === 'new') {
                $scope.load_plate_set({ Samples : $scope.active.Samples });
            }
            else {
                $scope.load_plate_set( { existing_set : plate_set });
            }

            if ($scope.active.last_step && $scope.active.last_step.protocol && $scope.active.protocol && $scope.active.last_step.protocol == $scope.active.protocol.name) {
                console.log("noted last step: " + JSON.stringify($scope.active.last_step));
                
                // figure out starting step number ... 
                if ( $scope.active.last_step.name === 'Completed Protocol') {
                    $scope.warnings.push("Already Completed '" + $scope.active.last_step.protocol + "' protocol.  (Do you want to use parent samples instead ?)");
                    $scope.active.stepNumber = 1;
                }
                else {
                    for (var i=0; i<$scope.Steps.length; i++) {
                        if ($scope.Steps[i].step_number === $scope.active.last_step.number) {
                            if (i > $scope.Steps.length-1) {
                                console.log("Already completed last step ..." + i + ' of ' + $scope.Steps.length);
                                $scope.warning('Already completed this step');
                            }
                            else if ( $scope.active.last_step.name === 'Completed Protocol') {
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
                                $scope.message("already completed: '" + $scope.active.last_step.name + "' ... continuing to next step");
                            }
                            i = $scope.Steps.length; // stop here.. 
                        }
                    }
                }
            }
            else {
                console.log("Last Step : " + JSON.stringify($scope.active.last_step));
                console.log("Protocol: " + JSON.stringify($scope.active.protocol));
                $scope.messages.push("Starting new protocol " + $scope.timestamp);
            }

            $scope.step.stepNumber = $scope.active.stepNumber || 1;

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

            $scope.step.list_mode = 'serial';
            $scope.listExamples = {
                'serial' : " x,y,z... -> x,x, y,y, z,z ...",
                'parallel' : " x,y,z... -> x,y,z... x,y,z...",
                'split'    : " multiple values applied to respective splits",
            }; 

            $scope.step.listExample = $scope.listExamples[$scope.step.list_mode];

            if ($scope.active.last_protocol_id === $scope.Step.Lab_protocol) {
                if ($scope.active.last_step.name === $scope.Step.name) {
                    $scope.warning("This step has already been completed... (do you want to use progeny instead ?)");
                }
                else if ($scope.active.last_step.name === 'Completed Protocol') {
                    $scope.warning("This protocol has already been completed... (do you want to use progeny instead ?)");
                }
            }

            // $scope.validate_prep_form();
        }
        else {
            // No protocol loaded ... 

            // var keys = Object.keys($scope.validation_warnings);
            // for (var i=0; i< keys.length;i++) {
            //     var warns = $scope.validation_warnings[keys[i]];
            //     console.log("WARNS: " + JSON.stringify(warns));
            //     for (j=0; j<warns.length; j++) {
            //         $scope.warning(warns[j])
            //     }
            // }

            // var keys = Object.keys($scope.validation_errors);
            // for (var i=0; i< keys.length;i++) {
            //     var errs = $scope.validation_errors[keys[i]];
            //     console.log("ERRS: " + JSON.stringify(errs));
            //     for (j=0; j<errs.length; j++) {
            //         $scope.error(errs[j])
            //     }
            // }

            console.log("load valid sets");
            $scope.get_plate_sets();
        }

        console.log("initialization complete...");
    }

    $scope.validate_Samples = function (Samples) {
        var empty_samples = 0;
        var missing_units = 0;
        var unslotted = false;

        console.log("Check Sample Status for " + Samples.length + ' Samples');
        for (var i=0; i<Samples.length; i++) {
            if (Samples[i].last_step !== $scope.active.last_step.name) {
                $scope.warning("Samples at different stages of pipeline..");
            }

            if (!Samples[i].qty) {
                empty_samples++;
            }
            
            console.log( i + " S: " + Samples[i].qty + Samples[i].qty_units);
            if (Samples[i].qty && !Samples[i].qty_units) {
                missing_units++;
            }

            if ( ! Samples[i].box_id) {
                console.log(i + " is unslotted");
                unslotted = true;
            }
            else { console.log(i + ' in box ' + Samples[i].box_id) }
        }    

        if (empty_samples) {
            $scope.validation_warning('sample', "Sample(s) with no volume included");
        }
        if (missing_units) {
            $scope.validation_error('sample', "Sample(s) with missing volume units");
        }
        if (unslotted) {
            console.log('set warning for sample scope... ');
            $scope.validation_warning('sample', "Found Sample(s) without specified slot position(s)");
        }
        console.log(unslotted + ' Validation: ' + JSON.stringify($scope.validation_errors));
    }

    $scope.initialize_Progress = function (Samples) {
        $scope.active.last_step = {};
        $scope.active.last_step.name = Samples[0].last_step;
        $scope.active.last_step.protocol = Samples[0].last_protocol;
        $scope.active.last_step.protocol_id = Samples[0].last_protocol_id;
        $scope.active.last_step.number = Samples[0].last_step_number;

        if ($scope.active.last_step.name === 'Completed Protocol') {
            $scope.active.last_step.status = 'Completed';
        }
        else {
            $scope.active.last_step.status = 'In Progress';
        }
    }
      
    $scope.update_progress = function (name, status) {
        $scope.active.last_step.protocol = $scope.active.protocol.name;
        $scope.active.last_step.name = name;
        $scope.active.last_step.status = status || 'In Progress';
        $scope.active.last_step.protocol_id = $scope.active.protocol.id;
        console.log("Reset Progress: " + JSON.stringify($scope.active.last_step));
    }

    $scope.exitThisProtocol = function exitThisProtocol () {
        console.log("Exit Protocol");
        $scope.protocol.status = 'Completed';
    }

    $scope.set_plate_set = function (set) {
        $scope.active.plate_set = set;
    }

    $scope.forward = function forward(action) {

        var state = action || 'Completed';

        if (action === 'Completed') {
            // $scope.set_active_attribute('last_step', $scope.Step.name);
        }

        $scope.form['status' + $scope.step.stepNumber] = state;

        $scope.step.stepNumber++;
        console.log('forward');
       
        $scope.restart_form();
        $scope.reload();
    }

    $scope.back = function back() {
        $scope.step.stepNumber--;
        console.log('back');

        $scope.restart_form();
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

        console.log("reset message before complete execution");
        $scope.reset_messages();

        $scope.uninjectData();

        // complete step (if validated)
        $scope.action = action;

        var timestamp = $scope.backfill_date || $scope.timestamp;

        // Legacy fields 
        var PrepData = { 
            'Prep_Name' : $scope.Step.name ,
            'FK_Lab_Protocol__ID' : $scope.Step['Lab_protocol'],
            'FK_Employee__ID' : 1, 
            'Prep_Action' : action,
            'Prep_Comments' : $scope.form['comments' + $scope.step.stepNumber],
            'Prep_DateTime' : timestamp,
            // 'FK_Plate_Set__Number' : $scope.active.plate_set,  // legacy ... in Plate_Prep... 
         };

        console.log("PREP DATA: " + JSON.stringify(PrepData));
        var PlateInfo = ['plate_list', 'solution', 'equipment', 'solution_qty', 'solution_qty_units', 'transfer_qty','transfer_qty_units'];

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


        $scope.normalize_units('solution_qty', $scope.step.stepNumber);

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

        console.log("*** FORM: *** " + JSON.stringify($scope.form));
        console.log("*: INPUT: *** " + JSON.stringify($scope.input));
        if (action != 'Skipped') {
            // Load Attribute Data 
            for (var i=0; i<$scope.attribute_list.length; i++) {
                var att = $scope.Attributes[ $scope.attribute_list[i] ];
                var key = att.name + $scope.step.stepNumber;

                if (att.type == 'Count' && att.model == 'Plate' && $scope.input.indexOf(att.name) > -1) { 
                    $scope.form[key] = '<increment>';
                    PlateAttributes[att.id] = $scope.form[key];
                    console.log("*** ATT " + key + " : " + JSON.stringify($scope.form[key]));
                }
                else if (att.model == 'Plate' && $scope.SplitFields[key] && $scope.SplitFields[key].length) {
                    PlateAttributes[att.id] = $scope.SplitFields[key];
                    console.log(key + ' : ' + $scope.SplitFields[key]);
                }
                else if (att.model == 'Plate' && $scope.form[key] != null && $scope.form[key].length ) {
                    PlateAttributes[att.id] = $scope.form[key];
                    console.log(key + ' : ' + $scope.form[key]);
                }
                else if (att.model == 'Prep' && $scope.form[key] != null && $scope.form[key].length) {
                    PrepAttributes[att.id] = $scope.form[key];
                    console.log(key + ' = ' + $scope.form[key]);
                }
                else {
                    console.log("Invalid Attribute: " + JSON.stringify(att));
                    console.log("type: " + att.type);
                    console.log("model: " + att.model);
                    console.log(key + ' : ' + $scope.form[key]);
                    console.log(JSON.stringify($scope.form));
                }
            }
            console.log("Plate Attribute Data: " + JSON.stringify(PlateAttributes));
            console.log("Prep Attribute Data: " + JSON.stringify(PrepAttributes));
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
        if ( $scope.form[loc] ) {
            data['Move'] = $scope.SplitFields[loc] || $scope.form[loc];
            console.log("Move Sample(s) to: " + JSON.stringify(data['Move']) );
        }

        console.log("Transfer ? : " + $scope.Step.transfer_type +  ' = ' + $scope.transfer_type);

        var promises = [];
        if (action != 'Skipped' && $scope.Step.transfer_type) {
            // Define Data ...
            // promises.push( $scope.distribute() ); 
            console.log("queue distribution..."); 
            promises.push( $scope.initiate_transfer() ); // WellMapper call ... 
            console.log('distributed');
        } 

        $q.all(promises)
        .then (function (result) {

            var url = "/Lab_protocol/complete-step";
            console.log("Call url: " + url);

            // console.log(JSON.stringify(result));
            if (promises.length) { 
                var Map = promises[0].data;
                console.log(JSON.stringify(Map));

                data['Transfer_Options'] = $scope.map.Options;

                // use backfill data for Plate creation date 
                if ($scope.backfill_date) {
                    data['Transfer_Options'].timestamp = $scope.backfill_date;
                }

                console.log($scope.map.Options);

                console.log($scope.Map.Transfer);

                data['Transfer'] = $scope.Map.Transfer;
                console.log("transfer detected");

                if (PlateData[0] && PlateData[0].Solution_Quantity) {
                    // pass solution quantities as options to add to target qty ... 
                    data['Transfer_Options']['solution_qty'] = _.pluck(PlateData,'Solution_Quantity');
                }
            }

            console.log("\n** POST: " + JSON.stringify(data));
            $http.post(url, data)
            .then ( function (returnVal) {
                // console.log("Returned: " + JSON.stringify(returnVal));

                var completeResult = $scope.parse_messages(returnVal.data);

                console.log("\n **** Step Posted Successfully ***");
                console.log(JSON.stringify(completeResult));

                if (completeResult.error && completeResult.error.length) { 
                    console.log("Errors encountered");
                    $scope.parse_standard_error(completeResult.error, 'error');
                    $scope.errors.push("Skip step if necessary to continue");
                }
                else {
                    console.log("UPDATE PROGRESS " + $scope.active.protocol.name);
                    if ($scope.action === 'Completed') {
                       $scope.update_progress($scope.Step.name);
                    }

                    if (completeResult.warning && completeResult.warning.length) { 
                        console.log("Warnings encountered");
                        $scope.parse_standard_error(completeResult.warning, 'warning');
                    }
                    console.log("no errors encountered...");
                    if ($scope.Step.transfer_type && ! $scope.Step.reset_focus && completeResult.Samples) {
                        if (completeResult.Samples[0].id === $scope.active.Samples[0].id) {
                            console.log("sample list unchanged...");
                        }
                        else {
                            console.log("Focus on " + completeResult.Samples.length + " new Sample records ");
                            $scope.reload_active_Samples(completeResult.Samples);

                            $scope.validate_Samples;
                        }
                    }
                    else if ($scope.Step.transfer_type) {
                        console.log("RETAINED focus " + $scope.Step.reset_focus);
                    }

                    if ($scope.step.stepNumber < $scope.protocol.steps) {
                        console.log('completed... go to next step');
                        $scope.forward(action);
                        $scope.active.last_step.status = 'In Progress';
                    }
                    else {
                        $scope.protocol.status = 'Completed';
                        $scope.active.last_step.status = 'Completed';
                        $scope.active.last_step.name = 'Completed Protocol';
                        $scope.messages.push("Completed '" + $scope.active.protocol.name + "'' Protocol...")
                    }
                }

                if (action == 'Debug') {
                    $scope.errMsg = JSON.stringify(completeResult,null,4);
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
    $scope.splitData = function ( input, N, map, options) {
        // convert input values into recordData 
        //   converts standard field name to actual DB field names (via map) if necessary
        //   converts single values to array of N values
        //   converts comma-delimited list into array of N values if necessary
        //   converts foreign key values to integer (id only) if applicable
        //
        if ( !options ) { options = {} }

        var FK = options.FK || {};
        console.log("Parse INPUT DATA");
        console.log(JSON.stringify(input));

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
                
                var value = '';
                if ($scope.split[key]) {
                    var list = $scope.split[key];
                    var splitV = list.split(/,/);
                    value = splitV[n];
                }
                else if ($scope.form[key]) {
                    value = $scope.form[key];
                }

                var prefix = $scope.Prefix(fld);
                console.log(fld + " V= " + value);
                if (value && value.constructor === Object && value.id) {
                    value = value.id;
                    console.log("Converted dropdown object to id " + value);
                }
                else if (prefix && value) {
                    var regex = new RegExp(prefix, 'i');
                    value = value.replace(regex, '');
                    console.log("replace prefix " + prefix + ' -> ' + value);
                }

                if (value) { recordData[n][mapped] = value }
            }
        }
        console.log('split input data: ' + JSON.stringify(recordData));
        return recordData;
    }

    $scope.update_splitField = function (field, separator) {
        $scope.splitField(field, separator)
        .then (function (array) {
            $scope.validate_prep_form(field);
        })
        .catch (function (err) {
            console.log("Error splitting field");
            $scope.validate_prep_form(field);            
        })

    }
    /* Enable split distribution in parallel or in series */
    $scope.splitField = function splitField (field, separator) {

        var deferred = $q.defer();

        var input = $scope.form[field];
        if (field.match(/split/i)) {
            console.log("reset specs");
            $scope.step.fill_by = 'column';
            $scope.initiate_transfer();
        }

        var trim = new RegExp($scope.step.stepNumber + '$');
        var model = field.replace(trim,'');

        var prefix = $scope.Prefix(model);
            
        if (input && ( input.match(/,/) || input.match(prefix) ) ) {
            console.log("\n** Split ** " + field + ' : ' + $scope.form[field]);
            $scope.split[field] = input;

            if (prefix) { 
                separator = prefix;
            }
            else {
                separator = ',|\\s';   // allow either comma-delimited or space-delimited 
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
     
            $scope.split[field] = array.join(','); 

            console.log(field + ' split to: ' + JSON.stringify($scope.split[field]));
            
            $scope.SplitFields[field] = array;
 
            if (entered > 1) { 
                $scope['ListTracking' + $scope.step.stepNumber] = true;
            }  

            console.log("\n** SPLIT: " + $scope.form[field] + ' OR ' + $scope.split[field]);
            
            deferred.resolve(array);
        }
        else { 
            console.log('not multiple values...');
            $scope.split[field] = null;
            $scope.SplitFields[field] = null;
            deferred.resolve([]);
        }
            
        return deferred.promise;

    }

    // function below uses validate_form from SharedController module... 

    $scope.validate_prep_form = function(element, options) {
        // run validation each time an element is changed... 

        if (!options) { options = {} }

        var step_number = $scope.step.stepNumber;

        console.log("validate prep form... ");
 
        var promises = [];

        if ($scope.Step.transfer_type) {
            console.log("initiate transfer");
            // for transfer steps ... run redistribution first ...
            promises.push( $scope.initiate_transfer() );
        }

        $q.all(promises)
        .then (function (result) {
            console.log("call general validation script for " + $scope.sample_count + ' samples');
            
            options.required = $scope.current_mandatory_elements;
            options.form = $scope.form;
            options.count = $scope.sample_count;
            options.db_validate = $scope.db_validate_elements;
            options.check_for_units = $scope.check_units;

            // options.element = element;
            options.trim = true;

            if (element) { $scope.visit(element) }

            console.log(JSON.stringify("validation specs: " + JSON.stringify(options)));
            $scope.validate_form(options);
            console.log('done');   

        })
        .catch ( function (err) {
            console.log('error with initiate transfer ' + err);
            $scope.validate_form({ errors: { transfer : ['problem redistributing samples']} });
        })
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

    $scope.initiate_transfer = function distribute () {

        console.log("Distribute samples...");
        console.log('reset messages before redistribution');
        // $scope.reset_messages();

        var deferred = $q.defer(); 

        var targetKey = 'transfer_type' + $scope.step.stepNumber;

        var qty = $scope.form['transfer_qty' + $scope.step.stepNumber] || $scope.Step['transfer_qty'];
        if ( $scope.form['transfer_qty' + $scope.step.stepNumber + '_split']) {
            qty = $scope.form['transfer_qty' + $scope.step.stepNumber + '_split'].split(',');
        }  
        
        var qty_units = $scope.form['transfer_qty_units' + $scope.step.stepNumber] 
            || $scope.Step['transfer_qty_units'];

        if ($scope.Step.transfer_type === 'Transfer') {
            var entered_qty = $scope.form['transfer_qty' + $scope.step.stepNumber] || $scope.form['transfer_qty' + $scope.step.stepNumber + '_split'];
            var hidden_qty = $scope.Step['transfer_qty'];

            if (entered_qty && entered_qty.constructor === String && entered_qty.match(/d*/) ) {
                // okay...
                console.log("entered qty: " + entered_qty + qty_units);
                qty = entered_qty;
                qty_units = qty_units || 'ml';
            }
            else if (hidden_qty && hidden_qty.constructor === String && hidden_qty.match(/\d+/) ) {
                console.log("hidden qty: " + hidden_qty);
                qty = hidden_qty;
            }
            else {
                qty = _.pluck($scope.active.Samples,'qty');
                qty_units = _.pluck($scope.active.Samples,'qty_units');
                console.log("transfer active sample qty: " + qty + qty_units );
            }
        }

        console.log("Transfer " + qty + qty_units);
        var Target = { 
            'Container_format' : $scope.Step.Target_format,
            'Sample_type'   : $scope.Step.Target_sample,
            'qty'           : qty,
            'qty_units'     : qty_units,
        };

        var split = $scope['Split' + $scope.step.stepNumber] || $scope.Step['split'];
        var fill =  $scope.Step['fill_by'] || $scope.map.fill_by;
        var size = $scope.Step['target_size'] || $scope.active.Samples[0].box_size;

        console.log("Custom size: " + size);
        var target_rack = '';
        var boxes = [];

        if ($scope.form['location' + $scope.step.stepNumber]) {
            target_rack = $scope.form['location' + $scope.step.stepNumber];
            console.log("use target rack: " + target_rack);
        }

        var Options = {
            'transfer_type' : $scope.Step.transfer_type,
            'reset_focus'   : $scope.Step.reset_focus,
            'split'         : $scope['Split' + $scope.step.stepNumber] || $scope.Step['split'],   // $scope['Split' + $scope.step.stepNumber],
            'pack'          : $scope.Step['pack'],    // $scope.pack_wells,
            'distribution_mode' : $scope.form['distribution_mode' + $scope.step.stepNumber],
            'fill_by'  : $scope.Step['fill_by'] || $scope.map.fill_by,
            'target_size' : size,
            'target_rack' : target_rack,
        }
        
        // certain fields need to be in map scope...
        $scope.set_map('target_size', size);
        $scope.set_map('fill_by', fill);

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
        .then ( function (result) {

            var Map = result.Map;
            if ($scope.form_initialized) {
                $scope.validation_warning('mapping', Map.warnings);
                $scope.validation_error('mapping', Map.errors);
                $scope.validation_message('mapping', Map.messages);

                var el = 'location' + $scope.step.stepNumber;
                if (Map.errors) { 
                    $scope.invalidate(el);
                    $scope.message('invalidate ' + el);
                }
                else { $scope.validate(el) }

            }
            else { console.log('form not initiated') }

            console.log("MAPPING ERRORS: " + JSON.stringify(Map.errors));
            console.log("MAPPING Warnings: " + JSON.stringify(Map.warnings));
            // $scope.validate_Samples($scope.active.Samples);

            deferred.resolve(Map);
        })
        .catch ( function (err) {
            console.log("Error calling sample redistribution");
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    $scope.showErrors = function showErrors() {
        return $scope.errMsg;
    }

    $scope.skip = function skip () {
        $scope.restart_form();
        // skip step (if allowed)
    }

    $scope.repeat = function repeat () {
        // go back one step (if allowed)

        $scope.back();
    }

    $scope.reload = function reload () {
        // $scope.reset_form();  // affects counter fields !! 
        // $scope.form = {};

        console.log("reload form at step " + $scope.step.stepNumber);

        $scope.Step = $scope.Steps[$scope.step.stepNumber-1];
        console.log(JSON.stringify($scope.Step));

        if (! $scope.Step ) { $scope.error("No Steps Defined for this Protocol !") }
        else {
            $scope.input = [];
            if ($scope.Step['input_options']) { $scope.input = $scope.Step['input_options'].split(':') }

            $scope.defaults = [];
            if ($scope.Step['input_defaults']) { $scope.defaults = $scope.Step['input_defaults'].split(':') }

            $scope.formats = [];
            if ($scope.Step['input_format']) { $scope.formats   = $scope.Step['input_format'].split(':') }

            var transfer_options = $scope.Step['transfer_settings'] || $scope.Step['custom_settings'] || '{}';  // string version of json

            console.log("\n** Load transfer_settings: " + transfer_options);
            $scope.parse_transfer_settings(transfer_options);

            if (transfer_options.transfer_type) { $scope.initiate_transfer(1) }
           
            if ($scope.backfill_date) {
                $scope.warning("Using Backfill Date: " + $scope.backfill_date);
            }
            
            var name = $scope.Step['name'];

            $scope.Show = {};
            $scope.Default = {};
            $scope.Format = {};
            $scope.comments = '';

            console.log("parse input for next step... ");
            console.log(JSON.stringify($scope.input));            
            console.log(JSON.stringify($scope.custom));

            var Attributes = { Plate : [], Prep : [] };

            $scope.current_mandatory_elements = [];
            $scope.db_validate_elements = [];
            $scope.check_units = [];

            for (var i=0; i<$scope.input.length; i++) {
                var input = $scope.input[i];
                var mandatory = input.match(/\*$/);
                var key = input.replace('*','');
                var id = key + $scope.step.stepNumber;

                var sol_input = input.match(/solution/);
                var equ_input = input.match(/equipment/);

                console.log("check input: " + JSON.stringify(input));
                var step = $scope.step.stepNumber;
                if (sol_input) {
                    $scope.db_validate_elements.push( { model: 'solution', barcode: true, element: 'solution' + step, count: $scope.sample_count})
                }

                if (equ_input) {
                    $scope.db_validate_elements.push( { model: 'equipment', barcode: true, element : 'equipment' + step, count: $scope.sample_count})
                }

                var req = {};
                req[id] = key + ' input';
                                
                if ( key.match(/\_qty$/) ) {
                    var el = key + '_units' + $scope.step.stepNumber;
                    $scope.check_units.push(el);
                }     

                if (mandatory) { 
                    $scope.current_mandatory_elements.push(req);
                    console.log('require ' + req);
                }   

                $scope.Show[key] = true;
                if ($scope.defaults.length > i) {
                    var def = $scope.defaults[i] || '';
                    if (key.match(/\_qty$/)) {
                        var units = def.match(/[a-zA-Z]+/);
                        if (units && units.length) {
                            console.log(JSON.stringify(units));

                            $scope.Default[key + '_units'] = units[0]; // units only
                            $scope.form[key + '_units' + $scope.step.stepNumber] = units[0];
                            def = def.replace(units[0],''); // strip units 
                        }
                        $scope.Default[key] = def;          // value only
                        $scope.form[id] = def;
                    }
                    else {
                        $scope.Default[key] = def;         // not qty requiring units
                        $scope.form[id] = def;
                    }
                    console.log(key + " default = " + def)
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
            console.log("validate: " + JSON.stringify($scope.db_validate_elements));
            console.log("** FORM: **" + JSON.stringify($scope.form));
            $scope.errMsg = '';

            console.log("... validate again...");
            
            $scope.validate_prep_form();
        }
    }

    $scope.parse_transfer_settings = function (transfer_options) {
        
        var Opts = {};
        if (transfer_options) {
            console.log('transfer settings: ' + transfer_options);
            Opts = JSON.parse(transfer_options)
        }

        console.log("Transfer Settings: " + JSON.stringify(transfer_options));
        console.log("Custom Options: " + JSON.stringify(Opts));

        var keys = $scope.mapping_keys;
        console.log("Keys: " + keys.join(','));

        for (var i=0; i<keys.length; i++) {
            if ( $scope.form[ keys[i] + $scope.step.stepNumber ] ) {
                $scope.Step[keys[i]] = $scope.form[ keys[i] + $scope.step.stepNumber];
                console.log("manually set custom key: " + keys[i] + ' = ' + $scope.form[ keys[i]]);
            }
            else if (Opts[keys[i]] == null) {
                console.log(keys[i] + ' = ' + Opts[keys[i]] + " .. custom not defined");
            }
            // Temporaty - check merge conflict ... include below ?...
           else if ( keys[i].match(/_qty$/) ) {
               var qty = $scope.form[ keys[i] + $scope.step.stepNumber] || Opts[keys[i]];
               
               var units = qty.match(/[a-zA-Z]+/);
               if (units && units.length) {
                   qty = qty.replace(units[0],''); 

                   console.log(JSON.stringify(qty + ' -> ' + qty + ' units: ' + units[0]) );
                   $scope.Step[keys[i]] = qty;
                   $scope.Step[keys[i] + '_units'] = units[0];
               }
           }


            else {
                $scope.Step[keys[i]] = $scope.form[ keys[i] + $scope.step.stepNumber] || Opts[keys[i]];
                console.log("Custom: " + keys[i] + ' = ' + Opts[keys[i]]);
            }

/*
            if ($scope.Step[keys[i]].constructor === String) {
                if ($scope.Step[keys[i]].match(/^\d+*$/) ) {
                    $scope.Step[keys[i]] = parseInt($scope.Step[keys[i]] );
                } else if ($scope.Step[keys[i]].match(/^\d+\.?\d*$/) ) {
                    $scope.Step[keys[i]] = parseFloat($scope.Step[keys[i]]);
                }
            }
 */
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

    $scope.normalize_units = function (field, suffix) {
        // convert quantities to same units as original to ensure ongoing calculated volumes are correct.
        // when removing or adding 250 ul to a container with 2 ml, the 250 ul should be converted to the original units (eg 0.25 ml)
        //
        // new values may be re-normalized via a cron job at a different time (eg check for volumes > 1000 or < 0.01 and convert)
        //
        // eg normalize_units('qty','reference_units') or normalize_units('solution_qty')

        // UNDER CONSTRUCTION .. 

        var values = [];
        var splitField;  // get from current split fields .. 

        if ( !suffix) { suffix = '' }
        var units_field = field + '_units' + suffix;
        var field = field + suffix;

        var N = $scope.active.Samples.length;

        if ($scope.form[field] && $scope.form[units_field]) {

            console.log(N + ' samples...');
            for (var i=0; i<N; i++) {                      
                var orig_units = $scope.active.Samples[i].qty_units;
                var new_units = $scope.form[units_field];

                var newVal = $scope.form[field];
                if ($scope.SplitFields[field]) {
                    newVal = $scope.SplitFields[field][i];
                }

                console.log("convert " + new_units + " to " + orig_units);
                console.log(newVal.constructor);
                var conflict = 0;
                if (new_units === orig_units) { }
                else {
                    if ($scope.stdForm.units[orig_units] && $scope.stdForm.units[new_units]) {
                        var factor =  $scope.stdForm.units[new_units] / $scope.stdForm.units[orig_units];
                        newVal = newVal * factor;
                        console.log(newVal + ' x ' + factor + ' -> ' + newVal);
                        console.log(newVal.constructor);
                    }
                    else {
                        $scope.error(new_units + " Units not yet defined - cannot auto convert");
                    }
                    //newVal = $scope.convert(val, new_units, old_units);
                    conflict++;
                }
                values.push(newVal);
            }

            console.log(JSON.stringify(values));

            if (conflict && $scope.SplitFields[field]) {
                $scope.SplitFields[field] = values;
                $scope.split[field] = values.join(',');
                $scope.form[units_field] = orig_units;
                console.log("Reset " + $scope.split[field] + ' to ' + values.join(',') + orig_units);
            }
            else {
                $scope.form[field] = values[0];
                $scope.form[units_field] = orig_units;
                console.log("Reset " + field + ' to ' + values[0] + orig_units);
            }
        }
    }    

}]);
