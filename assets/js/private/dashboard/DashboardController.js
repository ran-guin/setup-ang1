var app = angular.module('myApp');

app.controller('DashboardController', ['$scope', '$http', 'toastr','Nto1Factory',
	function($scope, $http, toastr, Nto1Factory) {

    // set-up dashboard
    $scope.title = 'Dashboard Title';


   var start = new Date();
    $scope.timestamp = start.toISOString().slice(0, 19).replace('T', ' '); 

    /** timer with date + hours + minutes - automatically updates  **/
    var update_seconds = 1;
    setInterval (function() {
        var now = new Date();
        $scope.now = now;
        $scope.timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        $scope.created = now.toISOString().slice(0, 19).replace('T', ' ');

        $scope.$apply();
    }, update_seconds*1000);


}]);
