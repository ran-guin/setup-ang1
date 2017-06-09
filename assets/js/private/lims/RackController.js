var app = angular.module('myApp');

app.controller('RackController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function rackController ($scope, $rootScope, $http, $q) {

    // $scope.debug = 1;   

    console.log('loaded protocol controller');        
    $scope.context = 'Rack';
 
    $scope.form = {};
    $scope.sample_count = 0;

    $scope.initialize = function (config, options) {
        $scope.initialize_payload(config);
       
        console.log("initialize protocol");
        
        if (config && config['backfill_move_date']) {
            $scope.backfill_move_date = config['backfill_move_date'];
        }
 
        if (config && config['Samples']) {
            // both protocol tracking and standard Container page 

            var Samples = config['Samples'] || {};
            if (config['Samples'].constructor === String) {
               Samples = JSON.parse(config['Samples'])
            }

        }

        console.log("initialization complete...");
    }

    $scope.newSlottedBox = function () {

        $scope.reset_messages();
        var url = "/Rack/newBox";

        var data = {
            name : $scope.name,
            parent : $scope.parent,
            size   : $scope.size,
        }

        $http.post(url, data)
        .then ( function (result) {
            var data = result.data;
            var msg = data.message;
            var err = data.error;

            var boxes = data.boxes;

            if (err) { 
                var errMsg = $scope.parse_standard_error(msg);
                $scope.error(errMsg);
            }
            else if (msg) {
                $scope.set_default_name();   // set next one if applicable ... 
                $scope.message(msg);
            }

            //  print in createNew automatically 
            if (boxes && boxes.length) {
                $scope.print_Labels('rack',boxes)
                .then ( function (response) {
                    console.log("printed : " + JSON.stringify(response));
                })
                .catch ( function (err) {
                    console.log("Error printing barcodes");
                });
            }
                    
            console.log("Admin returned:" + JSON.stringify(result));
        })
        .catch ( function (err) {
            $scope.error(err);
        });
    }

    $scope.validate_boxname = function () {

        $scope.reset_messages();

        var name = $scope.name;
        if ($scope.parent) {
            var parent = $scope.parent.replace(/^LOC/i,'');
            var q = "SELECT Rack_ID as id FROM Rack WHERE FKParent_Rack__ID = " + parent + " AND Rack_Name = '" + name + "'";
            
            var url = "/remoteQuery";
            console.log(q);
            $http.post(url, { query : q })
            .then ( function (result) {
                if (result.data && result.data.length) {
                    var exists = result.data[0].id;
                    $scope.name = '';
                    $scope.error(name + ' already exists on this Rack [' + $scope.Prefix('location') + exists + '] - Box NOT Created...');
                }
            })
            .catch (function (err) {
                $scope.warning("Error checking for conflict: " + err);
            });
        }
    }

    $scope.set_default_name = function (type, name, repeat) {
        
        $scope.reset_messages();

        if (!type) { type = 'Box' }
        if (!name) { name = 'name' }
        if (!repeat) { repeat = 1 }

        $scope[name] = null;
        var fill = $scope.fill_missing_numbers;

        if ($scope.parent) {
            var parent = $scope.parent.replace(/^LOC/i,'');

            var prefix;
            var sub_type;
            var parent_type;

            if (type === 'Box') {
                sub_type = 'Slot';
                parent_type = 'Rack';
                prefix = 'B';
            }
            else if (type === 'Rack') {
                sub_type = 'Box';
                parent_type = 'Shelf';
                prefix = 'R';
            }
            else {
                $scope.error("Only set up to retrieve default names for Boxes and Racks");
            }

            if (prefix) {
                var Bnum = "CAST(Mid(" + sub_type + ".Rack_Name, 2, 2) AS UNSIGNED)";
                var query  = "SELECT Rack.Rack_Type as type," 
                    + Bnum + " AS Bnum FROM Rack LEFT JOIN Rack as " + sub_type 
                    + " ON " + sub_type + ".FKParent_Rack__ID=Rack.Rack_ID "
                    + " WHERE Rack.Rack_ID = " + parent + " ORDER BY " + Bnum;    

                var require = { 'Rack_Type' : parent_type }
                
                $scope.next_in_line({ query: query, counter: 'Bnum', fill: fill, prefix: prefix, require: require, repeat: repeat} )
                .then ( function (result) {
                    $scope[name] = result;
                })
                .catch ( function (err) {
                    console.log("Problem retrieving next in line");
                })
            }
        }
        else { console.log("no parent or name ... skipping autoset") }
    }

 
}]);
