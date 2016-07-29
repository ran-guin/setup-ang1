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

	    $scope.mapping_keys = ['split', 'pack', 'fill_by', 'Target_format', 'Target_sample', 'transfer_type', 'reset_focus'];
		for (var i=0; i<$scope.mapping_keys.length; i++) {
			console.log($scope.mapping_keys[i] + ' = ' + $scope.map[ $scope.mapping_keys[i] ]);
		}    
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

    $scope.loadWells = function (Transfer, Options) {
        // get available wells 
        var deferred = $q.defer();

        if (! Options) { Options = {} }
        var rack_id = Options.target_rack;
        var size    = Options.target_size;
        var fill_by = Options.fill_by;

        var rack_name;
        if (! rack_id && size ) {
            rack_name = 'B' + size;   // default target box to benchtop rack  ... (standard Box: 'B9x9' and/or 'B8x12' )
        }

        console.log("Load rack " + rack_id + ' ' + rack_name);
        var data = { id: rack_id, name: rack_name, fill_by: fill_by};

        console.log("SEND: " + JSON.stringify(data));

        if (rack_id || rack_name) {

            var available = {};  // eg { '<box_id>' : [{ id : <slot_id>, position : <pos> } ]} ... ordered based on 'fill_by'
            var target_boxes = [];
            var target_rack = '';

            console.log("retrieve rack data : " + JSON.stringify(data));
            $http.post("/Rack/boxData", data)
            .then (function (returnData) {
                console.log("rack data: " + JSON.stringify(returnData));

                available = returnData.data.available || {};
                console.log("Available: " + JSON.stringify(available));
                // define target boxes (only handles one for now ... )
               

                target_boxes = Object.keys(available);
                console.log("target boxes: " + target_boxes.join(','));
                var firstBox = target_boxes[0] || '';

                if (available && available[firstBox] && available[firstBox].length) { 
                    $scope.message(available[firstBox].length + ' wells available in ' + returnData.data.name);
                    target_rack = returnData.data.id;
                }
                else if (returnData.data.name) { 
                    $scope.warning("no wells available in " + returnData.data.name )
                    target_boxes = [];
                } 
                else if (! returnData.data.id) {
                    $scope.error("Invalid Box specified : " + target_rack + " ? ");
                }

                var N_boxes = target_boxes.length;

                if (! target_boxes.length) {
                    $scope.error("No valid target boxes");
                    target_rack = '';
                    target_boxes = [];
                }

                var boxes = [];
                for (var i=0; i<target_boxes.length; i++) {    
                    if (target_boxes[i] && ! available[target_boxes[i]] || !available[target_boxes[i]].length) { 
                        $scope.error("No target wells available in Box" + target_boxes[i]);
                        target_rack = '';
                    }
                    else {
                        boxes.push(target_boxes[i]);
                    }
                }
                target_boxes = boxes;   // clear boxes with no available wells .... 

                console.log("Target rack: " + target_rack + '; from ' + JSON.stringify(target_boxes));

                var boxData = {available: available, target_boxes: target_boxes };

                $scope.map.target_boxes = target_boxes;
                $scope.map.available    = available;

                if (target_rack && target_boxes.length) {
                    N_boxes = target_boxes.length; // test
                    deferred.resolve( boxData );
                }
                else if (size) {
                    // prompt user for target box 
                    console.log("choose size: " + size);
                    $http.get('/Rack/wells?size=' + size + '&fill_by=' + fill_by)
                    .then ( function (wells) {
                        console.log("loaded wells: " + JSON.stringify(wells));
                        
                        boxData.available = wells.data;

                        N_boxes = Math.ceil(N * splitX / wells.data.length);
                        console.log("GOT : " + JSON.stringify(boxData)); 
                        deferred.resolve( boxData );
                    })
                    .catch ( function (wells) {
                        console.log("Error retrieving available wells");
                        deferred.reject();
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

        return deferred.promise;
    }

    $scope.redistribute_Samples = function  (Samples, Transfer, Options) {

        var deferred = $q.defer();

        $scope.reset_messages();

        console.log("Fill by " + $scope.map.fill_by);
        
        if ($scope.map.fill_by.match(/row/i)) { 
            $scope.source_by_Row(Samples);
            // $scope.map.split_mode = 'serial';
        }
        else if ($scope.map.fill_by.match(/col/i) ) { 
            $scope.source_by_Col(Samples);
            // $scope.map.split_mode = 'serial';
        }
        else if ($scope.map.fill_by.match(/pos/i)) {
            $scope.source_by_Slot(Samples);
            // $scope.map.split_mode = 'parallel';
        }

        $scope.reset_split_mode();
        $scope.reset_pack_mode();

        console.log("Transfer: " + JSON.stringify(Transfer));
        console.log("Options: " + JSON.stringify(Options));
    
        $scope.map.Options = Options;
        $scope.map.Transfer = Transfer;

        console.log("Target Samples: " + $scope.N * $scope.map.splitX);
        console.log("Target Boxes: " + $scope.map.target_boxes);

        var newMap;

        $scope.loadWells(Transfer, Options)
        .then (function (Loaded) {
            console.log("loaded wells ok...");

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

            if (! Transfer) {
                Transfer = {
                    qty: $scope.transfer_qty,
                    qty_units : $scope.transfer_qty_units,
                    Container_format : $scope.target_format,
                    Sample_type : $scope.sample_type_id,
                };
            }

            Options['target_boxes'] = Loaded.target_boxes;
            Options['available'] = Loaded.available;  // reset in loadWells...

            /*
            if (Options) {
                Options['target_boxes'] = Loaded.target_boxes;
                Options['available'] = Loaded.available;  // reset in loadWells...

                distribute_Options = Options;
            }
            else {

                Options = {
                    fill_by : $scope.map.fill_by, 
                    pack : $scope.map.pack,
                    pack_wells : $scope.map.pack_wells,
                    split : $scope.map.splitX,
                    split_mode : $scope.map.split_mode,
                    target_size : $scope.target_size,
                    target_boxes : $scope.target_boxes,
                    available : $scope.available,
                    transfer_type : $scope.transfer_type,
                };
            }
*/

            console.log('call distribute using:');
            console.log('Transfer: ' + JSON.stringify(Transfer) );
            console.log('Options: ' + JSON.stringify(Options) );

            // recalculate mapping //
            Map = newMap.distribute(
                Samples, 
                Transfer,
                Options
            );
            
            console.log("Samples: " + JSON.stringify(Samples));
            console.log("NEW MAP: " + JSON.stringify(Map));
 
            console.log("NEW CMAP: " + JSON.stringify(Map.CMap));
            console.log("Source Colour Map: " + JSON.stringify(Map.SourceMap));
            console.log("Target Colour Map: " + JSON.stringify(Map.TransferMap));           

            $scope.Map = Map;
            deferred.resolve( { Map : Map, Transfer: Transfer, Options: Options} );
        })
        .catch ( function (err) {
            console.log("Error loading wells: " + err);
            deferred.reject(err);
        });

        return deferred.promise;

    }

    // Reset Triggers ... 

    $scope.set_defaults = function (Config) {
        if (!Config) { Config = $scope.map.config }

        $scope.map.fill_by = Config['fill_by'] || 'row';
        $scope.map.splitX   = Config['Split'] || 1;
        $scope.map.pack_wells   = Config['pack'] || 0;            // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.map.split_mode    = Config['mode'] || 'parallel';  // serial or parallel...appliable only for split (eg A1, A1, A2, A2... or A1, A2... A1, A2...)
        $scope.map.transfer_type = Config['transfer_type'] || 'Transfer';
        $scope.map.transfer_qty = Config['transfer_qty'] || '';
        $scope.map.transfer_qty_units = Config['transfer_qty_units'] || 'ml';
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

        $scope.map.fill_by = 'row';

        if (! sortBy) { sortBy = 'position' }

        $scope.map.fillExample = $scope.map.fillExamples[$scope.map.fill_by];
        
        $scope.map.pack_wells = $scope.map.pack_wells || 1;
        $scope.map.pack = $scope.map.pack_wells || 1;
        
        var SampleList = Samples;
        if (! $scope.ordered) {
            SampleList = _.sortByNat(Samples, function(sample) { 

                if (!sample[sortBy]) { sample[sortBy] = 'A1'}

                var batch = sample.batch || 0;
                var string = batch.toString() + '_' + sample[sortBy];
                return string;
            });
            console.log("reorder by Row: " + JSON.stringify(_.pluck(Samples, sortBy)) );
        }
        return SampleList;
    }

    // Fill for Samples only ... may not be necessary ... 
    $scope.source_by_Col = function source_by_Col (Samples) {
;
        $scope.map.fill_by = 'column';
        var sortBy = 'position';

        //$scope.Samples = _.sortByNat($scope.Samples, 'position');

        $scope.map.fillExample = $scope.map.fillExamples[$scope.map.fill_by];
        
        $scope.map.pack_wells = $scope.map.pack_wells || 1;
        $scope.map.pack = $scope.map.pack_wells || 1;
        
        var SampleList = Samples;
        if (! $scope.ordered) {
            SampleList = _.sortByNat(Samples, function(sample) {
                var batch = sample.batch || 0; 
                var string = batch.toString() + '_' + sample.position.substring(1,3) + '_' + sample.position.substring(0,1);
                return string;
            });
            console.log("reorder by Col: " + JSON.stringify(_.pluck(Samples, 'position')) );
        }

        return SampleList;
    }


    $scope.source_by_Slot = function source_by_Slot (Samples) {
		var sortBy = 'position';

        $scope.map.fill_by = 'position';
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

        $scope.messages.push("Original Volumes Detected: Minimum: " + min + '; Maximum: ' + max );

        if (volumes.length && min > 1.0 ) {
            $scope.map.splitX = 5;
            $scope.map.transfer_qty = "<min:200>,<min:200>,<min:500>,<min:500>,<max:100>";
            $scope.map.transfer_qty_units = 'ul';
        }
        else {
            $scope.map.splitX = 4;
            $scope.map.transfer_qty = "<min:200>,<min:200>,<min:500>,<max:100>";
            $scope.map.transfer_qty_units = 'ul';
        }

        $scope.map.pack_wells = 8;
        $scope.map.fill_by = 'column';
        $scope.map.split_mode = 'serial';

        $scope.messages.push("Using Custom Data Matrix Sample Distribution Settings " + version);
    }

}]);
