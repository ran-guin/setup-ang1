var app = angular.module('myApp');

app.controller('LIMSController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function limsController ($scope, $rootScope, $http, $q) {

    console.log('loaded LIMS controller'); 

    $scope.active = {};
    $scope.active.Samples = [];
    $scope.active.N = 0;
 
    $scope.active.valid_plate_sets = [];

    $scope.active.plate_set = 'new';  // set default ..  
    $scope.payload = {};

    $scope.http_headers = null;

    $scope.initialize_payload = function (config) {
        if (config && config['payload']) { 
            $scope.payload = config['payload']

            if ($scope.payload.token) {
                $scope.http_headers = { 'x-access-token' : $scope.payload.token };
            }
        }
        console.log("Payload: " + JSON.stringify($scope.payload));
    }

    $scope.set_active_attribute = function (attr, val) {
        // accessor to local attributes
        $scope.active[attr] = val;
    }

    $scope.parseSQL = function parseSQL (hash) {
        // designed to parse SQL return hash

        var parsed = {
            message: hash.message,
            affected: hash.affectedRows,
            insertId: hash.insertId,
            warningCount: hash.warningCount
        }

        if (hash.message) {
            var changed = hash.message.match(/Changed: (\d+)/);
            parsed.changed = changed[1];
        }

        return parsed;
    }
    
    // Custom methods ... 
    $scope.Prefix = function Prefix (model) {
        var P = {
            'solution' : 'Sol',
            'plate' : 'BCG',
            'location' : 'Loc',
            'equipment' : 'Eqp'
        };

        return P[model];
    }

    $scope.api_print = function (model, ids) {
        var url = '/Barcode/print';
        //  + model  + '/' + ids;

        console.log("URL: " + url);
        $http.post(url, { model: model, id: ids })
        .then (function (response) {
            console.log("Called print method...");
            console.log(JSON.stringify(response));
        })
        .catch ( function (err) {
            $scope.remote_log({error: 'api printing error'});
        });
    }

    $scope.remote_log = function (data) {
        // logs errors and warnings to Rollbar for remote monitoring

        $http.post('/remote_log' , data)
        .then( function (result) {
            console.log("remote log : " + JSON.stringify(data));
            console.log('returned: ' + JSON.stringify(result));
        })
        .catch (function (err) {
            console.log("Error with remote_log of " + JSON.stringify(data));
            console.log(JSON.stringify(err));
        });
    }

    $scope.print_Labels = function (model, ids) {

        var deferred = $q.defer();

        // custom method to call api to print barcodes ... 
        var printer = 'Zebra13';  // pass printer_group instead... 
 
        var payload = $scope.payload;
        console.log(payload);

        if (payload && payload.printer_group && payload.printer_group === 'Printing Disabled') {
            console.log('printing disabled..');
            $scope.message("Printing Disabled");
            deferred.resolve();
        }
        else if (model && ids.length && payload) {
            console.log("Test Printer " + model + " : " + ids);

            var params = "database=" + payload.db + '&';
            params = params + 'host=' + payload.host + '&';
            params = params + 'user=' + payload.db_user + '&';
            params = params + 'id=' + ids + '&';
            // params = params + 'printer=' + printer + '&';
            params = params + 'printer_group=' + payload.printer_group + '&';
            params = params + 'model=' + model + '&';

            var alDente_url = "http://bcgpdev5.bccrc.ca/SDB_rg/cgi-bin/barcode_printer.pl?";
            
            console.log(alDente_url);
            console.log("params: " + params);
            $http.get(alDente_url + params)
            .then (function (response) {
                console.log("Response: " + JSON.stringify(response));
                if (response.data) {
                    var success = response.data.match(/SUCCESS: \[(.*?)\]/);
                    if (success) { 
                        console.log("Success: " + success[1]);
                        $scope.message(success[1]);
                    }
                    else {
                        console.log("no success message detected ?");
                        $scope.warning("print success not detected...check printer")
                    }
                }
                deferred.resolve(response);
            })
            .catch (function (err) {
                deferred.reject(err);
                console.log("Error: " + JSON.stringify(err));
            });
        }
        else {
           if (!payload) { 
                console.log("No payload supplied to access printer parameters");
            }
            else {
                console.log("No model or ids to print...");
            }

            var e = new Error('no payload / model or ids');
            deferred.reject(e);
 
        }
        return deferred.promise;
    }

    $scope.reset_home_barcode = function (attribute) {
        var ids = _.pluck($scope.active.Samples, 'id');
        var barcode = 'BCG' + ids.join('BCG');

        $scope[attribute] = barcode;
    }

    // Methods to set 'active' scope attributes (eg active.Samples, active.plate_set ... )
    $scope.load_active_Samples = function (Samples) {

        var deferred = $q.defer();

            $scope.active.Samples = Samples;
            console.log("loaded...");
      
            if (! $scope.original_Samples ) { 
                $scope.original_Samples = Samples;
                var boxes = _.unique(_.pluck(Samples,'box_id'));
                console.log('Boxes : ' + JSON.stringify(boxes));
                if (boxes) {
                    for (var i=0; i<Samples.length; i++) {
                        Samples[i].batch = boxes.indexOf(Samples[i].box_id) + 1;
                    }
                }
            }

            // preset standardized values from first sample ... 
            if (Samples[0] && Samples[0]['container_format']) {
                $scope.active.container_format = Samples[0]['container_format'];
            }
            else { $scope.active.container_format = 'undefined' }

            if (Samples[0] && Samples[0]['sample_type']) {
                $scope.active.sample_type = Samples[0]['sample_type'];
            }
            else { $scope.active.sample_type = 'undefined' }

            var ids = [];
            var Contexts = {};
            for (var i=0; i<Samples.length; i++) {
                if (Samples[i].id) { ids.push(Samples[i].id) }

                var context = Samples[i].sample_type + ' in ' + Samples[i].container_format;
                console.log(i + " " + context);
               
                if (! Contexts[context]) { Contexts[context] = [ Samples[i].id ] }
                else { Contexts[context].push(Samples[i].id) }

                var contexts = Object.keys(Contexts);

                if (contexts.length > 1) {
                    $scope.warning("Inconsistent sample type / container formats detected");
                }
                $scope.active.Contexts = Contexts;
            }
            $scope.active.plate_list = ids.join(',');
            $scope.active.plate_ids  = ids;

            $scope.active.N = $scope.active.plate_ids.length;
            
            console.log('ids: ' + $scope.active.plate_list);
            console.log(Samples.length + ' samples loaded... from #' + ids[0]);
            console.log("ACTIVE Loaded " + $scope.active.Samples.length + ' active Samples');

            console.log(JSON.stringify($scope.active.Samples));
            $scope.reset_home_barcode('barcode');
            
        deferred.resolve($scope.active);
        return deferred.promise;

    }

    // Methods to set 'active' scope attributes (eg active.Samples, active.plate_set ... )
   	$scope.reload_active_Samples = function (Samples) {

        var deferred = $q.defer();

        var ids = [];
        if (Samples.constructor === Array) {
            if (Samples[0].constructor === Number || Samples[0].constructor === String) {
                ids = Samples
            }
            else {
                ids = _.pluck(Samples,'id');
            }

        
            $http.get('Container/summary?ids=' + ids.join(','))         
            .then (function (result) {
                console.log("done reloading summary for " + result.data.length + ' samples');
                console.log(JSON.stringify(result.data));

                if (result.data && result.data.length) {
                    $scope.load_active_Samples(result.data)
                    .then ( function (active) {

                        // $scope.active = active;

                        $scope.active.valid_plate_sets = [];
                        var parent;
                        
                        console.log(JSON.stringify($scope.active.plate_set));

                        if ($scope.active.plate_set && $scope.active.plate_set.constructor === 'Number') { parent = $scope.active.plate_set }
                        $scope.load_plate_set({ Samples: result.data, parent : parent } );

                        console.log("Reloaded: " + JSON.stringify($scope.active_Samples));
                        deferred.resolve();
                    })
                    .catch ( function (err) {
                        console.log("Error resetting active samples");
                        deferred.reject(err);
                    })
                }
                else {
                    console.log("No Samples found");
                    var e = new Error('no samples loaded');
                    deferred.reject(e);
                }
            })
            .catch ( function (err) {
                console.log("Error: " + err);
                $scope.error("Error loading sample data: " + err);
                deferred.reject(err);
            });
        }
        else {
            console.log("Ids not supplied as array");
            deferred.reject('No array of ids to reload');
        }

        return deferred.promise;

    }
   
    $scope.get_plate_sets = function () {
        var count = $scope.active.plate_ids.length;
        console.log("using " + count + ' ids');

        var condition = "FK_Plate__ID IN (" + $scope.active.plate_ids.join(',') + ')';
        
        var searchData = {
            scope: { 'Plate_Set' : [ 'Plate_Set_Number as PS'] },
            condition : condition,
            group: 'Plate_Set_Number HAVING COUNT(*) = ' + count,
            idField: 'Plate_Set_Number'
        };

        $http.post('/Record_API/search', searchData)
        .then ( function (result) {
            console.log("RESULT: " + JSON.stringify(result));
            $scope.active.valid_plate_sets = [];
            if (result.data && result.data.Plate_Set && result.data.Plate_Set.length) {
                for (var i=0; i<result.data.Plate_Set.length; i++) {
                    $scope.active.valid_plate_sets.push(result.data.Plate_Set[i].PS);
                }
            }
            console.log("Retrieved SET(s): " + JSON.stringify($scope.active.valid_plate_sets));
        })
        .catch ( function (err) { 
            console.log("Error getting sets: " + err);
        }); 
    }

    $scope.load_plate_set = function ( options ) {
    	// use set = 'new' to create new set 
    	if (!options) { options = {} }
    	
    	var Samples = options.Samples;
    	var parent = options.parent;                    // specfiy parent (only applicable when saving)
    	var existing_set    = options.existing_set;     // load existing set 

        console.log("load plate set..." + parent + " from " + existing_set);

    	if (existing_set != null) { 
    		$scope.active.plate_set = existing_set;
	    	console.log("Retrieved existing plate set: " + $scope.active.plate_set);    		
    	}
    	else {
            console.log("save current samples as new plate set...");
	        var data = [];
            var id_list = _.pluck(Samples, 'id');
                
            $http.post("plate_set/save", { ids: id_list, parent: parent})                    
            .then (function (result) {
                $scope.active.plate_set = result.data.plate_set;
                console.log("SAVED Plate Set: " + $scope.active.plate_set);
                console.log("Active list: " + $scope.active.valid_plate_sets.join(','));
                $scope.active.valid_plate_sets.push($scope.active.plate_set);
            })
            .catch ( function (err) {
                $scope.errors.push("Error saving plate set");
                console.log("Error saving plate set");
            });
	    }
        console.log('finished loading plate set...');
    }

    $scope.reset_Samples = function reset_Samples () {
        $scope.active.Samples = $scope.original_Samples;
    }

}]);  

