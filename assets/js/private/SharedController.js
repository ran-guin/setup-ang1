var app = angular.module('myApp');

app.controller('SharedController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 
    function ($scope, $q, $rootScope, $http, $location) {

        console.log('loaded Shared Controller');

        
        $scope.reset_messages = function () {
            $scope.messages = [];
            $scope.warnings = [];
            $scope.errors   = [];
        }

        $scope.reset_messages();

        // Automatically generate timestamp attribute along with standard attributes for lastMonth & nextMonth //

        var start = new Date();
        $scope.datestamp = start.toLocaleString('en-CA').slice(0,10);
        $scope.timestamp = $scope.datestamp + ' ' + start.toLocaleString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false}); 
             
        $scope.lastMonth = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000 ).toISOString();
        $scope.nextMonth = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000 ).toISOString();

        /** timer with date + hours + minutes - automatically updates  **/
        var update_seconds = 1;
        setInterval (function() {
            var now = new Date();
            $scope.now = now;

            // $scope.datestamp = now.toISOString().slice(0, 10).replace('T', ' ');
            $scope.datestamp = now.toLocaleString('en-CA').slice(0,10);
            $scope.timestamp = $scope.datestamp + ' ' + start.toLocaleString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false}); 
            
            $scope.created = $scope.timestamp;

            $scope.$apply();
        }, update_seconds*1000);
   

        $scope.parse_messages = function ( result ) {

            if (result && result.data) {

                // below clears current messages if no new messages generated
                if (result.messages) { $scope.messages = result.messages }
                if (result.warnings) { $scope.warnings = result.warnings }
                if (result.errors)     { $scope.errors = result.errors }

                console.log("Actual result" + JSON.stringify(result));
                console.log("Parsed messages: " + $scope.messages.join(',') );
                
                return result.data;
            }
            else {
                console.log("Not is formatted form");
                return result;
            }
        }

        $scope.padded = function (view) {
            return view;
            //return "\n<div class='container' style='padding:20px'>\n" + view + "</div>\n";
        }
        
        $scope.injectData = function (url, element, ids ) {
            console.log("INJECT HTML");
            if (! element) { element = 'injectedData' }

            if (url.match(/\?/)) { url = url + '&' }
            else { url = url + '?' }

            url = url + 'element=' + element;
            if (ids) { url = url + '&ids=' + ids }


            var el = document.getElementById(element);
            if (el) {
                console.log("Calling: " + url);
                $http.get(url)
                .then ( function (result) {
                    console.log("Got API Data...");

                    console.log(JSON.stringify(result));
                    console.log(JSON.stringify(result.data));
                    el.innerHTML = $scope.padded( result.data );
                    //el.html($scope.padded( result.data));
                    $scope[element]  = true;
                })
                .catch ( function (err) {
                    console.log("Error getting injection data: " + JSON.stringify(err));
                });
            }
            else {
                console.log("element: " + element + ' NOT FOUND !');
            }
        }

        $scope.injectedAlready = function (element) {
            if (! element) { element = 'injectedData' }
            var el = document.getElementById(element);

            if (el && el.innerHTML.length ) { returnVal = true }
            else { returnVal = false }

            // console.log("check " + element + ' = ' + returnVal + ':' + el.innerHTML.length)
            
            return returnVal;
        }

        $scope.uninjectData = function (element) {
            if (! element) { element = 'injectedData' }
            var el = document.getElementById(element);
            if (el) { el.innerHTML = '' }
            else { console.log("could not close " + element) }
            $scope[element] = false;
        }


}]);
