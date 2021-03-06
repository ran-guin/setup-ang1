var app = angular.module('myApp');

app.controller('SharedController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', '$anchorScroll',
    function ($scope, $q, $rootScope, $http, $location, $anchorScroll) {

        console.log('loaded Shared Controller');

        // Generic monitoring of page status (eg initialized / loading / loaded / aborted) ...
        $scope.page_status = 'initialized';
        $scope.set_page_status = function (status) {
            $scope.page_status = status;
        }


        // Generic Messaging attributes / methods 
        $scope.messages = [];
        $scope.warnings = [];
        $scope.errors   = [];
        $scope.persistent = { messages: [], warnings: [], errors: [] };

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

       $scope.set_persistent = function (type, msg) {
            type = type + 's';

            if (Object.keys($scope.persistent).indexOf(type) > -1) {
                $scope[type].push(msg);

                var repeat = $scope.persistent[type].indexOf(msg);
                if ( repeat === -1 ) {
                    $scope.persistent[type].push(msg);
                }
                console.log("Persistent Angular message: " + msg);
            }
            else {
                console.log("invalid persistent type: " + type);
                console.log("Valid types :" + JSON.stringify($scope.persistent));
            }
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
            $location.hash('AngularMsgBlock');
            $anchorScroll();
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
            $location.hash('AngularMsgBlock');
            $anchorScroll();
        }

        $scope.reset_messages = function (tag) {
            $scope.messages = [];
            $scope.warnings = [];
            $scope.errors   = [];

            console.log('Reset messages ' + tag);

            var persistent_types = Object.keys($scope.persistent);

            // retain persistent messages for one more cycle ...
            for (var i=0; i<persistent_types.length; i++) {
                var type = persistent_types[i];

                if ($scope.persistent[type].length) {
                    $scope[type] = $scope.persistent[type];
                    $scope.persistent[type] = [];
                    console.log("retained persistent " + type);
                    console.log(JSON.stringify($scope[type]));
                }
                else {
                    console.log("no persistent " + type);
                }
            }

            $scope.repeat_warnings = {};
            $scope.repeat_errors = {};
            $scope.repeat_messages = {};

        }

        $scope.reset_messages('init');

        $scope.remoteLog = function log(err, level, payload) {
            if (err.constructor === String) {
                msg = err;
                err = { message: msg, context: 'unknown' }
            }
            else {
                msg = err.message
            }

            console.log("Posting " + level + ": " + msg);

            err_string = JSON.stringify(err, ['message', 'context', 'arguments', 'name', 'stack']);

            // requires services/logger.js and route to logger.js 
            $http.post('/log/' + level, { err: err_string, message: msg, payload: payload })
            .then ( function (resp) {
                console.log("err: " + err_string);
                console.log('message ? : ' + msg);
                console.log("log response: " + JSON.stringify(resp));

                if (msg) { 
                    if (level === 'error' || level === 'critical') {
                        $scope.errors.push(msg);
                    }
                    else if (level === 'warning') {
                        $scope.warnings.push(msg);
                    }
                    else if (level === 'debug') {
                        $scope.debug_messages.push(msg);
                    }
                    else {
                        $scope.messages.push(msg);
                    }
                }
            })
            .catch ( function (Lerr) {
                console.log("Error logging message");
            });
        }

        // Generic show / hide functionality 

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
   

        // Generic error & message parsing 
        $scope.parse_standard_error = function (msg, type) {
            // Convert warning / error messages into more readable format
            // (if <match> is included in value, then the regexp of the key will be evaluated and the match replaced in the value string)
            //   eg 'Error creating \\w+' : "<match> - no record created" -> yields "Error creating Employee - no record created" 
            //

            var message = '';
            if (Object.prototype.toString.call(msg) == '[object String]') {
                message = msg;
            }
            else if  (Object.prototype.toString.call(msg) == '[object Array]') {
                message = msg.join('; ');
            }
            else if (Object.prototype.toString.call(msg) == '[object Object]') {
                message = msg.Error || msg.error;
            }
            else if (!message) {
            }
            else {
                message = 'cannot parse error message';
                console.log("Warning: not sure how to parse error type:");
                console.log(Object.prototype.toString.call(msg));
            }

            var errors = [];
            if (message) {
                var Map = {
                    "Duplicate entry '[\\w\-]+'.*" : "<match>",
                    'Unknown column'  : "Unrecognized column in database (?) - please inform LIMS administrator",
                    "Error saving \\w+" : "<match>",
                };

                var strings = Object.keys(Map);
                type = type || 'error';
                for (var i=0; i<strings.length; i++) {
                    
                    var test = strings[i];
                    if (Map[strings[i]].match(/<match>/)) {
                        test = new RegExp(test);
                        console.log("Testing regexp :" + test);
                    }

                    var found = message.match(test);
                    if (found) {
                        console.log("Match found for " + test);
                        var err = Map[strings[i]].replace('<match>', found);
                        errors.push( err );
                    }
                }
                console.log("parsed " + type + " : " + message);
            }
            else {
                console.log("no message");
            }

            if (! errors.length && message) { errors.push(message) }

            for (var i=0; i<errors.length; i++) {
                if (type === 'error') { $scope.error( errors[i] ) }
                else if (type === 'warning') { $scope.warning( errors[i] ) }
                else { $scope.message( errors[i] )}
            }
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
        
        // Generic Block injection methods 

        $scope.injectRenderedData = function(element, rendered) {
            // var opt  = {};
            // if (options) { opt = JSON.parse(options) }

            if (!options) { options = {} }

            if (element && rendered) {
                console.log("Inject rendered data into element: " + element);
                var el = document.getElementById(element);
                el.innerHTML = rendered;
            }
            console.log('done');   
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

//                    console.log(JSON.stringify(result));
//                    console.log(JSON.stringify(result.data));
                    el.innerHTML = $scope.padded( result.data );
                    //el.html($scope.padded( result.data));
                    $scope[element]  = true;
                })
                .catch ( function (err) {
                    err.context = 'injectData';
                    $scope.remoteLog(err, 'warning')
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

app.directive("myHiddenText", function($rootScope) {
    return {
          restrict: 'AEC',
          replace: 'true',
          
          scope: {
            label: '=',
            content: '@',
            colour: '='
          },
          template: "\
            <div class=\"container\">\
                <div ng-show=\"!isVisible\">\
                    <button type=\"button\" onClick='return false;'  data-toggle=\"tooltip\" title=\"open\" ng-click=\"openMe()\">{{label}}<\/button>\
                <\/div>\
                <div ng-show=\"isVisible\" style=\"padding: 10px; background-color:lightyellow; border 1px solid black\">\
                    <button onClick='return false;' data-toggle=\"tooltip\" title=\"close\" ng-click=\"closeMe()\">x<\/button>\
                    <b>{{content}}<\/b>\
                <\/div>\
            <\/div>",

            link: function(scope, element, attrs) {
                scope.isVisible = false;
                scope.label = attrs.label;
                scope.content = attrs.content;
                console.log('init my hidden text');

                scope.closeMe = function () {
                    console.log("close it");
                    scope.isVisible = false;
                }

                scope.openMe = function () {
                    console.log("open up");
                    scope.isVisible = true;
                }
            }

      };
});
