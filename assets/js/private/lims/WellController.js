'use strict';

var app = angular.module('myApp');

app.controller('WellController', 
['$scope', '$rootScope', '$http', '$q' , 
function wellController ($scope, $rootScope, $http, $q ) {

    $scope.context = 'Wells';

    var map = {};
    
    $scope.map = {};
    $scope.Samples = [];

    $scope.initialize = function initialize(Config, options) {
        console.log("initialize Well Controller");
        // console.log("CONFIG: " + JSON.stringify(Config));
        
        $scope.Config = Config;

        $scope.Samples = Config['Samples'] || [];
        $scope.plate_ids = Config['plate_ids'];
        // console.log("Samples: " + $scope.Samples);
        console.log("source 1: " + $scope.Samples[0]);

        $scope.targets = [];
        $scope.source_init = $scope.Samples;
        $scope.target  = Config['Target'] || {};
        $scope.options = Config['Options'];
        $scope.sizes   = Config['sizes'];

        //$scope.source_size = Config['size'] || $scope.sizes[0];
        if (Config['target_size']) {
            // Transfer UI 
            $scope.target_size    = Config['target_size'] || $scope.sizes[0];
        }
        
        $scope.map = Config['map'] || {}; 
        $scope.target_rows = $scope.target.rows || ['A'];
        $scope.target_cols = $scope.target.cols || [1];

        $scope.Max_Row = $scope.Max_Row || 'A';
        $scope.Max_Col = $scope.Max_Col || 1;

        $scope.set_to_default();
     
        $scope.splitExamples = { 
            'serial-row' : "eg A1, A1, A2, A2, B1, B1, B2, B2",
            'serial-column' : "eg A1, A1, B1, B1, A2, A2, B2, B2",
            'serial-position' : "grouping and serial/parallel modes n/a",
            'parallel-row' : "eg A1, A2, B1, B2, A1, A2, B1, B2",
            'parallel-column' : "eg A1, B1, A2, B2, A1, A2, B1, B2",
            'parallel-position' : "grouping and seria/parallel modes n/a",
        };             
        $scope.splitExample = $scope.splitExamples[$scope.split_mode + '-' + $scope.fill_by];
 
        $scope.fillExamples = {
            'row'  : "wells filled by row : eg A1, A2, A3 ...", 
            'column' : "wells filled by column : eg A1, B1, C1 ...",
            'position' : "samples copied into same slot they came from",
        };             
        $scope.fillExample = $scope.fillExamples[$scope.fill_by];

        $scope.packExamples = {
            'batch-serial-row'  : "eg [N=2] A1,A2, A1,A2, A3,A4, A3,A4", 
            'batch-parallel-row'  : "grouping not applicable in parallel mode", 
            'batch-serial-column'  : "eg [N=2] A1,B1, A1,B1 ... C1,D1, C1, D1", 
            'batch-parallel-column'  : "grouping not applicable in parallel mode", 
        };             
        $scope.packExample = $scope.packExamples[$scope.pack_mode + '-' + $scope.split_mode + '-' + $scope.fill_by] || '';

        // initialize variables to track available wells if applicable in target boxes.
        $scope.target_boxes = [];
        $scope.available = {};

        console.log("SIZES: " + JSON.stringify($scope.sizes));

        console.log("INIT Map");
        $scope.form_validated = false;

        $scope.transfer_qty_units = 'ml';

        if (options && options.distribute) {
            $scope.redistribute();
        }
    }

    $scope.validate_Form = function validated_form() {
        
        if (! $scope.transfer_qty && $scope.transfer_type==='Aliquot') { 
            $scope.transfer_qty_errors = true;
            console.log("missing qty for aliquot");
            var testElement = document.getElementById('transfer_qty') || {} ;
            testElement.style = "border-color: red";

        }
        else { 
            $scope.transfer_qty_errors = false;
            var testElement = document.getElementById('transfer_qty') || {};
            testElement.style = "border-color: green";
        }

        if ( $scope.transfer_qty_units) { 
            $scope.units_errors = false;
            var testElement = document.getElementById('transfer_qty_units') || {};
            testElement.style = "border-color: green";
        }
        else if ($scope.transfer_type === 'Aliquot') { 
            $scope.units_errors = true;
            console.log("missing qty units for aliquot");
            var testElement = document.getElementById("transfer_qty_units") || {};
            testElement.style = "border-color: red";
        }
        else {
            $scope.units_errors = false;
            testElement = document.getElementById("transfer_qty_units") || {};
            testElement.style = "border-color: green";            
        }


        if ($scope.transfer_qty_errors || $scope.units_errors) {
            console.log("failed validation");
            $scope.form_validated = false ;
        }
        else {
            console.log("passed validation"); 
            $scope.form_validated = true;
        }

    }

    $scope.reset_pack_mode = function reset_pack_mode () {
        if ($scope['pack_wells'] > 1 ) {
            $scope.pack_mode = 'batch';
        }
        else if ($scope['pack_wells']) {
            $scope.pack_mode = 'packed';
        }
        else {
            $scope.pack_mode = 'slot position retained';
        }

        console.log($scope['pack_wells'] + " : set example to " + $scope.pack_mode );
        console.log(JSON.stringify($scope.packExamples));
        
        $scope.packExample = $scope.packExamples[$scope.pack_mode + '-' + $scope.split_mode + '-' + $scope.fill_by] || '';

    }

    $scope.reset_split_mode = function reset_split_mode () {
        if ($scope.split_mode == 'parallel') {
            $scope.splitExample = $scope.splitExamples[$scope.split_mode + '-' + $scope.fill_by];
        }
        else if ($scope.split_mode == 'serial') {
            $scope.splitExample = $scope.splitExamples[$scope.split_mode + '-' + $scope.fill_by];            
        }
        else { console.log(" Unidentified split mode: " + $scope.split_mode) }

        console.log($scope['split_mode'] + ' : reset split example to ' + $scope.splitExample);
    }

    $scope.redistribute = function redistribute (Transfer, Options) {

        var deferred = $q.defer();

        $scope.reset_messages();

        console.log('update lookups..');
        $scope.updateLookups();

        if ($scope.fill_by.match(/row/i)) { 
            $scope.source_by_Row();
            // $scope.split_mode = 'serial';
        }
        else if ($scope.fill_by.match(/col/i) ) { 
            $scope.source_by_Col();
            // $scope.split_mode = 'serial';
        }
        else if ($scope.fill_by.match(/pos/i)) {
            $scope.source_by_Slot();
            // $scope.split_mode = 'parallel';
        }

        $scope.reset_split_mode();
        $scope.reset_pack_mode();

        console.log('validate');
        $scope.validate_Form();

        console.log("Target Samples: " + $scope.N * $scope.splitX);
        console.log("Target Boxes: " + $scope.target_boxes);

        $scope.loadWells()
        .then (function (loaded) {
            console.log("loaded wells ok...");
            if (! $scope.newMap) {
                // initiate mapping //
                console.log('new map..');
                var newMap = new wellMapper();

                newMap.colourMap($scope.Samples.length);
                newMap.from($scope.Samples);            

                $scope.rgbList = newMap.rgbList;       
                //$scope.source_rows = newMap.source_rows;
                //$scope.source_cols = newMap.source_cols;
      
                console.log("rgb: " + JSON.stringify(newMap.rgbList));
                console.log("colours: " + JSON.stringify(newMap.colours));
                console.log("colour MAP: " + JSON.stringify(newMap.colourMap));

                $scope.newMap = newMap;
            }  

            if (Transfer) {
                $scope.Transfer = Transfer;
            }
            else {
                $scope.Transfer = {
                    qty: $scope.transfer_qty,
                    qty_units : $scope.transfer_qty_units,
                    Container_format : $scope.target_format,
                    Sample_type : $scope.sample_type_id,
                };
            }

            if (Options) {
                Options['target_boxes'] = $scope.target_boxes;
                Options['available'] = $scope.available;  // reset in loadWells...

                $scope.distribute_Options = Options;
            }
            else {
                $scope.distribute_Options = {
                    fill_by : $scope.fill_by, 
                    pack : $scope.pack,
                    pack_wells : $scope.pack_wells,
                    split : $scope.splitX,
                    split_mode : $scope.split_mode,
                    target_size : $scope.target_size,
                    target_boxes : $scope.target_boxes,
                    available : $scope.available,
                    transfer_type : $scope.transfer_type,
                };
            }

            console.log('call distribute');
            console.log('Transfer: ' + JSON.stringify($scope.Transfer) );
            console.log('Options: ' + JSON.stringify($scope.distribute_Options) );

            // recalculate mapping //
            $scope.Map = $scope.newMap.distribute(
                $scope.Samples, 
                $scope.Transfer,
                $scope.distribute_Options
            );
            
            console.log("Samples: " + JSON.stringify($scope.Samples));
            console.log("NEW MAP: " + JSON.stringify($scope.Map));
 
            console.log("NEW CMAP: " + JSON.stringify($scope.Map.CMap));
            console.log("Source Colour Map: " + JSON.stringify($scope.Map.SourceMap));
            console.log("Target Colour Map: " + JSON.stringify($scope.Map.TransferMap));           
        
            deferred.resolve($scope.Map);
        })
        .catch ( function (err) {
            console.log("Error loading wells: " + err);
            deferred.reject(err);
        });

        return deferred.promise;

    }

    $scope.parse_custom_options_OLD = function () {

        if ($scope.custom_options) {
            var Custom_Options = JSON.parse($scope.custom_options);
       
            if (Custom_Options) {
                var keys = ['fill_by', 'pack', 'pack_wells', 'splitX', 'split_mode', 'target_size', 'target_boxes', 'available', 'transfer_type'];
                for (var i=0; i<keys.length; i++) {
                    if (! $scope[keys[i]]) {
                        $scope[keys[i]] = Custom_Options[keys[i]];
                        console.log("Custom Set " + keys[i] + ' -> ' + $scope[keys[i]]);
                    }
                }
            }
            else {
                $scope.error("Error parsing custom options");
            }
        }
    }

    $scope.set_to_default = function set_to_default() {

        $scope.fill_by = $scope.Config['fill_by'] || 'row';
        $scope.splitX   = $scope.Config['Split'] || 1;
        $scope.pack_wells   = $scope.Config['pack'] || 0;   // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.split_mode    = $scope.Config['mode'] || 'parallel';  // serial or parallel...appliable only for split (eg A1, A1, A2, A2... or A1, A2... A1, A2...)
        $scope.transfer_type = $scope.Config['transfer_type'] || 'Aliquot';
   
    }

    $scope.use_custom_settings  = function use_custom_settings() {

        var volumes = _.pluck($scope.Samples, 'qty');
        var version = '[mid qty version]';

        var min = _.min(volumes);
        var max = _.max(volumes);

        $scope.messages.push("Original Volumes Detected: Minimum: " + min + '; Maximum: ' + max );

        if (volumes.length && min > 1.0 ) {
            $scope.splitX = 5;
            $scope.transfer_qty = "200,200,500,500,100";
            $scope.redistribute();
        }
        else {
            $scope.splitX = 4;

            $scope.transfer_qty = "200,200,500,100";
            $scope.redistribute();            
        }

        $scope.pack_wells = 8;
        $scope.fill_by = 'column';
        $scope.split_mode = 'serial';
 
        $scope.messages.push("Using Custom Data Matrix Sample Distribution Settings " + version);
    }

    // Fill for Samples only ... may not be necessary ... 
    $scope.source_by_Col = function source_by_Col () {
        // $scope.byCol = true;
        // $scope.byRow = false;
        $scope.fill_by = 'column';
        //$scope.Samples = _.sortByNat($scope.Samples, 'position');

        $scope.fillExample = $scope.fillExamples[$scope.fill_by];
        
        $scope.pack_wells = $scope.pack_wells || 1;
        $scope.pack = $scope.pack_wells || 1;
        
        if (! $scope.ordered) {
            $scope.Samples = _.sortByNat($scope.Samples, function(sample) {
                var batch = sample.batch || 0; 
                var string = batch.toString() + '_' + sample.position.substring(1,3) + '_' + sample.position.substring(0,1);
                return string;
            });
            console.log("reorder by Col: " + JSON.stringify(_.pluck($scope.Samples, 'position')) );
        }
    }

    $scope.source_by_Row = function source_by_Row () {
        // $scope.byCol = false;
        // $scope.byRow = true;
        $scope.fill_by = 'row';

        $scope.fillExample = $scope.fillExamples[$scope.fill_by];
        
        $scope.pack_wells = $scope.pack_wells || 1;
        $scope.pack = $scope.pack_wells || 1;
        
        if (! $scope.ordered) {
            $scope.Samples = _.sortByNat($scope.Samples, function(sample) { 

                if (!sample.position) { sample.position = 'A1'}

                var batch = sample.batch || 0;
                var string = batch.toString() + '_' + sample.position;
                return string;
            });
            console.log("reorder by Row: " + JSON.stringify(_.pluck($scope.Samples, 'position')) );
        }
    }

    $scope.source_by_Slot = function source_by_Slot () {
        // $scope.byCol = true;
        // $scope.byRow = false;
        $scope.fill_by = 'position';
        $scope.split_mode = 'parallel';
        //$scope.Samples = _.sortByNat($scope.Samples, 'position');

        $scope.pack = 0;
        $scope.pack_wells = $scope.pack_wells || 1;

        $scope.fillExample = $scope.fillExamples[$scope.fill_by];
    }

    $scope.reset_Samples = function reset_Samples () {
        $scope.Samples = $scope.Samples_init;
    }

    $scope.distribute = function distribute() {
        /** distribute source samples onto targets using various distribution options **/
        console.log('distribute');

        $scope.targets = $.extend(true, [], $scope.Samples);

        for (var i=0; i<$scope.targets.length; i++) {
            $scope.targets[i]['container'] = 'new';
        }
         
        console.log("Targets: " + JSON.stringify($scope.targets));        
    }

    $scope.loadWells = function () {
        // get available wells 
        var deferred = $q.defer();

        var rack_id = $scope.target_rack;
        var size    = $scope.target_size;
        var fill_by = $scope.fill_by;

        var rack_name;
        if (! rack_id && size ) {
            rack_name = 'B' + size;   // default target box to benchtop rack  ... (standard Box: 'B9x9' and/or 'B8x12' )
        }

        console.log("Load rack " + rack_id + ' ' + rack_name);
        var data = { id: rack_id, name: rack_name, fill_by: fill_by};

        console.log("SEND: " + JSON.stringify(data));

        if (rack_id || rack_name) {

            $scope.available = {};  // eg { '<box_id>' : [{ id : <slot_id>, position : <pos> } ]} ... ordered based on 'fill_by'

            $http.post("/Rack/boxData", data)
            .then (function (returnData) {
                console.log("rack data: " + JSON.stringify(returnData));

                $scope.available = returnData.data.available || {};
                console.log("Available: " + JSON.stringify($scope.available));
                // define target boxes (only handles one for now ... )
               

                $scope.target_boxes = Object.keys($scope.available);
                console.log("target boxes: " + $scope.target_boxes.join(','));
                var firstBox = $scope.target_boxes[0] || '';

                if ($scope.available && $scope.available[firstBox] && $scope.available[firstBox].length) { 
                    $scope.message($scope.available[firstBox].length + ' wells available in ' + returnData.data.name);
                    $scope.target_rack = returnData.data.id;
                }
                else if (returnData.data.name) { 
                    $scope.warning("no wells available in " + returnData.data.name )
                    $scope.target_boxes = [];
                } 
                else if (! returnData.data.id) {
                    $scope.error("Invalid Box specified : " + $scope.target_rack + " ? ");
                }

                $scope.N_boxes = $scope.target_boxes.length;

                var target_boxes = $scope.target_boxes;

                if (! target_boxes.length) {
                    $scope.error("No valid target boxes");
                    $scope.target_rack = '';
                    $scope.target_boxes = [];
                }

                var boxes = [];
                for (var i=0; i<target_boxes.length; i++) {    
                    if (target_boxes[i] && ! $scope.available[target_boxes[i]] || !$scope.available[target_boxes[i]].length) { 
                        $scope.error("No target wells available in Box" + $scope.target_boxes[i]);
                        $scope.target_rack = '';
                    }
                    else {
                        boxes.push(target_boxes[i]);
                    }
                }
                $scope.target_boxes = boxes;   // clear boxes with no available wells .... 

                console.log("Target rack: " + $scope.target_rack + '; from ' + JSON.stringify($scope.target_boxes));

                if ($scope.target_rack && $scope.target_boxes.length) {
                    $scope.N_boxes = $scope.target_boxes.length; // test
                    deferred.resolve();
                }
                else if (size) {
                    // prompt user for target box 
                    console.log("choose size: " + size);
                    $http.get('/Rack/wells?size=' + size + '&fill_by=' + fill_by)
                    .then ( function (wells) {
                        console.log("loaded wells: " + JSON.stringify(wells));
                        $scope.available = wells.data;

                        $scope.N_boxes = Math.ceil($scope.N * $scope.splitX / wells.data.length);
                        console.log("GOT : " + JSON.stringify($scope.available)); 
                        deferred.resolve();
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

    $scope.execute_transfer = function testXfer () {
        //var Targets = [{"id":200,"position":"A1","container":1000},{"id":201,"position":"A2","container":1000},{"id":202,"position":"A3","container":1000},{"id":203,"position":"B1","container":1000},{"id":204,"position":"B2","container":1000},{"id":205,"position":"B3","container":1000},{"id":206,"position":"C1","container":1000},{"id":207,"position":"C2","container":1000},{"id":208,"position":"C3","container":1000},{"id":209,"position":"D1","container":1000},{"id":210,"position":"D2","container":1000},{"id":211,"position":"D3","container":1000},{"id":212,"position":"A1","container":1001},{"id":213,"position":"A2","container":1001},{"id":214,"position":"A3","container":1001},{"id":215,"position":"B1","container":1001},{"id":216,"position":"B2","container":1001},{"id":217,"position":"B3","container":1001},{"id":218,"position":"C1","container":1001},{"id":219,"position":"C2","container":1001},{"id":220,"position":"C3","container":1001},{"id":221,"position":"D1","container":1001},{"id":222,"position":"D2","container":1001},{"id":223,"position":"D3","container":1001},{"id":224,"position":"A1","container":1002},{"id":225,"position":"A2","container":1002},{"id":226,"position":"A3","container":1002},{"id":227,"position":"B1","container":1002},{"id":228,"position":"B2","container":1002},{"id":229,"position":"B3","container":1002},{"id":230,"position":"C1","container":1002},{"id":231,"position":"C2","container":1002},{"id":232,"position":"C3","container":1002},{"id":233,"position":"D1","container":1002},{"id":234,"position":"D2","container":1002},{"id":235,"position":"D3","container":1002},{"id":236,"position":"A1","container":1003},{"id":237,"position":"A2","container":1003},{"id":238,"position":"A3","container":1003},{"id":239,"position":"B1","container":1003},{"id":240,"position":"B2","container":1003},{"id":241,"position":"B3","container":1003},{"id":242,"position":"C1","container":1003},{"id":243,"position":"C2","container":1003},{"id":244,"position":"C3","container":1003},{"id":245,"position":"D1","container":1003},{"id":246,"position":"D2","container":1003},{"id":247,"position":"D3","container":1003},{"id":248,"position":"A1","container":1004},{"id":249,"position":"A2","container":1004},{"id":250,"position":"A3","container":1004},{"id":251,"position":"B1","container":1004},{"id":252,"position":"B2","container":1004},{"id":253,"position":"B3","container":1004},{"id":254,"position":"C1","container":1004},{"id":255,"position":"C2","container":1004},{"id":256,"position":"C3","container":1004},{"id":257,"position":"D1","container":1004},{"id":258,"position":"D2","container":1004},{"id":259,"position":"D3","container":1004},{"id":260,"position":"A1","container":1005},{"id":261,"position":"A2","container":1005},{"id":262,"position":"A3","container":1005},{"id":263,"position":"B1","container":1005},{"id":264,"position":"B2","container":1005},{"id":265,"position":"B3","container":1005},{"id":266,"position":"C1","container":1005},{"id":267,"position":"C2","container":1005},{"id":268,"position":"C3","container":1005},{"id":269,"position":"D1","container":1005},{"id":270,"position":"D2","container":1005},{"id":271,"position":"D3","container":1005},{"id":272,"position":"A1","container":1006},{"id":273,"position":"A2","container":1006},{"id":274,"position":"A3","container":1006},{"id":275,"position":"B1","container":1006},{"id":276,"position":"B2","container":1006},{"id":277,"position":"B3","container":1006},{"id":278,"position":"C1","container":1006},{"id":279,"position":"C2","container":1006},{"id":280,"position":"C3","container":1006},{"id":281,"position":"D1","container":1006},{"id":282,"position":"D2","container":1006},{"id":283,"position":"D3","container":1006},{"id":284,"position":"A1","container":1007},{"id":285,"position":"A2","container":1007},{"id":286,"position":"A3","container":1007},{"id":287,"position":"B1","container":1007},{"id":288,"position":"B2","container":1007},{"id":289,"position":"B3","container":1007},{"id":290,"position":"C1","container":1007},{"id":291,"position":"C2","container":1007},{"id":292,"position":"C3","container":1007},{"id":293,"position":"D1","container":1007},{"id":294,"position":"D2","container":1007},{"id":295,"position":"D3","container":1007}];

        var options = {
            transfer_type: $scope.transfer_type,
            // prep not necessary, but could be optionally added here ...
            //
            // Target_sample and Target_format qty should already be included in Transfer specs...
        };            

        var format;

        var el = document.getElementById('Plate_Format-id');
        
        var volume = $scope.volume;
        var volume_units = $scope.volume_units;

        if (el) { format = el.value }
        console.log("Found format: " + format + '=' + $scope['Plate_Format-id']);

        var data = { 
            ids: $scope.plate_ids,
            Transfer: $scope.Map.Transfer,
            Options : {
                transfer_type: $scope.transfer_type,
                // prep not necessary, but could be optionally added here ...
                //
                // Target_sample and Target_format qty should already be included in Transfer specs...
            },
        };

        console.log("POSTING DATA: " + JSON.stringify(data));

        $scope.feedback = "..."
        $http.post("/xfer", data)
        .then (function (returnData) {
            console.log("xfer data: " + JSON.stringify(returnData));

            if ( returnData.data && returnData.data.plate_ids) {
                $scope.message("Transferred " + returnData.data.plate_ids.length + " Samples");
            }
            else {
                $scope.warning("Error retrieving target Samples (?)");
            }

            /*
            if (1) {
                var incData =  { table: 'Plate', attributes : ['29'], targets : [1] };
                $http.post("/attributes/increment", incData)
                .then (function (incResponse) {
                    $scope.feedback = 'done';
                    console.log("Incremented Attribute(s): " + JSON.stringify(incResponse));
                })
                .catch (function (incErr) {
                    console.log("Error incrementing attributes: " + JSON.stringify(incErr));
                    $scope.feedback = 'error detected...';
                    $scope.errorMsg = "Error incrementing attributes !";
                });
            }
            */
        })
        .catch (function (err) {
            console.log("Error posting transfer: " + err);
            $scope.feedback = 'error detected...';
            $scope.errorMsg = "Error detected during Transfer !";
        });        
    }

}]);
