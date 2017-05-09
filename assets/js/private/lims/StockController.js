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
        $scope.validate_stock_form('type');
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

        var deferred = $q.defer();

        var promises = [];

        if (context) { $scope.visited[context] = true }

        var check_for_units = ['qty_units'];
        var required = ['catalog','number_in_batch', 'type'];
        var list = ['name','serial'];
        if ($scope.form.type === 'Equipment') {
            required.push('name|name_list');    
        }

        console.log("Call validation...");
        $q.all(promises)
        .then ( function () {
            $scope.validate_form({
                form: $scope.form, 
                required: required, 
                check_for_units: check_for_units,
                list: list,
                count: $scope.form.number_in_batch,
                reset: true,
            })
            .then ( function () {
                deferred.resolve();
            })
            .catch ( function (err) {
                console.log("Error validating form ? " + err);
                deferred.reject();
            })
        })
        .catch ( function (err) {
            console.log("Error pre-validating stock form");
            deferred.reject();
        })
    }

    $scope.pick_catalog_item = function () {

        $scope.reset_messages();

        if ($scope.form.catalog && $scope.form.catalog.name && $scope.form.catalog.id) {
 
            if ($scope.form.type == 'Equipment') {
                $scope.set_equipment_names()
                .then (function (err) {
                    $scope.validate_stock_form('catalog');
                })
                .catch ( function (err2) {
                    console.log("Error setting equipment names");
                    $scope.warning("Error setting equipment name");
                    $scope.validate_stock_form('catalog');                    
                });
            }
            else { $scope.validate_stock_form('catalog') }
        }
        else {
            // console.log("no catalog " + $scope.form.catalog + ' : ' + JSON.stringify($scope.form.catalog));

            // $scope.invalidate('catalog');
            $scope.validate_stock_form('catalog');
        }
    }

    $scope.set_equipment_names = function () {

        var deferred = $q.defer();

        var catalog_id = $scope.form.catalog.id
        var url = "/remoteQuery";
        var query = "SELECT Prefix from Stock_Catalog, Equipment_Category WHERE FK_Equipment_Category__ID=Equipment_Category_ID AND Stock_Catalog_ID = " + catalog_id;

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
                        $scope.form.name_list = result;
                    }
                    else {
                        delete $scope.form.name_list;
                    }
                    deferred.resolve();
                })
                .catch ( function (err) {
                    deferred.reject("Error getting next equipment item");
                    console.log("Could not find next in line");
                });
            }
            else {
                $scope.error("Error finding Equipment prefix");
                deferred.reject("Error getting Equipment prefix");
            }
        })  
        .catch ( function (err) {
            deferred.reject(err);
            console.log('Error getting Equipment prefix');
        });

        return deferred.promise;
    }

    $scope.split_serial = function () {
        $scope.form.serial_list = $scope.form.serial.split(/\s*,\s*/);
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

            if ($scope.form.serial_list) { subData.serial = $scope.form.serial_list }
            if ($scope.form.name_list) { subData.name = $scope.form.name_list }

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
