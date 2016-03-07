var app = angular.module('myApp', [ 
        'ngResource',
        'ngRoute',
        'ngCookies',
        'CommonFactory',
        'angularjs-dropdown-multiselect',
        'angularMoment',
        'ngAnimate',
        'ui.bootstrap',
        'angular-loading-bar',
]);


app.constant('urls', {
       BASE: 'http://jwt.dev:8000',
       BASE_API: 'http://api.jwt.dev:8000/v1'
 });


app.factory('httpRequestInterceptor', ['$q', '$location', '$localStorage', 
	function ($q, $location, $localStorage) {
	   return {
	       'request': function (config) {
	           config.headers = config.headers || {};
//	           if ($localStorage.token) {
	               config.headers.addAuthorization = 'Bearer XYZ'; //  + $localStorage.token;
//	           }
	           return config;
	       },
	       'responseError': function (response) {
	           if (response.status === 401 || response.status === 403) {
	               $location.path('/signin');
	           }
	           return $q.reject(response);
	       }
	   };
}]);

app.factory('timestampMarker', [function() {  
    var timestampMarker = {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}]);


app.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.interceptors.push('httpRequestInterceptor');
	$httpProvider.interceptors.push('timestampMarker');
}]);
