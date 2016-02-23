var app = angular.module('myApp');

app.controller('Nto1Controller', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'Nto1Factory', 
    function ($scope, $q, $rootScope, $http, $location, Nto1Factory) {
        console.log('loaded Nto1 Controller');

   $scope.$on('parametersExtended', function () {
        console.log('extended parameters');
        $rootScope.Shown = Nto1Factory.Shown;
        $rootScope.SearchOn = Nto1Factory.SearchOn;
        $rootScope.Hidden  = Nto1Factory.Hidden;
        $rootScope.Autocomplete   = Nto1Factory.Autocomplete;

        $rootScope.attributes = Nto1Factory.attributes;
        $rootScope.Reset = Nto1Factory.Reset;
        $rootScope.Map = Nto1Factory.Map;
        $rootScope.Type = Nto1Factory.Type;
        $rootScope.Set = Nto1Factory.Set;

        $rootScope.Fields = Nto1Factory.Fields;
        $rootScope.itemFields = Nto1Factory.itemFields;

        $rootScope.item_attributes = Nto1Factory.item_attributes;
        $rootScope.itemReset = Nto1Factory.itemReset;
        $rootScope.itemMap = Nto1Factory.itemMap;
        $rootScope.itemSet = Nto1Factory.itemSet;

        console.log('extended Column & Autocomplete info');
    });

   $scope.$on('setClasses', function () {
        console.log('set Classes');
        $rootScope.highlightOn = Nto1Factory.highlight;
        $rootScope.highlightClass = Nto1Factory.highlightClass;

        console.log($scope.highlightOn);
        for (var status in $scope.highlightOn) {
            status = status.replace(/\s/g,'');
            $rootScope[status + 'Class'] = $scope.highlightOn[status];
            console.log(status + ' = ' + $scope[status + 'Class']);   
        }
   });

    $rootScope.pendingChanges = [];

    $rootScope.config = {};

    $rootScope.saved = {};

    $scope.reloadConfig = function () {
        if ($scope.config) {
            $rootScope.url = $scope.config['url'] ;
            $rootScope.token = $scope.config['token'];
            $rootScope.userid = $scope.config['userid'];
            $rootScope.user = $scope.config['user'];
            $rootScope.recordId = $scope.config['recordId'];
            console.log('reloaded config: ' + $scope.url + ' : ' + $scope.user +  ' -> ' + $scope.token);
        }
    }

    $scope.setup= function (config) {
        console.log('generic setup');
        console.log("SETUP CONFIG: " + JSON.stringify(config));
        if (config) {
            $rootScope.config = config; // JSON.parse(config);           
        }
        
        $scope.reloadConfig();
    }

        /********** Initialize **********/
    $scope.initialize = function(config) {
        $rootScope.debugMode = 0;

        /* DemoSevice extends above specs into more attributes: Map Set, attributes, itemMap, itemReset, item_attributes  */
       
        console.log("Initializing..." + $scope.itemClass);

        $rootScope.items = [];
        $rootScopeinclude = {};

        $rootScope.include = {};
        if ($scope.itemClass) {
             $rootScope.include[$scope.itemClass] = [];
             $rootScope.genarray = [];
             console.log("EMPTY INCLUDE ITEM " + $scope.itemClass) ;
             console.log("TEST GENARRAY " + $scope.genarray.length);
             console.log("LENGTH = " + $scope.include[$scope.itemClass].length);
        }      
        console.log("setup include object...");
        $rootScope.activeIndex = 0;

            
        console.log("** config:" + JSON.stringify(config));
        // $scope.username = $rootScope.getUsername();
        $rootScope.username = config['user'];
    
        $rootScope.submitted = [];
        $rootScope.createdRecords = [];
        $rootScope.editedRecords = [];

        /** Initialize smartSearch options **/
        return; 
    }

    $scope.saveRecord = function () {
        if ($scope.recordId) {
            $scope.updateRecord();
        }
        else {
            console.log('no record id to update');
        }
    }

    $scope.activateIndex = function (index) {
        console.log('set active index to ' + index);
        $rootScope.activeIndex = index || 0;
    }

    $scope.cloneRecord = function () {
        console.log("Clone Record " + $scope.recordId);
    }
     
    /** POST TO DATABASE **/
    $scope.createRecord = function (url, jsonData) {

        console.log('url: ' + url);
        console.log('data: ' + jsonData);
        
        return $http.post(url, jsonData )
            .success ( function (response) {
                console.log("Posted successfully");

                $rootScope.createdRecords.push({ 'id' : response['Record_ID'], 'description' : response['Description']});
            })
            .error (function (error) {
                console.log("Error saving record");
                console.log(jsonData);
                console.log(error);
            });
    }  

    $scope.recordChanged = function (field) {
        console.log("Changed " + field);
    }  

    $scope.saveChanges = function ( url, jsonData ) {
        var currentStatus = $scope.recordStatus;

        return $http.post(url, jsonData)
                .success ( function (response) {
                        console.log("saved changes");
                        console.log(url);
                        console.log(jsonData);
                })
                .error ( function (error) {
                        console.log("Error updating record "  + error);
                });
               
    }

    $scope.newItem = function (jsonData) {
        console.log('new item: ' + jsonData);
        return  $http.post("/record/insert/" + $scope.itemClass, jsonData ).
            success ( function (response) {
                console.log("Added New Record");
                var itemId = response['record_ID'];
                var recordDescription = response['Description'];
                var link = "<div class='alert alert-warning'><A href ='/record/Item/" + itemId + "?format=html'> New Item #" + itemId + ' - ' + recordDescription + "</A></div>\n";
                
                $rootScope.itemId = itemId;

                $('#topMessage').html(link);
                $('#newItemModal').modal('hide');
                $('#message').html("<div class='alert alert-warning'>Added New Record ...</div>");
                console.log(response);
                        $('#internalMessage').html('');
            }).
            error (function (response) {
                    console.log("Failed to Insert");    
        });

    }

    /********** Save Request and List of Items Requested **********/

    $scope.toggleDebugMode = function() {
        console.log('toggle Debug Mode');
        if ($scope.debugMode) {
            $rootScope.debugMode = 0;
            console.log('toggle debug mode OFF');
        }
        else {
            console.log('toggle debug mode ON');
            $rootScope.debugMode = 1;
        }
    }

    /** Generate hash to stoer lookup tables **/
    $rootScope.Lookup = {};

    $scope.loadLookup = function (url, table, model, def, condition, index) {
        /* Requirements: jquery, lodash, angular, + initialize model as array in controller */
        
        console.log("load lookup table: " + table);
        if (!model) { model = table }
        
        if ($scope.Lookup[table]) {
            console.log('already loaded ' + table);
        }
        else {
            $rootScope[model] = {};

            Nto1Factory.loadLookup(url, table, model, def);
        }

        if (index != undefined) { 
            var xModel = model || table;
            xModel +=  index;
            $rootScope[xModel] = {};
            console.log('SET ' + xModel);
        }
    }

    $scope.$on('loadedLookup', function (event, args) {
        var table = args['table'];
        var model = args['model'];

        $rootScope.Routes = {}; 

        var m = model.replace(/^.*\./,'');
        // .replace(/^.*\./,'');;
        
        console.log('synced ' + table + ' Lookup : ' + model);
        $rootScope.Lookup[m] = Nto1Factory.Lookup[table];

        var def = Nto1Factory.Lookup[table]['value'];
        console.log('default = ' + JSON.stringify(def));
  
        if (def != undefined) {
            console.log('Set default ' + model + ' to ' + JSON.stringify(def));
            $rootScope[model] = def;
        }
        console.log(table + ' lookup ' + model + ' = ' + JSON.stringify($scope.Lookup[model]));
    });


    $scope.$on('listUpdated', function () {
        
        var model = Nto1Factory.updatedModel;

        console.log("updated " + model);

        $rootScope.include[model] = Nto1Factory.include[model];
        $rootScope.items = $scope.include[model]
        console.log(' service updated list to ' + JSON.stringify($scope.include[model]));
   });

    $scope.editMode = function (toggle) {
        if (toggle) {
            if ($scope.uiMode == 'Edit' ) { $rootScope.uiMode = '' }
            else { $rootScope.uiMode = 'Edit' }
        }
        else { $rootScope.uiMode = 'Edit' }

    }

    $scope.dumpHash = function (hash) {
        var keys = Object.keys(hash);
        if (keys && keys.length) {
            for (var i=0; i<keys.length; i++) {
                console.log("** : " + keys[i] + " = " + JSON.stringify(hash[keys[i]] ));
            }
        }
        else if (keys) {
            console.log("hash is empty");
        }
        else {
            console.log("argument is not a hash");
        }
    }

    $scope.dumpScope = function () {
        console.log("*** Dumped Attribute List **");
        for (var i= 0; i<$scope.attributes.length; i++) {
            var att = $scope.attributes[i];
            console.log(att + ' = ' + $scope[att]);
        }
        console.log("** Items: **");
        for (var i= 0; i<$scope.include[model].length; i++)  {
            console.log(JSON.stringify($scope.include[model][i]))
        }

        for (var i= 0; i<$scope.items.length; i++)  {
            console.log("* V " + JSON.stringify($scope.items[i]))
        }


        console.log("** Lookups: **");
        console.log(JSON.stringify($scope.Lookup));
        console.log("** Column/Fields **");
        console.log('search on: ' +JSON.stringify($scope.SearchOn));
        console.log('show: ' +JSON.stringify($scope.Shown));
        console.log("set: " + JSON.stringify($scope.Set));
        console.log("item set: " + JSON.stringify($scope.itemSet));
    }

    /********** Load Existing Request from Database **********/
    $scope.loadRecord = function(urlRequest, recordId, query) {
        console.log('load Record: ' + recordId);
        var recordData = [];

        var itemClass = $scope.itemClass;

        if (!urlRequest || !recordId) { console.log("Error loading record without url and recordID"); return $q.when(null) }
        
        $scope.clearScope();

        var jsonData = JSON.stringify( { 'query' : query } );

        // Use post to prevent parameters length limitations in GET
        return $http.post(urlRequest, jsonData)
        .success ( function (response) {
            console.log('Loaded: ' + JSON.stringify(response) ); 
            recordData = response; 
            
            $scope.reloadConfig();

            $rootScope.items = [];  
            
            if (! $scope.include[itemClass]) { $rootScope.include[itemClass] = [] }

            for (var i=0; i<recordData.length; i++) {
                 if (i == 0) {
                     for (var att in $scope.Map) {
                        var field = $scope.Map[att];
                        var type = $scope.Type[att];
                        if ( (type == 'date') && recordData[0][att]) {
                            var stamp = recordData[0][att];
                            console.log('get ' + att + ' date from ' + stamp);
                            $rootScope[att] = recordData[0][att].substring(0,10);
                        }
                        else { $rootScope[att] = recordData[0][att] }
            
                        console.log(att + " = " + $scope[att]);
                     }
                 }
 
                 var thisitem = {};

                 for (var att in $scope.itemMap) {
                     var field = $scope.itemMap[att];
                     if (recordData[i][att] === undefined ) { 
                        console.log(att + ' is not defined');
                        continue; 
                     }

                     if ( field.match(/date/i) && recordData[i][att]) { thisitem[att] = recordData[i][att].substring(0,10) }
                     else { thisitem[att] = recordData[i][att]; }
                 }
                 
                 thisitem['Total'] = thisitem['Cost'] * thisitem['Qty'];
                 thisitem['saved'] = 1;

                 $rootScope.items.push(thisitem);
                $rootScope.include[itemClass].push(thisitem);


                 $rootScope.pendingChanges = [];
                 console.log('added item ' + i + ':' + JSON.stringify(thisitem));
                 console.log($scope.items.length + "Total items added");
                 console.log($scope.include[itemClass].length + "Total items added");
            }
            console.log($scope.include[itemClass].length + "Total items added");
            console.log($scope.items.length + "Total items added");

        })
        .error ( function (error) {
            console.log("Error retrieving record: " + urlRequest );
            console.log("Q: " + query);
        });

    }   

    $scope.putRecord = function (model, id, data) {
        if (model && id && data) {
            var url = '/' + model + '/' + id;


            var JSONdata = data;
            if (typeof JSONdata != 'string' ) {
                // not yet stringified... 
                console.log('stringify object');
                JSONdata = JSON.stringify(data);
            }
            else { console.log("using original string") }

            return $http(
            {
                method : 'PUT',
                url : url,
                data : JSONdata,
                headers : { authorization : 'Bearer ' + $scope.token },
            })
            .then ( function (res) {
                console.log("Updated : " + model + ' : ' + id + ' => ' + JSONdata);                 
                //$scope.createdRecords.push({ 'id' : response['Record_ID'], 'description' : response['Description']});
    
            }); 
        }
        else {
            if (!model) { console.log("Missing model") }
            if (!id) { console.log("Missing id") }
            if (!data) { console.log("Missing data") }
        }
    }

    $scope.deleteRecord = function (model, id) {
       if (model && id) {
            var url = '/' + model + '/' + id;

            return $http(
            {
                method : 'DELETE',
                url : url,
                headers : { authorization : 'Bearer ' + $scope.token },
            })
            .then ( function (res) {
                console.log("Deleted : " + model + ' : ' + id );                 
                //$scope.createdRecords.push({ 'id' : response['Record_ID'], 'description' : response['Description']});
            }); 
        }
        else {
            if (!model) { console.log("Missing model") }
            if (!id) { console.log("Missing id") }
        }        
    }

    $scope.addRecord = function (model, data) {
        var url = '/' + model;
        var JSONdata = JSON.stringify(data);

        return $http(
            {
                method : 'POST',
                url : url,
                data : JSONdata,
                headers : { authorization : 'Bearer ' + $scope.token },
            })
            .then ( function (res) {
                console.log("POSTED : " + JSONdata);      
            }); 
    }

    /********** Save Item **********/
    $scope.saveItem = function (index, model, fields) {

        // var keys = Object.keys($scope.items[index]);
        var keys = fields || Object.keys($scope.include[model][index]);
        //var keys = $scope.Autocomplete.update.split(/,/);
        var data = {};

        console.log("SAVE " + model + ": " + JSON.stringify($scope.include[model]));
        for (var j=0; j<keys.length; j++) {
            var key = keys[j];
            var vType = typeof $scope.include[model][index][key];

            console.log(index + " KEY: " + key + " = " + vType)

            if ( $scope.include[model][index][key] && vType == 'object' ) {
                console.log("Detected Object: " + JSON.stringify($scope.include[model][index][key]));
                // load either object attribute or alias (eg patient.id or 'patient_id')
                data[key] = $scope.include[model][index][key]['id'] || $scope.include[model][index][key + '_id']; 
                console.log("SET OBJECT " + key + ' = ' + data[key]);
            }
            else if ( $scope.include[model][index][key] && typeof vType != 'object' ) {
                data[key] = $scope.include[model][index][key];
                console.log("SET VALUE " + key + ' = ' + data[key]);
            }
            else if ($scope.include[model][index][key] && $scope.include[model][index][key][key + '_id']) {                                console.log("SET OBJECT " + key);
                data[key] = $scope.include[model][index][key][key + '_id'];
                console.log("ONLY SET ID for " + key + ' = ' + data[key]);
            }
            else if ($scope.include[model][index][key] && $scope.include[model][index][key]['id']) {
                data[key] = $scope.include[model][index][key]['id'];
                console.log("USE DEFINED ID for " + key + ' = ' + data[key]);
            }
            else {
                console.log(key + " not defined for " + model + ' #' + index);
            }
        }       

        var JSONdata = JSON.stringify(data);
 
        console.log(i + " SaveData: " + JSONdata);
        var url = '/' + model;
        console.log('model: ' + model + ' -> ' + url) ;
        //var header = { 'Authorization' : $scope.token };

        // update database using waterline built in functions ...  
        return $http({
            method : 'POST',
            url : url,
            data : JSONdata,
            headers : { authorization : 'Bearer ' + $scope.token },
        })
            //.post(url, JSONdata)
/*
        {
            url : url, 
            data : JSONdata, 
        })
 */
        .success ( function (res) {
            $rootScope.include[model][index]['DBstatus'] = 'saved';
            console.log("Saved item: " + JSON.stringify(res));
        }); 
    }

    /********** Delete Item **********/
    $scope.deleteItem = function (model, index) {

        if (! model) { model = $scope.itemClass }

        console.log('delete ' + model + ' ' + index);
        var id = $scope.include[model][index].id;

        $rootScope.include[model].splice(index, 1);

        if (id) { $scope.deleteRecord(model, id) }
        else { console.log("Error : ID not found for " + model + ' #' + index) }

        $scope.notePendingChange("Deleted Item(s) " + index);  

   }
        
    $scope.notePendingChange = function (message) {
        $rootScope.pendingChanges.push(message);
        console.log("noted pending change: " + message);
    }
    
    $scope.notePendingChange = function (message) {
        $rootScope.pendingChanges.push(message);
        console.log("noted pending change: " + message);    
    }
   
    $scope.clearItem = function () {
        for (var i=0; $i < $scope.item_attributes.length; i++) {
            var att = $scope.item_attributes[i];
            var searchElement = 'item' + att;
            $rootScope[searchElement] = '';
        }
    }

    $scope.clearScope = function (model) {
        $rootScope.items = [];
        $rootScope.include[model] = [];

        for (var i=0; i < $scope.attributes.length; i++) {
            var att = $scope.attributes[i];
            $rootScope[att] = '';
        }
        
        console.log('cleared record');
       
        if ($scope.manualSet) {
            console.log('manually clear elements');
            for (var i=0; i < $scope.manualSet.length; i++) {
                var id = $scope.manualSet[i];
                console.log('clear element ' + id);
                var element = document.getElementById(id);
                if (element === undefined || element === null ) { console.log($scope.manualSet[i] + ' not syncable') }
                else {
                    element.value = '';
                }
            }
        }

        $scope.reloadConfig();

        $rootScope.recordId = '';
        $rootScope.mainMessage = '';
        var msgElement = document.getElementById('message');
        if (msgElement) { console.log('clear message'); msgElement.value = '' }
        else { console.log('no message') }

        // $('#topMessage').val('reset');
    }

    /** Custom Actions **/
    /* enable specific atts to be inherited from item to main class - alert on conflict */
    $scope.inheritItemAttribute = function (index, atts, errMsg) {
        
        var conflicts = [];
        var model  = $scope.itemClass;

        for (var i=0; i<atts.length; i++) {
            var att = atts[i];
            var current = $scope[att];
            if (current == undefined) {
                $rootScope[att] = $scope.include[model][index][att];
                console.log('set ' + att + ' to ' + $scope[att]);
            }
            else if (current == $scope.include[model][index][att]) {
                console.log(att + ' concurs...');
            }
            else {
                console.log(att + ' conflict');
                conflicts.push(att);
            }
        }

        if (conflicts.length) {
            alert(errMsg);
            console.log(errMsg);
        }
    }

    $scope.loadNextStatus = function(newStatus) {
        console.log('determine next status level');
        if (newStatus) { $rootScope.nextStatus = newStatus }
        else {
            console.log("check " + $scope.statusOptions.length + " status options");
            for (var i=0; i<$scope.statusOptions.length; i++) {
                var thisStatus = $scope.statusOptions[i];
                var nextStatus = $scope.statusOptions[i+1];
                console.log('compare ' + $scope.recordStatus + " with " + thisStatus);
                if ($scope.recordStatus == thisStatus) { 
                    $rootScope.nextStatus = nextStatus;
                    console.log('next status level = ' + $scope.nextStatus);
                    break;
                }
            }
        }
    }

    /** Standards **/

    /** default lookup menu settings **/
    $rootScope.MenuSettings = {
        closeOnSelect: true,
        selectionLimit: 1,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false,
        externalIdProp: '',
        smartButtonMaxItems: 1,
        smartButtonTextConverter: function(itemText, originalItem) {
            return itemText;
        }
    };

    /** syncronize lookup id / label with attribute **/
    $scope.syncLookup = function (attribute, id, label) {
        $rootScope[id] = $scope[attribute]['id'];
        $rootScope[label] = $scope[attribute]['label'];
        console.log("synced " + attribute + ' -> ' + $scope[id] + " = " + $scope[label]);
    }

   /*** Incomplete **/
    $scope.updateRecord = function () {
        console.log('update record');
    }

    $scope.searchItem = function() {
        console.log('search item..');
    }
    
    $scope.selectItem = function () {
        console.log("SELECTING");
    }


}]);
