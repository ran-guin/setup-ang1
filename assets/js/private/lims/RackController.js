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

            $scope.load_active_Samples(Samples);
        }

        console.log("initialization complete...");
    }

    $scope.move_boxes = function () {

        $scope.rack_ids = [85, 86];
        $scope.parent_id = 7;
        $scope.targets = ['B7','B8'];

        $scope.reprint_barcodes = false;

        // test only
        if ($scope.rack_ids && $scope.parent_id && $scope.targets) {

            if ($scope.rack_ids.length === $scope.targets.length) {
                console.log("** Move " + $scope.rack_ids + " To " + $scope.parent_id + " : " + $scope.target);

                var url = '/Rack/move';
                var data = {
                    ids: $scope.rack_ids,
                    parent: $scope.parent_id,
                    names : $scope.targets,
                    reprint : $scope.reprint_barcodes,
                };

                console.log("** POST MOVE : " + JSON.stringify(data));
                $http.post(url, data)
                .then ( function (result) {

                    if (result.data && result.data.set ) {
                        $scope.message(result.data.set.affectedRows + " boxes moved successfully");
                    }
                    else if (result.data && result.data.length) {
                        $scope.warning(result.data[0]);
                    }
                    else {
                        $scope.warning("no move response ?");
                        console.log(JSON.stringify(result));
                    }
                })
                .catch ( function (err) {
                    console.log("error moving boxes: " + err);
                    $scope.error(err);
                });
            }
            else {
                $scope.warning('Number of boxes [' + $scope.rack_ids.length 
                    + ' does not match retrieved target names [' + $scope.targets.length + '] ... try again');
            }
        }
        else {
            $scope.warning("Missing information required to move boxes");
        }
    }

    $scope.load_alias = function (ids, label) {

        if (!label) { label = 'AliasMap'}
        if (! $scope[label] ) { $scope[label] = {} }
        var list = ids;
        if (ids.constructor === Array) {
            list = ids.join(',');
        }

        list = list.replace(/Loc/ig,'');

        var q = "SELECT Rack_Alias as alias, Rack_ID as id FROM Rack WHERE RAck_ID IN (" + list + ")";
        
        var url = "/remoteQuery";
        console.log(q);
        $http.post(url, { query : q })
        .then ( function (result) {
            if (result.data && result.data.length) {
 
                for (var i=0; i<result.data.length; i++) {
                    var hash = result.data[i];
                    console.log('map ' + JSON.stringify(hash));
                    $scope[label][hash.id] = hash.alias;
                }
                // $scope[label] = Map;
                console.log(label + " Mapped to : " + JSON.stringify($scope[label]));
            }
            else {
                $scope[label] = {};
            }
        })
        .catch (function (err) {
            $scope.warning("Error checking for alias: " + err);
        }); 
 
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
