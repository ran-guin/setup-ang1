'use strict';

var app = angular.module('myApp');

app.controller('StockController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function stockController ($scope, $rootScope, $http, $q) {

    console.log('loaded stock receipt controller');        

    $scope.context = 'Receiving';

    $scope.received = $scope.datestamp;

    $scope.pick_stock_type = function () {

        console.log("Filter on " + $scope.type);

        // filter catalog 
        var condition = "Stock_Type = '" + $scope.type + "'";
        $scope.setup_Menu('catalog', 'FK(catalog)',condition)
        $scope.validate_stock_form();
    }

    $scope.clear_form = function () {
        $scope.number_in_batch = '';
        $scope.received = null;
        $scope.lot_number = '';
        $scope.catalog = null;
        $scope.notes = '';
        $scope.type = null;
    }

    $scope.validate_stock_form = function () {

        $scope.validated.catalog = $scope.catalog;
        $scope.validated.number = $scope.number_in_batch;
    
        if ($scope.type === 'Equipment') {
            // $scope.split_serial();   // validate to start since this is optional 
            $scope.validated.name = $scope.name;
            console.log("Name ? " + $scope.name);
            console.log(JSON.stringify($scope.validated));
        } 
        else if ($scope.type === 'Reagent') {
            delete $scope.validated.serial;
            delete $scope.validated.name;
        }

        $scope.validate_form();
    }

    $scope.validate_receipt = function () {
       if (! $scope.catalog) {
            console.log("Catalog required");
            $scope.validate.catalog = false ;
        }
        else {
            console.log("passed validation"); 
            $scope.validate.catalog = true;
        }
    }

    $scope.pick_catalog_item = function () {

        $scope.reset_messages();

        var EI = "Mid(Equipment.Equipment_Name, 5, 5)";
        var q = "SELECT " + EI + " AS name from Equipment ORDER BY " + EI;

        if ($scope.catalog && $scope.catalog.name) {
            
            console.log("check catalog");
            $scope.validated.catalog = true;

            $scope.next_in_line({ index: "Mid(Equipment.Equipment_Name, 5, 5)", table: 'Equipment', fill: false, repeat: $scope.number_in_batch, prefix: 'F80-'} )
            .then ( function (result) {
                $scope.name = result;
                
                if ($scope.number_in_batch > 1) {
                    $scope.names = result;
                }
                else {
                    delete $scope.names;
                }

                console.log('Yes' + result + ': ' + $scope.name);
                $scope.validate_stock_form();
            })  
            .catch ( function (err) {
                console.log('uh oh: ' + err);
                $scope.validate_stock_form();
            });
        }
        else {
            console.log("no catalog " + $scope.catalog + ' : ' + JSON.stringify($scope.catalog));
            $scope.validated.catalog = false;
                    
            $scope.validate_stock_form();

        }
    }

    $scope.split_serial = function () {
        
        $scope.reset_messages();

        if ($scope.serial && $scope.number_in_batch) {
            var serials = $scope.serial.split(/\s*,\s*/);
            if (serials.length === $scope.number_in_batch) {
                $scope.serialNumbers = serials;
                $scope.validated.serial = true;
            }
            else { 
                $scope.warning('Number of Serial Numbers must match number in batch')
                $scope.validated.serial = false;
            }
        }
        else {
            console.log("no serial");
        }

        $scope.validate_stock_form();
    }

    $scope.save = function () {
        console.log($scope.received);
   
        if ($scope.expiry && $scope.expiry.constructor === Date ) { $scope.expiry = $scope.mysql_date( $scope.expiry ) }
        if ($scope.received && $scope.received.constructor === Date ) { $scope.received = $scope.mysql_date( $scope.received ) }

    	var StockData = {
    		'number_in_batch' : $scope.number_in_batch,
    		'received'        : $scope.received,
    		'lot_number'      : $scope.lot_number,
    		// 'type'            : $scope.type,
            'catalog'         : $scope.catalog.id,
            'notes'           : $scope.notes,
    	};

    	var data = { Stock : StockData, type: $scope.type };


    	if ($scope.type === 'Reagent') {
    		var subData = {
    			'expiry'            : $scope.expiry,
    			// 'number_in_batch'   : $scope.number_in_batch,
                'qty'               : $scope.qty,
                'qty_units'         : $scope.qty_units,
                'type'              : 'Reagent',
    		};

    		data['Reagent'] = subData;
    	}
        else if ($scope.type === 'Equipment') {

            var name = $scope.name || 'TBD';

            var subData = {
                // 'number_in_batch'   : $scope.number_in_batch,
                'name'              : name,
                'status'            : 'In Use',
            };

            if ($scope.serialNumbers) { subData.serial = $scope.serialNumbers }
            if ($scope.names) { subData.name = $scope.names }

            data['Equipment'] = subData;
        }

        console.log("Post Stock data: " + JSON.stringify(data));
        
        if ($scope.catalog && $scope.catalog.name) {
            $scope.next_in_line({ index: "Mid(Equipment.Equipment_Name, 5, 5)", table: 'Equipment', fill: false, prefix: 'F80-'} )
            .then ( function (result) {
                console.log(result);

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
            })
            .catch (function (err) {
                console.log('error getting next element in list')
            });
        }
        else {
            $scope.warning("Category not yet chosen...");
        }
    }

}]);
