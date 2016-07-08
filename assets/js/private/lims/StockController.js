'use strict';

var app = angular.module('myApp');

app.controller('StockController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function stockController ($scope, $rootScope, $http, $q) {

    console.log('loaded stock receipt controller');        

    $scope.context = 'Receiving';

    $scope.expiry_date = '2015-09-11';  // UTC time ? ... seems to convert to local time (subtracts day ?)
    
    $scope.save = function () {
    	var StockData = {
    		'number_in_batch' : $scope.number_in_batch,
    		'received'        : $scope.received,
    		'lot_number'      : $scope.lot_number,
    		'type'            : $scope.type,
    	};

    	var data = { Stock : StockData };


    	if ($scope.type === 'Reagent') {
    		var ReagentData = {
    			'expiry'            : $scope.expiry,
    			'number_in_batch'   : $scope.number_in_batch,
                'qty'               : $scope.qty,
                'qty_units'         : $scope.qty_units,
                'notes'             : $scope.notes
    		};

    		data['Reagent'] = ReagentData;
    	}

        console.log("Post Stock data: " + JSON.stringify(data));

    	$http.post("Stock/receive", data)
    	.then (function (result) {
    		console.log("GOT: " + JSON.stringify(result.data));
    	})    	
    	.catch (function (err){
    		console.log("Error receiving stock: " + err);
    	});
    }

}]);
