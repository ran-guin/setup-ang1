'use strict';

var app = angular.module('myApp');

app.controller('WellController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function wellController ($scope, $rootScope, $http, $q) {

    $scope.context = 'Wells';

    var map = {};
    
    $scope.map = {};
    $scope.ids = [];
    
    $scope.initialize = function initialize(config) {
        var Config = {};
        if (config) { Config = JSON.parse(config) }

        $scope.map = Config['map'] || {}; 
        $scope.ids = Config['ids'] || [];
        $scope.target_rows = Config['target_rows'] || ['A','B','C'];
        $scope.target_cols = Config['target_cols'] || [1,2,3,4,5,6];

        $scope.fill_by = Config['fill_by'] || 'row';
        $scope.split   = Config['splitX'] || 1;
        $scope.batch   = Config['batch'] || 1;    // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.mode    = Config['mode'] || 'serial';  // serial or parallel...appliable only for split (eg A1, A1, A2, A2... or A1, A2... A1, A2...)
    }

    $scope.distribute = function distribute() {

        var ids = $scope.ids;

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

        var target_index = 0;
        var target_position = x_min + y_min.toString();
        var targets = ['PLA0']; // CUSTOM TEST

        array.push(targets[target_index], target_position);  // store mul plate record... 
        rearray.push([ids[i], Container.position(ids[i]), targets[target_index], target_position]);

        for (var i=0; i<ids.length; i++) {

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
                        targets.push('PLA' + target_index );
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
            console.log(target_position);
            
            array.push(targets[target_index], target_position);  // store mul plate record... 

            var index = targets[target_index] + ':' + target_position;
            map[index] = ids[i];

            rearray.push([ids[i], Container.position(ids[i]), targets[target_index], target_position]);
        }

        $scope.targets = targets;
        $scope.map = map;
    }

}]);
