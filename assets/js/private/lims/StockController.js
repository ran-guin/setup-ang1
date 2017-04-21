'use strict';

var app = angular.module('myApp');

app.controller('StockController', 
['$scope', '$rootScope', '$http', '$q'  ,   
function stockController ($scope, $rootScope, $http, $q) {

    console.log('loaded stock receipt controller');        

    $scope.context = 'Receiving';

    $scope.form = {};
    $scope.form.received = $scope.datestamp;
    $scope.stockForm = 1;

    $scope.pick_stock_type = function () {

        console.log("Filter on " + $scope.form.type);

        // filter catalog 
        var condition = "Stock_Type = '" + $scope.form.type + "'";
        $scope.setup_Menu('form.catalog', 'FK(catalog)',condition)
        $scope.validate_stock_form();
    }

    $scope.clear_form = function () {
        $scope.form.number_in_batch = '';
        $scope.form.received = null;
        $scope.form.lot_number = '';
        $scope.form.catalog = null;
        $scope.form.notes = '';
        $scope.form.type = null;
    }


    $scope.validated.serial = true;  // optional so initially okay.... 
    $scope.validate_stock_form = function (context) {

        // $scope.validated.catalog = $scope.form.catalog;
        // $scope.validated.number = $scope.form.number_in_batch;
    
        // if ($scope.form.type === 'Equipment') {
        //     // $scope.split_serial();   // validate to start since this is optional 
        //     $scope.validated.name = $scope.form.name;
        //     console.log("Name ? " + $scope.form.name);
        //     console.log(JSON.stringify($scope.validated));
        // } 
        // else if ($scope.form.type === 'Reagent') {
        //     delete $scope.validated.serial;
        //     delete $scope.validated.name;
        // }
        if (context) { $scope.visited[context] = true }

        var required = ['catalog','number_in_batch', 'type'];
        var validate = ['catalog']
        if ($scope.form.type === 'Equipment') {
            required.push('name|names');    
        }

        // Check serial number for matching count with number_in_batch... 
        if ($scope.form.qty && !$scope.form.qty_units) {
            $scope.validate_element('qty_units', false)
        }
        else if ($scope.form.qty && $scope.form.qty_units) {
            $scope.validate_element('qty_units', true)
        }
        else {
            console.log("no qty field");

            $scope.validate_element('qty_units')

            console.log($scope.form.qty);
            console.log($scope.form.qty_units);
        }

        if (! $scope.form.serial) {
            console.log("no serial number ... okay");
        }
        else {
            var list = $scope.form.serialNumbers || [$scope.form.serial];
            if ($scope.form.number_in_batch === list.length) {
                console.log(list.length + " serial numbers supplied (if defined) must match number in batch");
            }
            else {
                $scope.validation_error('serial','Require ' + $scope.form.number_in_batch + ' distinct serial #s (if supplied)');
            }
        }

        console.log("Call validation...");
        $scope.validate_form({form: $scope.form, required: required, validate: validate});
    }

    $scope.validate_receipt = function () {
       if (! $scope.form.catalog) {
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

        if ($scope.form.catalog && $scope.form.catalog.name && $scope.form.catalog.id) {
            
           $scope.validated.catalog = true;
            
            if ($scope.form.type == 'Equipment') {
                var url = "/remoteQuery";
                var query = "SELECT Prefix from Stock_Catalog, Equipment_Category WHERE FK_Equipment_Category__ID=Equipment_Category_ID AND Stock_Catalog_ID = " + $scope.form.catalog.id;

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
                                repeat: $scope.form.number_in_batch, 
                                prefix: prefix
                            }
                        )
                        .then ( function (result) {
                            $scope.form.name = result;
                            
                            if ($scope.form.number_in_batch > 1) {
                                $scope.form.names = result;
                            }
                            else {
                                delete $scope.form.names;
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
            $scope.validate_stock_form('catalog');
        }
        else {
            console.log("no catalog " + $scope.form.catalog + ' : ' + JSON.stringify($scope.form.catalog));

            $scope.validated.catalog = false;
            
            if ($scope.visited.catalog) { $scope.validate_stock_form('catalog') }
            $scope.visited.catalog = true;
            

        }

        // $scope.validate_stock_form();

    }

    $scope.split_serial = function () {
        
        $scope.validation_error('serial',[]);

        if ($scope.form.serial && $scope.form.number_in_batch) {
            var serials = $scope.form.serial.split(/\s*,\s*/);
            if (serials.length === $scope.form.number_in_batch) {
                $scope.form.serialNumbers = serials;
                $scope.validated.serial = true;
            }
            else { 
                $scope.validation_error('serial','Number of Serial Numbers (if supplied) must match number in batch');
                $scope.validated.serial = false;
            }
        }
        else {
            console.log("no serial... ok");
        }

        $scope.validate_stock_form();
    }

    $scope.save = function () {

        $scope.reset_messages();
        
        console.log($scope.form.received);
   
        if ($scope.form.expiry && $scope.form.expiry.constructor === Date ) { $scope.form.expiry = $scope.mysql_date( $scope.form.expiry ) }
        if ($scope.form.received && $scope.form.received.constructor === Date ) { $scope.form.received = $scope.mysql_date( $scope.form.received ) }

    	var StockData = {
    		'number_in_batch' : $scope.form.number_in_batch,
    		'received'        : $scope.form.received,
    		'lot_number'      : $scope.form.lot_number,
    		// 'type'            : $scope.form.type,
            'catalog'         : $scope.form.catalog.id,
            'notes'           : $scope.form.notes,
    	};

    	var data = { Stock : StockData, type: $scope.form.type };

    	if ($scope.form.type === 'Reagent') {
            var subData = {
    			'expiry'            : $scope.form.expiry,
    			// 'form.number_in_batch'   : $scope.form.number_in_batch,
                'qty'               : $scope.form.qty,
                'qty_units'         : $scope.form.qty_units,
                'type'              : 'Reagent',
    		};

    		data['Reagent'] = subData;
    	}
        else if ($scope.form.type === 'Equipment') {

            var subData = {
                // 'form.number_in_batch'   : $scope.form.number_in_batch,
                'name'              : $scope.form.name,
                'status'            : 'In Use',
            };

            if ($scope.form.serialNumbers) { subData.serial = $scope.form.serialNumbers }
            if ($scope.form.names) { subData.name = $scope.form.names }

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

                var msg = "Added Stock Record(s) : " + $scope.form.type + ' # ' + firstId;
                if (count>1) { 
                    var lastId = firstId + count - 1;
                    msg += '..' + lastId;
                }

                $scope.message(msg);
                $scope.stockForm = 0;

                var url = '/Stock/received?render=1&limit=1&type=' + $scope.form.type;
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
