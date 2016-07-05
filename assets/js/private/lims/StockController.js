'use strict';

var app = angular.module('myApp');

app.controller('StockController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function stockController ($scope, $rootScope, $http, $q) {

    console.log('loaded stock receipt controller');        

    $scope.context = 'Receiving';

    $scope.type = 'not yet chosen';


    $scope.save = function () {
    	var StockData = {
    		'number_in_batch' : $scope.number_in_batch,
    		'received'        : $scope.received,
    		'lot_number'      : $scope.lot_number,
    		'type'            : $scope.type,
    	};

    	var data = { Stock : StockData };


    	if ($scope.type === 'solution') {
    		var ReagentData = {
    			'expiry'  : $scope.expiry,
    			'number_in_batch' : $scope.number_in_batch,
    		};

    		data['Reagent'] = ReagentData;
    	}

    	$http.post("Stock/receive", data)
    	.then (function (result) {
    		console.log("GOT: " + JSON.stringify(result.data));
    	})    	
    	.catch (function (err){
    		console.log("Error receiving stock: " + err);
    	});
    }

}]);
