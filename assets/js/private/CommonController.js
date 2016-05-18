var app = angular.module('myApp',['ngFileUpload']);

app.controller('CommonController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'CommonFactory', 'Upload', 
    function ($scope, $q, $rootScope, $http, $location, CommonFactory, Upload) {
        console.log('loaded Common Controller');
        console.log(JSON.stringify(app));
        
        // Support Basic Password Validation and Confirmation
        // usage: ng-model='repeat' ng-key-up="compare(repeat)"
        
        $scope.passwordValidation = /^[a-zA-Z]\w{3,14}$/;
        $scope.confirmedPassword = false;
        $scope.compare = function (repeatEntry) {
            console.log("Compared " + repeatEntry + " with " + $scope.password);
            $scope.confirmedPassword = $scope.password == repeatEntry ? true : false;
            if ($scope.confirmedPassword) { document.getElementById('confirm_password').style="color:green" }
        }

    	$scope.injectData = function (url, element, ids ) {
    		if (! element) { element = 'injectedData' }

            url = url + '?element=' + element;
            if (ids) { url = url + '&ids=' + ids }


    		var el = document.getElementById(element);
    		if (el) {
                console.log("Calling: " + url);
	    		$http.get(url)
	            .then ( function (result) {
	                console.log("Got API Data...");

	                console.log(JSON.stringify(result));
	                console.log(JSON.stringify(result.data));
	                el.innerHTML = $scope.padded( result.data);
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

    	$scope.padded = function (view) {
    		return view;
    		//return "\n<div class='container' style='padding:20px'>\n" + view + "</div>\n";
    	}

        // Automatically Load Lookup Files //
        $scope.loadLookup = function loadLookup(table, labels, prompt, condition) {
         
        	var url = "/lookup/" + table + '/';

            var options = {};

            if ( labels ) { 
        		url = url + labels;   // defaults to "id:name:label"
        		options.label = labels;
        	}
        	if (prompt) {
        		options.prompt = prompt;
        	}
        	if (condition) {
        		options.condition = condition;
        	}
            
        	url = url + '?';
            console.log("call factory lookup with url: " + url + ':' + JSON.stringify(options));
       		var got = CommonFactory.loadLookup(url, table, options);

       		console.log("Loaded " + table + " Lookup Table");
    	}

        $scope.loadAttributePrompt = function loadAttributePrompt(model, attribute, label, defaultTo) {
        
        	var url = "/attribute/" + model + '/' + attribute + '/';

       		var got = CommonFactory.loadAttributePrompt(url, model, attribute, label, defaultTo);

       		console.log("Loaded " + model + ': ' + attribute + " attribute prompt");
    	}

    	// Automatically generate timestamp attribute along with standard attributes for lastMonth & nextMonth //
	    var start = new Date();
	    $scope.timestamp = start.toISOString().slice(0, 19).replace('T', ' '); 
	        
	    $scope.lastMonth = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000 ).toISOString();
	    $scope.nextMonth = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000 ).toISOString();

	    /** timer with date + hours + minutes - automatically updates  **/
	    var update_seconds = 1;
	    setInterval (function() {
	        var now = new Date();
	        $scope.now = now;

	        $scope.timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
	        $scope.created = now.toISOString().slice(0, 19).replace('T', ' ');

	        $scope.$apply();
	    }, update_seconds*1000);
   
        $scope.setup = function( config ) {

	    }

	    $scope.setField = function (field, value) {
	    	console.log("SET " + field + ' to ' + value);
	    	$scope[field] = value;
	    }

        $scope.updateLookup = function ( lookup ) {
            var model = lookup + '-id';

            var el1 = document.getElementById(model);

            if (el1) {
                $scope[lookup] = el1.value;
                $scope[lookup + '_id'] = el1.value;
                console.log('sync ' + lookup + ' to lookup value: ' + el1.value);
            }
            else {
                console.log("Warning: Could not find " + model + " element to synchronize");
            }
             
            var el2 = document.getElementById(lookup + '-label');

            if (el2) {
                $scope[lookup + '_label'] = el2.value;
                console.log('sync label to  ' + el2.value);
            }
            else {
                console.log("Warning: Could not find " + model + " element to synchronize");
            }
        }

        $scope.updateLookups = function () {
            var lookups = document.getElementsByClassName('lookupMenu');
            for (var i=0; i<lookups.length; i++) {
                console.log("update " + JSON.stringify(lookups[i]));
                var identifier = lookups[i].id;
                $scope.updateLookup(identifier); 
            }
        }

}]);
