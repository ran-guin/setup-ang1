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

        if ($scope.catalog && $scope.catalog.name && $scope.catalog.id) {
            
           $scope.validated.catalog = true;
            
            if ($scope.type == 'Equipment') {
                var url = "/remoteQuery";
                var query = "SELECT Prefix from Stock_Catalog, Equipment_Category WHERE FK_Equipment_Category__ID=Equipment_Category_ID AND Stock_Catalog_ID = " + $scope.catalog.id;

                $http.post(url, { query : query })
                    .then ( function (result) {   
                    console.log(JSON.stringify(result));

                    if (result.data.length) {         
                        var prefix = result.data[0].Prefix + '-';
                        var offset = prefix.length + 1;

                        var condition = "Equipment_Name like '" + prefix + "%'";
                        $scope.next_in_line(
                            { 
                                index: "Mid(Equipment.Equipment_Name," + offset + ',' + '6)', 
                                table: 'Equipment', 
                                fill: false, 
                                condition: "Equipment_Name LIKE '" + prefix + "%'",
                                repeat: $scope.number_in_batch, 
                                prefix: prefix
                            }
                        )
                        .then ( function (result) {
                            $scope.name = result;
                            
                            if ($scope.number_in_batch > 1) {
                                $scope.names = result;
                            }
                            else {
                                delete $scope.names;
                            }
                        })
                        .catch ( function (err) {
                            console.log("Could not find next in line");
                            $scope.validated.catalog = false;                    
                        });
                    }
                    else {
                        $scope.error("Error finding Equipment prefix");
                    }
                })  
                .catch ( function (err) {
                    console.log('Error getting Equipment prefix');
                    $scope.validated.catalog = false;
                });
            }
        }
        else {
            console.log("no catalog " + $scope.catalog + ' : ' + JSON.stringify($scope.catalog));
            $scope.validated.catalog = false;

        }

        $scope.validate_stock_form();

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

        $scope.reset_messages();
        
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
                var firstId = result.data.insertId;
                var count = result.data.affectedRows;

                var msg = "Added Stock Record(s) : " + $scope.type + ' # ' + firstId;
                if (count>1) { 
                    var lastId = firstId + count - 1;
                    msg += '..' + lastId;
                }

                $scope.message(msg);
                var url = '/Stock/received?render=1&limit=1&type=' + $scope.type;
                console.log('call ' + url);
                $scope.injectData(url,'rcvdStock');
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
