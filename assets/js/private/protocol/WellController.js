'use strict';

var app = angular.module('myApp');

app.controller('WellController', 
['$scope', '$rootScope', '$http', '$q' , 
function wellController ($scope, $rootScope, $http, $q ) {

    $scope.context = 'Wells';

    var map = {};
    
    $scope.map = {};
    $scope.sources = [];

 

    $scope.initialize = function initialize(config) {
        var Config = {};
        if (config) { Config = JSON.parse(config) }

        $scope.sources = Config['sources'] || [];
        $scope.target  = Config['target'] || {};
        $scope.options = Config['options'];

        $scope.map = Config['map'] || {}; 
        $scope.target_rows = Config['target_rows'] || ['A','B','C'];
        $scope.target_cols = Config['target_cols'] || [1,2,3,4,5,6];

        // $scope.plates=['pla1','pla2','pla3'];
        // $scope.rows = [['A','B'], ['C','D'], ['E','F']];
        // $scope.wells = [];

        $scope.fill_by = Config['fill_by'] || 'row';
        $scope.split   = Config['splitX'] || 1;
        $scope.batch   = Config['batch'] || 1;    // applicable only for splitting with parallel mode (if N wells pipetted together)
        $scope.mode    = Config['mode'] || 'serial';  // serial or parallel...appliable only for split (eg A1, A1, A2, A2... or A1, A2... A1, A2...)
    
        console.log("INIT Map");

        var newMap = new wellMapper();

        newMap.colourMap();
        newMap.from($scope.sources);

        $scope.source_rows = newMap.source_rows;
        $scope.source_cols = newMap.source_cols;
        
        // console.log(newMap.source_rows + " x " newMap.source_cols);

        console.log( JSON.stringify(newMap) );

        $scope.colourMap = newMap.Map;
        $scope.colours   = newMap.colours;
        $scope.rgbList = newMap.rgbList;

        console.log("cols: " + JSON.stringify(newMap.colours));

        console.log("MAP: " + JSON.stringify($scope.colourMap));
        console.log("colours: " + JSON.stringify($scope.colours));
        console.log("rgb: " + JSON.stringify($scope.rgbList));

        console.log("Source Map: " + JSON.stringify(newMap.distribute()));

    }


    $scope.distribute = function distribute() {

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
