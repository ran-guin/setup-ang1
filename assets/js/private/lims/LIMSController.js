var app = angular.module('myApp');

app.controller('LIMSController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function limsController ($scope, $rootScope, $http, $q) {

    console.log('loaded LIMS controller'); 

    $scope.active = {};
    $scope.active.Samples = [];
 
    $scope.active.valid_plate_sets = [];
    
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

    // Methods to set 'active' scope attributes (eg active.Samples, active.plate_set ... )
   	$scope.load_active_Samples = function (Samples) {

   		$scope.active.Samples = Samples;
   		
   		if (! $scope.original_Samples ) { $scope.original_Samples = Samples }

        var ids = [];
        for (var i=0; i<Samples.length; i++) {
            if (Samples[i].id) { ids.push(Samples[i].id) }
        }
        $scope.active.plate_list = ids.join(',');
        $scope.active.plate_ids  = ids;

        $scope.active.N = $scope.active.plate_ids.length;
        
        if (Samples[0] && Samples[0]['container_format']) {
            $scope.active.container_format = Samples[0]['container_format'];
        }
        else { $scope.active.container_format = 'undefined' }

        if (Samples[0] && Samples[0]['sample_type']) {
            $scope.active.sample_type = Samples[0]['sample_type'];
        }
        else { $scope.active.sample_type = 'undefined' }

        console.log(Samples.length + ' samples loaded..');
        console.log("ACTIVE Loaded " + $scope.active.Samples.length + ' active Samples');
    }

    $scope.get_plate_sets = function () {
        var count = $scope.active.plate_ids.length;
        console.log("using " + count + ' ids');

        var condition = " FK_Plate__ID IN (" + $scope.active.plate_ids.join(',') + ") GROUP BY Plate_Set_Number HAVING COUNT(*) = " + count;
        
        var searchData = {
            scope: { 'Plate_Set' : [ 'DISTINCT Plate_Set_Number as PS'] },
            condition : condition,
        };

        $http.post('/Record/search', searchData)
        .then ( function (result) {
            console.log("RESULT: " + JSON.stringify(result));
            $scope.active.valid_plate_sets = [];
            if (result.data && result.data[0] && result.data[0][0]) {
                for (var i=0; i<result.data[0].length; i++) {
                    $scope.active.valid_plate_sets.push(result.data[0][i].PS);
                }
            }
            console.log("Retrieved SET: " + JSON.stringify($scope.active.valid_plate_sets));
        })
        .catch ( function (err) { 
            console.log("Error getting sets: " + err);
        }); 
    }

    $scope.load_plate_set = function ( options ) {
    	// use set = 'new' to create new set 

    	if (!options) { options = {} }
    	
    	var Samples = options.Samples;
    	var parent = options.parent;  // specfiy parent (only applicable when saving)
    	var existing_set    = options.existing_set;     // load existing set 

    	if (existing_set) { 
    		$scope.active.plate_set = set;
	    	console.log("Retrieved existing plate set: " + $scope.active.plate_set);    		
    	}
    	else {
	        $http.post('/Record/search', { scope : { 'Plate_Set' : [ 'Max(Plate_Set_Number) as MaxPS'] }})
	        .then ( function ( result ) {
	            if (result.data && result.data.results && result.data.results[0]) {
	                var maxPS = result.data.results[0].MaxPS || 1
	                console.log("SAVE SET " + JSON.stringify(maxPS));

	                var data = [];
	                for (var i=0; i< Samples.length; i++) {
	                    var record = { FK_Plate__ID : Samples[i].id, Plate_Set_Number: maxPS+1 , FKParent_Plate_Set__Number: parent }    
	                    data.push(record);
	                }
	           
                    console.log("Save Set: " + JSON.stringify(data));
	                $http.post("record/save", { model: 'plate_set', data: data} )
	                .then (function ( response ) {
	                    $scope.active.plate_set = maxPS + 1;
	                    console.log("SAVED Plate Set: " + $scope.active.plate_set);
	                    $scope.active.valid_plate_sets.push($scope.active.plate_set);
	                })
	                .catch ( function (err) {
	                    $scope.errors.push("Error saving plate set");
	                    console.log("Error saving plate set");
	                })
	            }
	            else { 
                    console.log('max ps result in incorrect format');
                    console.log(JSON.stringify(result.data));
                }
	        })
	        .catch ( function (err) {
	            console.log("Error retrieving max plate set");
	        });
	    }
    }

    $scope.reset_Samples = function reset_Samples () {
        $scope.active.Samples = $scope.original_Samples;
    }

}]);  

