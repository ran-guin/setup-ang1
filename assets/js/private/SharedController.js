var app = angular.module('myApp');

app.controller('SharedController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 
    function ($scope, $q, $rootScope, $http, $location) {

        console.log('loaded Shared Controller');

        
        $scope.reset_messages = function () {
            $scope.messages = [];
            $scope.warnings = [];
            $scope.errors   = [];

            $scope.repeat_warnings = {};
            $scope.repeat_errors = {};
            $scope.repeat_messages = {};
        }

        $scope.reset_messages();

        $scope.hide = {};
        $scope.show = {};
        $scope.hide = function (name) {
            $scope.hide[name] = true;
            $scope.show[name] = false;
        }

        $scope.show = function (name) {
            $scope.hide[name] = false;
            $scope.show[name] = true;
        }

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
   
        $scope.message = function (msg) {
            var repeat = $scope.messages.indexOf(msg);
            if (repeat >= 0) {
                if ( $scope.repeat_messages[repeat] ) { $scope.repeat_messages[repeat]++ }
                else { $scope.repeat_messages[repeat] = 2 }
            }
            else {
                $scope.messages.push(msg);
            }
            console.log("Angular Message: " + msg);
        }

        $scope.warning = function (msg) {
            var repeat = $scope.warnings.indexOf(msg);
            if (repeat >= 0) {
                if ( $scope.repeat_warnings[repeat] ) { $scope.repeat_warnings[repeat]++ }
                else { $scope.repeat_warnings[repeat] = 2 }
            }
            else {
                $scope.warnings.push(msg);
            }
            console.log("Angular Warning: " + msg);
        }
        
        $scope.error = function (msg) {
            var repeat = $scope.errors.indexOf(msg);
            if (repeat >= 0) {
                if ( $scope.repeat_errors[repeat] ) { $scope.repeat_errors[repeat]++ }
                else { $scope.repeat_errors[repeat] = 2 }
            }
            else {
                $scope.errors.push(msg);
            }
            console.log("Angular Error: " + msg);
        }

        $scope.parse_standard_error = function (message) {
            // Convert warning / error messages into more readable format
            // (if <match> is included in value, then the regexp of the key will be evaluated and the match replaced in the value string)
            //   eg 'Error creating \\w+' : "<match> - no record created" -> yields "Error creating Employee - no record created" 
            //
            var Map = {
                "Duplicate entry '[\\w\-]+'" : "<match>",
                'Unknown column'  : "Unrecognized column in database (?) - please inform LIMS administrator",
                "Error saving \\w+" : "<match>",
            };

            var strings = Object.keys(Map);

            var errors = [];
            for (var i=0; i<strings.length; i++) {
                
                var test = strings[i];
                if (Map[strings[i]].match(/<match>/)) {
                    test = new RegExp(test);
                    console.log("Testing regexp :" + test);
                }

                var found = message.match(test);
                if (found) {
                    console.log("match found for " + test);
                    var err = Map[strings[i]].replace('<match>', found);
                    errors.push( err );
                }
            }

            console.log("Parsed Error: " + message);
            if (! errors.length) { errors.push(message) }
            return errors;
        }

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
                console.log("Not in formatted form");
                console.log(JSON.stringify(result));
                return result;
            }
        }

        $scope.padded = function (view) {
            return view;
            //return "\n<div class='container' style='padding:20px'>\n" + view + "</div>\n";
        }
        
        $scope.injectData = function (url, element, ids, attribute, options) {
            console.log("INJECT HTML ");
            
            var opt  = {};
            if (options) { opt = JSON.parse(options) }
            var iconify = opt.iconify;

            if (!attribute) { attribute = 'ids'}
            if (! element) { element = 'injectedData' }

            var method = 'POST';  // default 
            if (url.match(/\?/)) { 
                method = 'GET';
                url = url + '&'
            }
            else {
                url = url + '?';
            }

            url = url + 'element=' + element + '&'; // enables close button in injected block
            if (ids) { url = url + attribute + '=' + ids }

            var data = {
                element : element,
                attribute : ids,
                iconify : iconify,
            };

            var el = document.getElementById(element);
            if (el) {
                console.log("Calling: " + url);
                $http({
                    method : method,
                    url : url, 
                    data : data,
                })
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

        // Custom methods ... 
    $scope.Prefix = function Prefix (model) {
        var P = {
            'solution' : 'Sol',
            'plate' : 'BCG',
            'location' : 'Loc',
            'equipment' : 'Eqp'
        };

        return P[model];
    }

}]);
