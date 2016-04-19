var app = angular.module('myApp',['ngFileUpload']);

app.controller('CommonController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'CommonFactory', 'Upload', 
    function ($scope, $q, $rootScope, $http, $location, CommonFactory, Upload) {
        console.log('loaded Common Controller');
        console.log(JSON.stringify(app));
        // Automatically Load Lookup Files //
        $scope.loadLookup = function loadLookup(table, id, label) {
        
        	var url = "/lookup/" + table + '/';
        	url = url + id;

        	if (label) { url = url + ':' + label }

       		var got = CommonFactory.loadLookup(url, table);

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

	    },

	    $scope.setField = function (field, value) {
	    	console.log("SET " + field + ' to ' + value);
	    	$scope[field] = value;
	    }

}]);
