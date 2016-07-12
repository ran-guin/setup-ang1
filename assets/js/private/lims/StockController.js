'use strict';

var app = angular.module('myApp');

app.controller('StockController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function stockController ($scope, $rootScope, $http, $q) {

    console.log('loaded stock receipt controller');        

    $scope.context = 'Receiving';

    $scope.received = $scope.datestamp;

    $scope.save = function () {
    	var StockData = {
    		'number_in_batch' : $scope.number_in_batch,
    		'received'        : $scope.received,
    		'lot_number'      : $scope.lot_number,
    		'type'            : $scope.type,
            'catalog'         : $scope.catalog.id,
            'notes'           : $scope.notes,
    	};

    	var data = { Stock : StockData };


    	if ($scope.type === 'Reagent') {
    		var ReagentData = {
    			'expiry'            : $scope.expiry,
    			'number_in_batch'   : $scope.number_in_batch,
                'qty'               : $scope.qty,
                'qty_units'         : $scope.qty_units,
    		};

    		data['Reagent'] = ReagentData;
    	}

        console.log("Post Stock data: " + JSON.stringify(data));

    	$http.post("Stock/receive", data)
    	.then (function (result) {
    		console.log("GOT: " + JSON.stringify(result.data));
            $scope.message("Added Stock Record(s)")
    	})    	
    	.catch (function (err){
            $scope.error("Error adding Stock Record(s)");
    		console.log("Error receiving stock: ");
            console.log( err );
    	});
    }

}]);
