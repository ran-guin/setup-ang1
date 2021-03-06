'use strict';

var app = angular.module('myApp');

app.controller('WellMapperController', 
['$scope', '$rootScope', '$http', '$q' , 
function wellMapperController ($scope, $rootScope, $http, $q ) {
 
  	$scope.map = {};

    $scope.initialize_mapper = function (config, options) {
    	$scope.set_defaults(config);
        
        $scope.static_presets();
        $scope.map.config = config;

        // initialize variables to track available wells if applicable in target boxes.
        $scope.map.target_boxes = [];
        $scope.map.available = {};

        if (config['target_size']) { $scope.map.target_size = config['target_size'] }
        else if (config['Samples'] && config['Samples'].length && config['Samples'][0].box_size) {
            console.log("set target default size to size of first sample container");
            $scope.map.target_size = config['Samples'][0].box_size;
        }
        else {
            console.log("No default target size could be determined");
        }
 
        $scope.map.packExample = $scope.map.packExamples[$scope.map.pack_mode + '-' + $scope.map.split_mode + '-' + $scope.map.fill_by] || '';

	    $scope.mapping_keys = ['split', 'pack', 'load_by', 'fill_by', 'Target_format', 'Target_sample', 'transfer_type', 'reset_focus', 'target_size', 'transfer_qty', 'transfer_qty_units'];
		for (var i=0; i<$scope.mapping_keys.length; i++) {
			console.log($scope.mapping_keys[i] + ' = ' + $scope.map[ $scope.mapping_keys[i] ]);
		}    
    }

    $scope.set_map = function (attr, value) {
        $scope.map[attr] = value;
    }
    
    $scope.static_presets = function () {
        $scope.map.splitExamples = { 
            'serial-row' : "eg A1, A1, A2, A2, B1, B1, B2, B2",
            'serial-column' : "eg A1, A1, B1, B1, A2, A2, B2, B2",
            'serial-position' : "grouping and serial/parallel modes n/a",
            'parallel-row' : "eg A1, A2, B1, B2, A1, A2, B1, B2",
            'parallel-column' : "eg A1, B1, A2, B2, A1, A2, B1, B2",
            'parallel-position' : "grouping and seria/parallel modes n/a",
        };

        $scope.map.splitExample = $scope.map.splitExamples[$scope.map.split_mode + '-' + $scope.map.fill_by];

        $scope.map.loadExamples = {
            'row'  : "wells loaded by row : eg A1, A2, A3 ...", 
            'column' : "wells loaded by column : eg A1, B1, C1 ...",
            'slot' : "samples copied into same slot they came from (order unimportant)",
        };                     
        $scope.map.loadExample = $scope.map.loadExamples[$scope.map.load_by];
        
        $scope.map.fillExamples = {
            'row'  : "wells filled by row : eg A1, A2, A3 ...", 
            'column' : "wells filled by column : eg A1, B1, C1 ...",
            'position' : "samples copied into same slot they came from",
        };             
        $scope.map.fillExample = $scope.map.fillExamples[$scope.map.fill_by];

        $scope.map.packExamples = {
            'batch-serial-row'  : "eg [N=2] A1,A2, A1,A2, A3,A4, A3,A4", 
            'batch-parallel-row'  : "grouping not applicable in parallel mode", 
            'batch-serial-column'  : "eg [N=2] A1,B1, A1,B1 ... C1,D1, C1, D1", 
            'batch-parallel-column'  : "grouping not applicable in parallel mode", 
        };           
    }

    $scope.validate_redistribution_form = function validated_form( options ) {
        
        var deferred = $q.defer();

        if (!options) { options = {} }

        if ($scope.map.transfer_type === 'Move') {
            if ( $scope.map.splitX > 1) {
                $scope.map.splitX = 1;
                $scope.redistribute('reset');
                console.log("reset split to 1... ");
            }
            $scope.mandatory_list = [];
        }
        else {
            $scope.mandatory_list = ['target_format', 'transfer_qty'];
        }

        // if (!$scope.map.target_format) { $scope.validation_error('target_format','Still require format info'); }
        // else {  $scope.validation_error('target_format', []);  }

        var qs = $scope.map.transfer_qty.split(',');
        if (qs.length > 1 && $scope.map.splitX > 1) {
            if (qs.length !== $scope.map.splitX) {
                $scope.error("multiple transfer volumes (" + qs.length + ") must match split count: " + $scope.map.splitX);
            }
        }

        console.log("Validate " + $scope.map.transfer_type);
        // if (! $scope.map.transfer_qty && $scope.map.transfer_type==='Aliquot') { 

        //     $scope.annotate_element('transfer_qty','missing qty for aliquot', 'error');
        // }
 
        // else {
        //     $scope.clear_validations('transfer_qty','error');
        // }


        options.form = $scope.map;
        options.required = $scope.mandatory_list;

        $scope.validate_form( options )
        .then ( function (result) {
            deferred.resolve(result);
        })
        .catch ( function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    $scope.validate_target = function (target_element) {
        console.log("Validate target boxes: " + $scope.map.target_rack);
        
        if (!target_element) { target_element = 'target_rack'}

        $scope.visit(target_element);
    }

    $scope.loadWells = function (Target, Options) {
        // get available wells
        var deferred = $q.defer();

        if (! Options) { Options = {} }

        var rack_id = Options.target_rack;
        var size    = Options.target_size ||  $scope.map.target_size;
        var fill_by = Options.fill_by || $scope.map.fill_by;
        var load_by = Options.load_by || $scope.map.load_by;

        var rows    = Options.load_rows || $scope.map.use_rows;
        var cols    = Options.load_columns || $scope.map.use_cols;

        var target_element = Options.target_element || 'target_rack';

        if (! rack_id && Options.target_boxes && Options.target_boxes.length) { 
            rack_id = Options.target_boxes;
        }

        var rack_name;
        if (! rack_id && size ) {
            rack_name = 'B' + size;   // default target box to benchtop rack  ... (standard Box: 'B9x9' and/or 'B8x12' )
            $scope.warning("Note:  Default benchtop rack: " + rack_name);
        }

        console.log("Load rack " + rack_id + ' ' + rack_name);
        var data = { id: rack_id, name: rack_name, load_by: load_by, fill_by: fill_by, rows: rows, columns: cols};
        
        console.log("SEND: " + JSON.stringify(data));

        if (rack_id || rack_name) {

            var available = {};  // eg { '<box_id>' : [{ id : <slot_id>, position : <pos> } ]} ... ordered based on 'fill_by'
            var target_boxes = [];
            var target_rack = '';


            // Temporary - combine error checking in block below into api return val including warnings & errors ... 
            console.log("retrieve rack data : " + JSON.stringify(data));
            $http.post("/Rack/boxData", data)
            .then (function (returnData) {
                // console.log("rack data: " + JSON.stringify(returnData));

                var rack_messages = [];
                var rack_warnings = [];
                var rack_errors   = [];

                available = returnData.data.available || {};
                target_boxes     = returnData.data.boxes || [];
                // console.log("Available: " + JSON.stringify(available));               
                console.log("target boxes: " + target_boxes.join(','));
                if (Options.target_boxes && target_boxes.length < Options.target_boxes.length) {
                    // $scope.error("At least one of the scanned boxes is either full or not a box");
                    rack_errors.push("Invalid target box scanned (may include full boxes)");
                    // $scope.validation_error(target_element,"Invalid target box scanned (may include full boxes)");

                    console.log("Target boxes ? " + Options.target_boxes);
                }

                var rack_list = [];
                for (var i=0; i<target_boxes.length; i++) {
                    var thisBox = target_boxes[i] || '';

                    if (available && available[thisBox] && available[thisBox].length) { 
                        // $scope.message(available[thisBox].length + ' wells available in Box #' + thisBox);
                        // $scope.message(available[thisBox].length + ' wells available in Box #' + thisBox);
                        // $scope.validation_message(target_element, available[thisBox].length + ' wells are still available in Box #' + thisBox);                        
                        rack_messages.push(available[thisBox].length + ' well(s) still available in Box #' + thisBox + ' [' + returnData.data.alias + ']');

                        rack_list.push(thisBox); // returnData.data.id;
                    }
                    else if (returnData.data.name) {
                        // $scope.validation_warning(target_element,"no wells available in " + returnData.data.name + ' [' + returnData.data.alias + ']');

                        rack_warnings.push("no wells available in " + returnData.data.name + ' [' + returnData.data.alias + ']');
                        // $scope.warning("no wells available in " + returnData.data.name )
                        target_boxes = [];
                    } 
                    else if (! returnData.data.id) {
                        // $scope.error("Invalid Box specified : " + target_rack + " ? ");
                        // $scope.validation_error(target_element,"Invalid Box specified : " + target_rack + " ? ");
                        rack_errors.push("Invalid Box specified : " + target_rack + " ? ");
                    }

                }

                target_rack = rack_list.join(',');
                var N_boxes = target_boxes.length;

                if (! target_boxes.length) {
                    // if ($scope.form_initialized) { $scope.validation_error(target_element,'no valid target boxes') }
                    target_rack = '';
                    target_boxes = [];
                }

                var boxes = [];
                for (var i=0; i<target_boxes.length; i++) {    
                    if (target_boxes[i] && ! available[target_boxes[i]] || !available[target_boxes[i]].length) { 
                        // $scope.validation_error(target_element,"No target wells available in Box" + target_boxes[i]);
                        rack_errors.push("No target wells available in Box" + target_boxes[i])
                        target_rack = '';
                    }
                    else {
                        boxes.push(target_boxes[i]);
                    }
                }

                // $scope.annotate_element(target_element, rack_errors, 'error');
                // $scope.annotate_element(target_element, rack_warnings,'warning');
                // $scope.annotate_element(target_element, rack_messages);

                // if (rack_errors.length) { $scope.invalidate(target_element) }
                // else { $scope.validate(target_element) }

                target_boxes = boxes;   // clear boxes with no available wells .... 

                console.log("Target rack: " + target_rack + '; from ' + JSON.stringify(target_boxes));

                var boxData = {available: available, target_boxes: target_boxes, errors: rack_errors, warnings: rack_warnings, messages: rack_messages};

                $scope.map.target_boxes = target_boxes;
                $scope.map.available    = available;

                if (target_rack && target_boxes.length) {
                    N_boxes = target_boxes.length; // test
                    deferred.resolve( boxData );
                }
                else if (size) {
                    // prompt user for target box 
                    console.log("choose size: " + size);
                    $http.get('/Rack/wells?size=' + size + '&fill_by=' + fill_by + '&load_by=' + load_by)
                    .then ( function (wells) {
                        // console.log("loaded wells: " + JSON.stringify(wells));
                        
                        boxData.available = wells.data;

                        N_boxes = Math.ceil($scope.active.N * $scope.map.splitX / wells.data.length);
                        console.log("GOT : " + JSON.stringify(boxData)); 
                        deferred.resolve( boxData );
                    })
                    .catch ( function (err) {
                        console.log("Error retrieving available wells");
                        deferred.reject(err);
                    });
                }
                else {
                    console.log("no rack or size");
                    deferred.resolve();
                }                   
            })
            .catch (function (err) {
                console.log("Error loading Rack info: " + JSON.stringify(err) );
                deferred.reject(err);
            });
        }  
        else { deferred.resolve() }

        return deferred.promise;
    }

    $scope.redistribute_Samples = function  (Samples, Target, Options) {
        
        var deferred = $q.defer();

        if (!Options) { Options = {} }
        var target_element = Options.target_element || 'target_rack';

        $scope.reset_messages('redistribute samples');
        $scope.clear_validations(target_element);
        $scope.reset_form_validation();

        // $scope.validation_warning(target_element,[]);
        // $scope.validation_message(target_element,[]);

        $scope.targetMapStatus = 'Pending';
        $scope.sourceMapStatus = 'Pending';

        console.log("Load by " + $scope.map.load_by);

        if ($scope.map.fill_by.match(/pos/i)) {
            $scope.fill_by_Slot(Samples);
            // $scope.map.split_mode = 'parallel';
        }
        else {
            // load_by is only relevant if NOT filling by position ..
            if ($scope.map.load_by.match(/row/i)) { 
                $scope.source_by_Row(Samples);
                // $scope.map.split_mode = 'serial';
            }
            else if ($scope.map.load_by.match(/col/i) ) { 
                $scope.source_by_Col(Samples);
                // $scope.map.split_mode = 'serial';
            }
            else if ($scope.map.load_by.match(/scan/i) ) { 
                $scope.reset_Samples();
                // $scope.map.split_mode = 'serial';
            }
        }

        console.log("Fill by " + $scope.map.fill_by);

        $scope.reset_split_mode();
        $scope.reset_pack_mode();

        console.log("Target: " + JSON.stringify(Target));
        console.log("Options: " + JSON.stringify(Options));
    
        $scope.map.Options = Options;
        $scope.map.Target = Target;

        console.log("Target Samples: " + $scope.active.N * $scope.map.splitX);
        console.log("Target Boxes: " + $scope.map.Options.target_boxes);

        var newMap;

        $scope.loadWells(Target, Options)
        .then (function (Loaded) {
            console.log("loaded wells ok...");
            Samples = $scope.active.Samples;

            if (! newMap) {
                // initiate mapping //
                console.log('new map..');
                newMap = new wellMapper();

                newMap.colourMap(Samples.length);
                newMap.from(Samples);            
     
                console.log("rgb: " + JSON.stringify(newMap.rgbList));
                console.log("colours: " + JSON.stringify(newMap.colours));
                console.log("colour MAP: " + JSON.stringify(newMap.colourMap));
            }  

            if (! Target) {
                Target = {
                    qty: $scope.map.transfer_qty,
                    qty_units : $scope.map.transfer_qty_units,
                    Container_format : $scope.map.target_format,
                    Sample_type : $scope.map.sample_type,
                };
            }

            if (Loaded) {
                $scope.annotate_element(target_element, Loaded.errors, 'error');    
                $scope.annotate_element(target_element, Loaded.warnings, 'warning');
                $scope.validation_message(target_element, Loaded.messages);

                if (Loaded.errors.length) { $scope.invalidate(target_element) }
                else if (Loaded.warnings.length) { $scope.validate_element(target_element, 'pending') }
                else { $scope.validate(target_element) }


                Options['target_boxes'] = Loaded.target_boxes;
                Options['available'] = Loaded.available;  // reset in loadWells...
            }

            console.log('call distribute using:');
            console.log('Target: ' + JSON.stringify(Target) );
            console.log('Options: ' + JSON.stringify(Options) );

            // recalculate mapping //
            Map = newMap.distribute(
                Samples, 
                Target,
                Options
            );

  
            $scope.annotate_element(target_element, Map.errors, 'error');    
            $scope.annotate_element(target_element, Map.warnings, 'warning');
            $scope.annotate_element(target_element, Map.messages);
            console.log(target_element + ' errors Loaded: ' + JSON.stringify($scope.validation_errors));
            
            var wells = Map.wells || {};   

            $scope.validate_redistribution_form();

            $scope.Map = Map;

            $scope.targetMapStatus = 'Complete';
            $scope.sourceMapStatus = 'Complete';

            deferred.resolve( { Map : Map, Target: Target, Options: Options, errors: Map.errors} );
        })
        .catch ( function (err) {
            console.log("Error loading wells: " + err);
            $scope.validate_redistribution_form();
            deferred.reject(err);
        });

        return deferred.promise;

    }

    // Reset Triggers ... 

    $scope.set_defaults = function (Config) {
        if (!Config) { Config = $scope.map.config }

        $scope.map.fill_by = Config['fill_by'] || 'row';
        $scope.map.load_by = Config['load_by'] || 'row';
        $scope.map.splitX   = Config['Split'] || 1;
        $scope.map.pack_wells   = Config['pack'] || 0;            // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.map.pack_size   = Config['pack_size'] || 8;            // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.map.split_mode    = Config['mode'] || 'parallel';  // serial or parallel...appliable only for split (eg A1, A1, A2, A2... or A1, A2... A1, A2...)
        $scope.map.transfer_type = Config['transfer_type'] || 'Transfer';
        $scope.map.transfer_qty = Config['transfer_qty'] || '';
        $scope.map.transfer_qty_units = Config['transfer_qty_units'] || 'ml';
    
        // select max possible rows / columns for applicability ... 
        $scope.map.use_rows = ['A','B','C','D','E', 'F', 'G', 'H', 'I'];
        $scope.map.use_cols = [1,2,3,4,5,6,7,8,9,10,11,12];
    }

    $scope.reset_pack_mode = function reset_pack_mode () {
        if ($scope['pack_wells'] > 1 ) {
            $scope.map.pack_mode = 'batch';
        }
        else if ($scope['pack_wells']) {
            $scope.map.pack_mode = 'packed';
        }
        else {
            $scope.map.pack_mode = 'slot position retained';
        }

        console.log($scope['pack_wells'] + " : set example to " + $scope.map.pack_mode );
        console.log(JSON.stringify($scope.map.packExamples));
        
        $scope.map.packExample = $scope.map.packExamples[$scope.map.pack_mode + '-' + $scope.map.split_mode + '-' + $scope.map.fill_by] || '';

    }

    $scope.reset_split_mode = function reset_split_mode () {
        if ($scope.map.split_mode == 'parallel') {
            $scope.map.splitExample = $scope.map.splitExamples[$scope.map.split_mode + '-' + $scope.map.fill_by];
        }
        else if ($scope.map.split_mode == 'serial') {
            $scope.map.splitExample = $scope.map.splitExamples[$scope.map.split_mode + '-' + $scope.map.fill_by];            
        }
        else { console.log(" Unidentified split mode: " + $scope.map.split_mode) }

        console.log($scope['split_mode'] + ' : reset split example to ' + $scope.map.splitExample);
    }

    $scope.source_by_Row = function source_by_Row (Samples, sortBy) {
    	// Samples should be hash containing keys for"
    	//   - position
    	//   - batch
    	//
        console.log("Row -> Load / Fill = " + $scope.map.load_by + ' / ' + $scope.map.fill_by);

        $scope.map.load_by = 'row';
        $scope.map.fill_by = $scope.map.fill_by || $scope.map.load_by;

        if (! sortBy) { sortBy = 'position' }

        $scope.map.fillExample = $scope.map.fillExamples[$scope.map.fill_by];
        
        $scope.map.pack_wells = $scope.map.pack_wells || 1;
        $scope.map.pack = $scope.map.pack_wells || 1;
        
        var SampleList = Samples;
        if (! $scope.ordered) {
            SampleList = _.sortByNat(Samples, function(sample) { 

                if (!sample['position']) { sample[sortBy] = 'A1'}

                var batch = sample.batch || 0;
                var string = batch.toString() + '_' + sample[sortBy];
                return string;
            });
            console.log("reorder by Row: " + JSON.stringify(_.pluck(SampleList, sortBy)) );
        }
        $scope.load_active_Samples(SampleList);
        return SampleList;
    }

    // Fill for Samples only ... may not be necessary ... 
    $scope.source_by_Col = function source_by_Col (Samples) {
 
        console.log("Col -> Load / Fill = " + $scope.map.load_by + ' / ' + $scope.map.fill_by);

        $scope.map.load_by = 'column';
        $scope.map.fill_by = $scope.map.fill_by || $scope.map.load_by;

        //$scope.Samples = _.sortByNat($scope.Samples, 'position');

        $scope.map.fillExample = $scope.map.fillExamples[$scope.map.fill_by];
        
        $scope.map.pack_wells = $scope.map.pack_wells || 1;
        $scope.map.pack = $scope.map.pack_wells || 1;
        
        var SampleList = Samples;
        if (! $scope.ordered) {
            SampleList = _.sortByNat(Samples, function(sample) {
                var batch = sample.batch || 0; 
                var string = batch.toString() + '_' + sample['position'].substring(1,3) + '_' + sample.position.substring(0,1);
                return string;
            });
            console.log("reorder by Col: " + JSON.stringify(_.pluck(SampleList, 'position')) );
        }
        $scope.load_active_Samples(SampleList);
        return SampleList;
    }


    $scope.fill_by_Slot = function fill_by_Slot (Samples) {
        $scope.map.load_by = 'position';
        $scope.map.fill_by = $scope.map.fill_by || $scope.map.load_by;

        $scope.map.split_mode = 'parallel';

        $scope.map.pack = 0;
        $scope.map.pack_wells = $scope.map.pack_wells || 1;

        $scope.map.fillExample = $scope.map.fillExamples[$scope.map.fill_by];

        return Samples;
    }

    // Custom sample distribution settings //

    $scope.custom_distribution = function use_custom_settings(version) {

        var volumes = _.pluck($scope.active.Samples, 'qty');
        var version = '[mid qty version]';

        var min = _.min(volumes);
        var max = _.max(volumes);

        $scope.message("Original Volumes Detected Between " + min + ' and ' + max );

        if (volumes.length && max > 1.0 ) {
            $scope.map.splitX = 5;
            $scope.map.transfer_qty = ">200,>200,>500,>500,<500";
            $scope.map.transfer_qty_units = 'ul';
        }
        else {
            $scope.map.splitX = 4;
            $scope.map.transfer_qty = ">200,>200,>500,<500";
            $scope.map.transfer_qty_units = 'ul';
        }

        $scope.map.pack_wells = 8;
        $scope.map.load_by = 'row';
        $scope.map.fill_by = 'column';
        $scope.map.split_mode = 'serial';

        $scope.message("Using Custom Data Matrix Sample Distribution Settings " + version);
    }

}]);
