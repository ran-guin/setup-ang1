'use strict';

var app = angular.module('myApp');

app.controller('WellController', 
['$scope', '$rootScope', '$http', '$q' , 
function wellController ($scope, $rootScope, $http, $q ) {

    $scope.context = 'Wells';

    $scope.initialize = function initialize(Config, options) {

        $scope.initialize_mapper(Config, options);

        console.log("initialize Well Controller");

        $scope.Config = Config;

        var Samples = Config['Samples'] || [];
        if (Samples.length) {
            console.log("Load " + Samples.length + ' Samples ');
            $scope.load_active_Samples(Samples);
        }
        console.log("Loaded " + $scope.active.Samples.length + ' Samples ');
        console.log("source 1: " + $scope.active.Samples[0]);

        $scope.targets = [];
        $scope.source_init = $scope.active.Samples;
        $scope.target  = Config['Target'] || {};
        $scope.options = Config['Options'];
        $scope.sizes   = Config['sizes'];

        $scope.target_rows = $scope.target.rows || ['A'];
        $scope.target_cols = $scope.target.cols || [1];

        $scope.Max_Row = $scope.Max_Row || 'A';
        $scope.Max_Col = $scope.Max_Col || 1;

        // $scope.set_to_default();
     

        console.log("SIZES: " + JSON.stringify($scope.sizes));

        console.log("INIT Map");
        $scope.form_validated = false;

        $scope.transfer_qty_units = 'ml';

        if (options && options.distribute) {
            $scope.redistribute();
        }
    }

    $scope.redistribute = function () {

        console.log("QTY: " + $scope.transfer_qty);
        var Target = { 
            'Container_format' : $scope.map.target_format,
            'Sample_type'   : $scope.map.target_sample,
            'qty'           : $scope.map.transfer_qty,
            'qty_units'     : $scope.map.transfer_qty_units,
        };

        var Options = {
            'transfer_type' : $scope.map.transfer_type,
            'reset_focus'   : $scope.map.reset_focus,
            'split'         : $scope.map.splitX,   // $scope['Split' + $scope.stepNumber],
            'pack'          : $scope.map.pack,    // $scope.pack_wells,
            'distribution_mode' : $scope.map.distribution_mode,
            'fill_by'  :    $scope.map.fill_by,
            'target_size' : $scope.map.target_size,
        }

        console.log("Redistribute ... ");
        
        $scope.redistribute_Samples($scope.active.Samples, Target, Options)
        .then ( function (result) {
            console.log("MAP: " + JSON.stringify(result.Map));
            // $scope.Map = result.Map;
            $scope.test = "ERE";
        })
        .catch ( function (err) {
            console.log("Error redistributing samples");

        });

        console.log('validate');
        $scope.validate_Form();

    }
    $scope.validate_Form = function validated_form() {
        
        console.log("Validate " + $scope.transfer_type);
        if (! $scope.transfer_qty && $scope.transfer_type==='Aliquot') { 
            $scope.transfer_qty_errors = true;
            console.log("missing qty for aliquot");
            var testElement = document.getElementById('transfer_qty') || {} ;
            testElement.style = "border-color: red; border-width: 2px;";
        }
        else if ($scope.transfer_qty) { 
            $scope.transfer_qty_errors = false;
            var testElement = document.getElementById('transfer_qty') || {};
            testElement.style = "border-color: green; border-width: 2px;";
        }
        else {
            $scope.transfer_qty_errors = false;
            var testElement = document.getElementById('transfer_qty') || {};
            testElement.style = "border-color: null; border-width: 2px;";            
        }

        if ($scope.transfer_qty) {
            if ( $scope.transfer_qty_units) { 
                $scope.units_errors = false;
                var testElement = document.getElementById('transfer_qty_units') || {};
                testElement.style = "border-color: green; border-width: 2px;";
            }
            else { 
                $scope.units_errors = true;
                var testElement = document.getElementById("transfer_qty_units") || {};
                testElement.style = "border-color: red; border-width: 2px;";
            }
        }
        else {
            $scope.units_errors = false;
            testElement = document.getElementById("transfer_qty_units") || {};
            testElement.style = "border-color: green; border-width: 2px;";            
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

    $scope.distribute = function distribute() {
        /** distribute source samples onto targets using various distribution options **/
        console.log('distribute');

        $scope.targets = $.extend(true, [], $scope.active.Samples);

        for (var i=0; i<$scope.targets.length; i++) {
            $scope.targets[i]['container'] = 'new';
        }
         
        console.log("Targets: " + JSON.stringify($scope.targets));        
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
