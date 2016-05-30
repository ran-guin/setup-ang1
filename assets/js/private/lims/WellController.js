'use strict';

var app = angular.module('myApp');

app.controller('WellController', 
['$scope', '$rootScope', '$http', '$q' , 
function wellController ($scope, $rootScope, $http, $q ) {

    $scope.context = 'Wells';

    var map = {};
    
    $scope.map = {};
    $scope.sources = [];

    $scope.initialize = function initialize(Config) {

        console.log("loaded Well Controller");
        console.log("CONFIG: " + JSON.stringify(Config));

        $scope.sources = Config['Sources'] || [];
        console.log("sources: " + $scope.sources);
        console.log("source 1: " + $scope.sources[0]);

        $scope.targets = [];
        $scope.source_init = $scope.sources;
        $scope.target  = Config['Target'] || {};
        $scope.options = Config['Options'];

        $scope.map = Config['map'] || {}; 
        $scope.target_rows = $scope.target.rows || ['A'];
        $scope.target_cols = $scope.target.cols || [1];

        $scope.Max_Row = $scope.Max_Row || 'A';
        $scope.Max_Col = $scope.Max_Col || 1;

        $scope.fill_by = Config['fill_by'] || 'row';
        $scope.splitX   = Config['Split'] || 1;
        $scope.pack_wells   = Config['pack'] || 0;   // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.split_mode    = Config['mode'] || 'parallel';  // serial or parallel...appliable only for split (eg A1, A1, A2, A2... or A1, A2... A1, A2...)
        $scope.transfer_type = Config['transfer_type'] || 'Aliquot';
        
        $scope.splitExamples = { 
            'serial' : "[pack=1] A1, A2 -> A1, A1, A2, A2 ...",
            'parallel' : "[pack=1] A1, A2... -> A1, A2,... A1, A2...",
            'batch'    : "[pack=2] A1,B1,C1,D1 ->  A1,B1, A1,B1, C1,D1, C1,D1...",
            'split'    : "when samples are split, multiple entries are always applied to respective splits",
        };             
        $scope.splitExample = $scope.splitExamples[$scope.split_mode];

        $scope.packExamples = {
            'batch'  : "samples packed into available wells in groups", 
            'packed' : "samples packed into first available wells",
            'copy' : " samples copied into similar well position",
        };             
        $scope.packExample = $scope.packExamples[$scope.pack_mode];

        // initialize variables to track available wells if applicable in target boxes.
        $scope.target_boxes = [];
        $scope.available = {};

        console.log("INIT Map");
        $scope.redistribute();
    }

    $scope.reset_pack_mode = function reset_split_mode () {
        if ($scope['pack_wells'] > 1 ) {
            $scope.pack_mode = 'batch';
        }
        else if ($scope['pack_wells']) {
            $scope.pack_mode = 'packed';
        }
        else {
            $scope.pack_mode = 'copy';
        }

        console.log($scope['pack_wells'] + " : set example to " + $scope.pack_mode );
        console.log(JSON.stringify($scope.packExamples));

        $scope.packExample = $scope.packExamples[$scope.pack_mode];
    }

    $scope.reset_split_mode = function reset_split_mode () {
        if ($scope.split_mode == 'parallel') {
            $scope.splitExample = $scope.splitExamples[$scope.split_mode];
        }
        else if ($scope.split_mode == 'serial') {
            $scope.splitExample = $scope.splitExamples[$scope.split_mode];            
        }
        else { console.log(" Unidentified split mode: " + $scope.split_mode) }

        console.log($scope['split_mode'] + ' : reset split example to ' + $scope.splitExample);
    }

    $scope.redistribute = function redistribute () {
        if (! $scope.newMap) {
            // initiate mapping //
            var newMap = new wellMapper();

            newMap.colourMap();
            newMap.from($scope.sources);            

            $scope.rgbList = newMap.rgbList;       
            //$scope.source_rows = newMap.source_rows;
            //$scope.source_cols = newMap.source_cols;
  
            console.log("rgb: " + JSON.stringify(newMap.rgbList));
            console.log("colours: " + JSON.stringify(newMap.colours));
            console.log("colour MAP: " + JSON.stringify(newMap.colourMap));

            $scope.newMap = newMap;
        }  

        // recalculate mapping //
        $scope.Map = $scope.newMap.distribute(
            $scope.sources, 
            {
                qty: $scope.transfer_qty,
                qty_units : $scope.transfer_qty_label,
            },
            { 
                Max_Row : $scope.Max_Row, 
                Max_Col : $scope.Max_Col,
                fillBy : $scope.fill_by, 
                pack : $scope.pack,
                pack_wells : $scope.pack_wells,
                split : $scope.splitX,
                target_size : $scope.box_size,
                target_boxes : $scope.target_boxes,
                available : $scope.available,
            }
        );
        
        console.log("Sources: " + JSON.stringify($scope.sources));
        console.log("NEW MAP: " + JSON.stringify($scope.Map));
        console.log("Xfer: ");
        if ($scope.Map.Xfer) {
            for (var i=0; i<$scope.Map.Xfer.length; i++) {
                console.log(i = ': ' + JSON.stringify($scope.Map.Xfer));
            } 
        }
        // console.log(newMap.source_rows + " x " newMap.source_cols);

        console.log("NEW CMAP: " + JSON.stringify($scope.newMap.CMap));
        console.log("Source Colour Map: " + JSON.stringify($scope.Map.SourceColours))
        console.log("Target Colour Map: " + JSON.stringify($scope.Map.ColourMap))

    }

    $scope.source_by_Col = function source_by_Col () {
        $scope.byCol = true;
        $scope.byRow = false;
        $scope.fill_by = 'column';
        //$scope.sources = _.sortByNat($scope.sources, 'position');

        if (! $scope.ordered) {
            $scope.sources = _.sortByNat($scope.sources, function(sample) {
                var batch = sample.batch || 0; 
                var string = batch.toString() + '_' + sample.position.substring(1,3) + '_' + sample.position.substring(0,1);
                return string;
            });
        }
    }

    $scope.source_by_Row = function source_by_Row () {
        $scope.byCol = false;
        $scope.byRow = true;
        $scope.fill_by = 'row';
        
        if (! $scope.ordered) {
            $scope.sources = _.sortByNat($scope.sources, function(sample) { 
                var batch = sample.batch || 0;
                var string = batch.toString() + '_' + sample.position;
                return string;
            });
        }
    }

    $scope.reset_sources = function reset_sources () {
        $scope.sources = $scope.sources_init;
    }

    $scope.distribute = function distribute() {
        /** distribute source samples onto targets using various distribution options **/
        console.log('distribute');

        $scope.targets = $.extend(true, [], $scope.sources);

        for (var i=0; i<$scope.targets.length; i++) {
            $scope.targets[i]['container'] = 'new';
        }
         
        console.log("Targets: " + JSON.stringify($scope.targets));        
    }

    $scope.loadRack = function (model) {
        // get available wells 
        var rack_id = $scope.target_rack;
        var size    = $scope.target_size;

        console.log("Load rack " + rack_id);
        if (rack_id) {
            var data = { id: rack_id };
            console.log("SEND: " + JSON.stringify(data));

            $http.post("/Rack/boxData", data)
            .then (function (returnData) {
                console.log("rack data: " + JSON.stringify(returnData));

                // define target boxes (only handles one for now ... )
                $scope.target_boxes = [rack_id];
                $scope.available[rack_id] = returnData.available_wells;
            })
            .catch (function (err) {
                console.log("Error loading Rack info: " + JSON.stringify(err) );
            });
        } 
        else if (size) {
            $http.get('/Rack/wells')
            .then ( function (wells) {
                $scope.available['0'] = wells; 
            })
            .catch ( function (wells) {
                console.log("Error retrieving available wells");
            });
        }

    }

    $scope.testXfer = function testXfer () {
        //var Targets = [{"id":200,"position":"A1","container":1000},{"id":201,"position":"A2","container":1000},{"id":202,"position":"A3","container":1000},{"id":203,"position":"B1","container":1000},{"id":204,"position":"B2","container":1000},{"id":205,"position":"B3","container":1000},{"id":206,"position":"C1","container":1000},{"id":207,"position":"C2","container":1000},{"id":208,"position":"C3","container":1000},{"id":209,"position":"D1","container":1000},{"id":210,"position":"D2","container":1000},{"id":211,"position":"D3","container":1000},{"id":212,"position":"A1","container":1001},{"id":213,"position":"A2","container":1001},{"id":214,"position":"A3","container":1001},{"id":215,"position":"B1","container":1001},{"id":216,"position":"B2","container":1001},{"id":217,"position":"B3","container":1001},{"id":218,"position":"C1","container":1001},{"id":219,"position":"C2","container":1001},{"id":220,"position":"C3","container":1001},{"id":221,"position":"D1","container":1001},{"id":222,"position":"D2","container":1001},{"id":223,"position":"D3","container":1001},{"id":224,"position":"A1","container":1002},{"id":225,"position":"A2","container":1002},{"id":226,"position":"A3","container":1002},{"id":227,"position":"B1","container":1002},{"id":228,"position":"B2","container":1002},{"id":229,"position":"B3","container":1002},{"id":230,"position":"C1","container":1002},{"id":231,"position":"C2","container":1002},{"id":232,"position":"C3","container":1002},{"id":233,"position":"D1","container":1002},{"id":234,"position":"D2","container":1002},{"id":235,"position":"D3","container":1002},{"id":236,"position":"A1","container":1003},{"id":237,"position":"A2","container":1003},{"id":238,"position":"A3","container":1003},{"id":239,"position":"B1","container":1003},{"id":240,"position":"B2","container":1003},{"id":241,"position":"B3","container":1003},{"id":242,"position":"C1","container":1003},{"id":243,"position":"C2","container":1003},{"id":244,"position":"C3","container":1003},{"id":245,"position":"D1","container":1003},{"id":246,"position":"D2","container":1003},{"id":247,"position":"D3","container":1003},{"id":248,"position":"A1","container":1004},{"id":249,"position":"A2","container":1004},{"id":250,"position":"A3","container":1004},{"id":251,"position":"B1","container":1004},{"id":252,"position":"B2","container":1004},{"id":253,"position":"B3","container":1004},{"id":254,"position":"C1","container":1004},{"id":255,"position":"C2","container":1004},{"id":256,"position":"C3","container":1004},{"id":257,"position":"D1","container":1004},{"id":258,"position":"D2","container":1004},{"id":259,"position":"D3","container":1004},{"id":260,"position":"A1","container":1005},{"id":261,"position":"A2","container":1005},{"id":262,"position":"A3","container":1005},{"id":263,"position":"B1","container":1005},{"id":264,"position":"B2","container":1005},{"id":265,"position":"B3","container":1005},{"id":266,"position":"C1","container":1005},{"id":267,"position":"C2","container":1005},{"id":268,"position":"C3","container":1005},{"id":269,"position":"D1","container":1005},{"id":270,"position":"D2","container":1005},{"id":271,"position":"D3","container":1005},{"id":272,"position":"A1","container":1006},{"id":273,"position":"A2","container":1006},{"id":274,"position":"A3","container":1006},{"id":275,"position":"B1","container":1006},{"id":276,"position":"B2","container":1006},{"id":277,"position":"B3","container":1006},{"id":278,"position":"C1","container":1006},{"id":279,"position":"C2","container":1006},{"id":280,"position":"C3","container":1006},{"id":281,"position":"D1","container":1006},{"id":282,"position":"D2","container":1006},{"id":283,"position":"D3","container":1006},{"id":284,"position":"A1","container":1007},{"id":285,"position":"A2","container":1007},{"id":286,"position":"A3","container":1007},{"id":287,"position":"B1","container":1007},{"id":288,"position":"B2","container":1007},{"id":289,"position":"B3","container":1007},{"id":290,"position":"C1","container":1007},{"id":291,"position":"C2","container":1007},{"id":292,"position":"C3","container":1007},{"id":293,"position":"D1","container":1007},{"id":294,"position":"D2","container":1007},{"id":295,"position":"D3","container":1007}];

        var sources = $scope.sources;
        var targets = $scope.targets;
        var options = $scope.options;

        var format;

        var el = document.getElementById('Plate_Format-id');
        
        var volume = $scope.volume;
        var volume_units = $scope.volume_units;

        if (el) { format = el.value }
        console.log("Found format: " + format + '=' + $scope['Plate_Format-id']);

        var data = { 
            Sources: sources,
            Targets: {
                // only applicable for split or packing
            },
            Options: {
 /*               container_format: format,
                volume : volume,
*/                volume_units : volume_units,
            },
            Set: options,
/*
            Targets: [
                { index: 1, position: 'A2', volume: 2, volume_units: 'ml'},
                { index: 1, position: 'A4', volume: 3, volume_units: 'ml'}
            ], 
            Set: { 
                'format' : 34, 
                'sample_type' : 56, 
                'created' : $scope.timestamp, 
                'location' : 3,
                'volume' : 
             } 
*/
        };

        console.log("POSTING DATA: " + JSON.stringify(data));

        $scope.feedback = "..."
        $http.post("/xfer", data)
        .then (function (returnData) {
            console.log("xfer data: " + JSON.stringify(returnData));
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
        })
        .catch (function (err) {
            console.log("Error posting transfer: " + err);
            $scope.feedback = 'error detected...';
            $scope.errorMsg = "Error detected during Transfer !";
        });        
    }

    $scope.resort = function resort() {
        // deprecate .. use distribute in wellmapper.js
        var sources = $scope.sources;

        //var target_format_id = transfer_parameters['target_format_id'];
        //var prep_id = transfer_parameters['prep_id'];
        //var target_size = transfer_parameters['target_size'];

        //var target_dimensions = target_size.split('\s*x\s*');  // 8 x 12 -> [8,12]

        //var rows = transfer_parameters['target_rows'] || ['A'];
        //var cols = transfer_parameters['target_cols'] || [1];

        var rows = $scope.rows || ['A'];
        var cols = $scope.cols || [1];
        var fill_by = $scope.fill_by || 'column';

        var x_min = rows[0];
        var x_max = rows[rows.length-1];
        var y_min = cols[0];
        var y_max = cols[cols.length-1];

        var x = x_min;  
        var y = 1;  

        var array = [];
        var rearray = [];
        var preserve_x = 8;

        var map = {};
        var Target = [];
        var Colour = [];

        var target_index = 0;
        var targets = ['T0:']; // CUSTOM TEST

        var target_position = x_min + y_min.toString();

        //array.push(targets[target_index], target_position);  // store mul plate record... 
        //rearray.push([sources[i], Container.position(sources[i]), targets[target_index], target_position]);

        Target[target_index] = {};
        Target[target_index][target_position] = sources[0];

        for (var i=1; i<sources.length; i++) {

            if (fill_by == 'row') {
                y++;
                if (y > y_max) {
                    y = 1;
                                        
                    if (x == x_max) {
                        x=x_min;
                        y = y_min;
                        target_index++;       // next plate ... 
                    }
                    else {
                        console.log("x = " + x + " : " + x_min);
                        x = String.fromCharCode(x.charCodeAt(0) + 1);
                    }
                }
            }
            else {
                if (x == x_max) {
                    x=x_min;
                    if (y >= y_max) {
                        y=y_min;
                        target_index++;       // next plate ... 
                        targets.push('T' + target_index );
                    }
                    else {
                        y++;
                    }
                }   
                else {
                    x = String.fromCharCode(x.charCodeAt(0) + 1);
                }

            }

            var target_position = x + y.toString();
            
            if (! Target[target_index]) { Target[target_index] = {} }
            if (! Colour[target_index]) { Colour[target_index] = {} }

            Target[target_index][target_position] = sources[i];
            Colour[target_index][target_position] = $scope.rgbList[i];

            $scope.Target = Target;
            $scope.Colour = Colour;

            //array.push(targets[target_index], target_position);  // store mul plate record... 

            var index = targets[target_index] + ':' + target_position;
            map[index] = sources[i];

            //rearray.push([sources[i], Container.position(sources[i]), targets[target_index], target_position]);
        }

        $scope.targets = targets;
        $scope.map = map;
    }

}]);
