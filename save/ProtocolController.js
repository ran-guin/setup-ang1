'use strict';

var app = angular.module('myApp');

app.controller('ProtocolController', 
    ['$scope', '$rootScope', '$http', '$q',
    function protocolController ($scope, $rootScope, $http, $q) {

    console.log('loaded protocol controller');        
    $scope.context = 'Protocol';

    /** timer with date + hours + minutes - automatically updates  **/
    var update_seconds = 1;    
    setInterval (function() {

        if ($scope.recordStatus == 'Draft') { 
          $rootScope.created = $scope.timestamp; 
        }
       
        $scope.$apply();
    }, update_seconds*1000);


    $rootScope.Protocols = [];

    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.setup(config);
        console.log('Protocol setup');

        $rootScope.mainClass = 'Lab_Protocol';
        
        $rootScope.statusField = 'status';
        $rootScope.statusDefault = 'Active';

        /* Customize as Required */

        /* Set protocol details at login ... */
        $rootScope.protocolId = 1;
        $scope.deskStaff = 'Ran';

 
        $scope.$parent.setup(config);
    }

    $scope.syncLookup = function (attribute, id, label) {
          console.log("sync " + attribute);
          console.log(JSON.stringify($scope[attribute]));
          $rootScope[id] = $scope[attribute]['id'];
          $rootScope[label] = $scope[attribute]['label'];
    }

    $scope.initialize = function( config ) {
 
        console.log("protocol initialization...");
        $q.when($scope.setup(config))
        .then ( function () {
            console.log('setup complete');
        })
        .then ( function () {
            $scope.$parent.initialize(config);
            console.log('parent initialization complete');
        })
        .then ( function () {

            $rootScope.highlightBackground = "background-color:#9C9;";
            var highlight_element = document.getElementById('protocolTab');
            if (highlight_element) {
                highlight_element.style=($scope.highlightBackground)
            }

        })
        .then ( function (res) {
            $scope.ac_options = JSON.stringify($scope.Autocomplete);
            $rootScope.manualSet = []; /* 'Request_Notes'];  /* manually reset */
            console.log('parent initialization complete');
        });  

    }

    $scope.loadRecord = function (recordId) {

        var fields = $scope.Fields.join(',');
        var itemfields = $scope.itemFields.join(',');
        $scope.customQuery = "Select " + fields + ',' + itemfields;
        $scope.loadCondition = $scope.mainClass + ".id = '" + recordId + "'";

        $scope.customQuery += " FROM " + $scope.queryTables + " WHERE " + $scope.queryCondition + ' AND ' + $scope.loadCondition;

        console.log($scope.customQuery);
        var url = '/api/q';
        console.log('preload from ' + url);

        /* implement promise */
        var promise =  $scope.$parent.loadRecord(url, recordId, $scope.customQuery);
        $q.when(promise)
        .then ( function (res) {
            // $scope.loadCostCentre();
            // $scope.loadNextStatus();
            Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus); 
            console.log('apply user  ' + $scope.user);

            //$scope.updateTotals();
            $scope.highlightBackground = "background-color:#9C9;";

        });

    }

    $scope.saveChanges = function (status) {
        var data = {

         };         

        var jsonData = JSON.stringify(data);
        var url = '/api/update/' + $scope.mainClass + '/' + $scope.recordId;

        $q.when ($scope.$parent.saveChanges(url, jsonData))
        .then ( function () {
            $scope.loadRecord($scope.recordId);
            console.log('reload ' + $scope.recordId);
            // Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus);  
        });

    }

    /********** Save Request and List of Items Requested **********/
    $scope.createRecord = function() {
            console.log("Post " + $scope.mainClass);

            for (var i=0; i<$scope.include.appointment.length; i++) {

            }

            var data = { 
                'FKDesk_User__ID' : $scope.userid, 
                'Queue_Creation_Date' : $scope.timestamp,
                'FK_Protocol__ID' : $scope.Protocol_ID,
                'Queue_Status' : 'Active',
                'items' : $scope.include.appointment,
                'map'   : $scope.itemSet,
            }; 

            var jsonData = JSON.stringify(data);
            var url = "/queue/create";
            $q.when($scope.$parent.createRecord(url, jsonData))
            .then ( function (response) {
                console.log('got response');
                console.log(response);

                console.log(JSON.stringify($scope.createdRecords));
                var created = $scope.createdRecords[$scope.createdRecords.length-1];
                $scope.recordId = created['id'];

                var link = "Queue #" + $scope.recordId + ' created : ' + created['description']
                console.log('created Queue # ' + $scope.recordId);
                
                $scope.clearScope();
                $rootScope.mainMessage = link;
                // $('#topMessage').html(link);

            });           
    }

}]);
