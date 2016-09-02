'use strict';

var app = angular.module('myApp');

app.controller('StockController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function stockController ($scope, $rootScope, $http, $q) {

    console.log('loaded stock receipt controller');        

    $scope.context = 'Receiving';

    $scope.received = $scope.datestamp;

    $scope.filter_catalog = function () {
        console.log("Filter on " + $scope.type);
        var condition = "Stock_Type = '" + $scope.type + "'";
        $scope.setup_Menu('catalog', 'FK(catalog)',condition)
    }

    $scope.clear_form = function () {
        $scope.number_in_batch = '';
        $scope.received = null;
        $scope.lot_number = '';
        $scope.catalog = null;
        $scope.notes = '';
        $scope.type = null;
    }

    $scope.save = function () {
        console.log($scope.received);
   
        console.log($scope.received);

    	var StockData = {
    		'number_in_batch' : $scope.number_in_batch,
    		'received'        : $scope.received,
    		'lot_number'      : $scope.lot_number,
    		// 'type'            : $scope.type,
            'catalog'         : $scope.catalog.id,
            'notes'           : $scope.notes,
    	};

    	var data = { Stock : StockData, type: $scope.type };

        if ($scope.expiry && $scope.expiry.constructor === Date ) { $scope.expiry = $scope.mysql_date( $scope.expiry ) }

    	if ($scope.type === 'Reagent') {
    		var ReagentData = {
    			'expiry'            : $scope.expiry,
    			'number_in_batch'   : $scope.number_in_batch,
                'qty'               : $scope.qty,
                'qty_units'         : $scope.qty_units,
                'type'              : 'Reagent',
    		};

    		data['Reagent'] = ReagentData;
    	}

        console.log("Post Stock data: " + JSON.stringify(data));

    	$http.post("Stock/receive", data)
    	.then (function (result) {
    		var response = result.data;
            console.log("GOT: " + JSON.stringify(result.data));
            
            if (response.error  && response.error.length ) {
                for (var i=0; i<response.error.length; i++) {
                    $scope.error(response.error[i]);
                }
            }
            else {
                $scope.message("Added Stock Record(s)");
                $scope.injectData('/Stock/received?render=1&limit=1','rcvdStock');
            }

            // add barcodes in createNew automatically ... 

            var ids   = result.data.ids;
            var model = result.data.model;

            console.log(model + ": " + ids);

            if (model && ids.length) {
                $scope.print_Labels(model, ids)
                .then ( function (response) {
                    // $scope.message('attempted to print label(s)..');
                    console.log("printed : " + JSON.stringify(response));
                })
                .catch ( function (err) {
                    $scope.error('error printing barcodes');
                    console.log("Error printing barcodes");
                });
            }
            else {
                $scope.error("Error retrieving new model or id(s)");
            }
            
            $scope.clear_form();
    	})    	
    	.catch (function (err){
            $scope.error("Error adding Stock Record(s)");
    		console.log("Error receiving stock: ");
            console.log( err );
    	});
    }

}]);
