'use strict';

var app = angular.module('myApp');

app.controller('UserController', 
    ['$scope', '$http', '$q', 'Nto1Factory',
    function clinicController ($scope, $http, $q, Nto1Factory) {

    console.log('loaded user controller');        

    $scope.Clinics = {};

    $scope.context = 'User';

    $scope.initialize = function(config) {
        console.log('load : ' + JSON.stringify(config));

        $scope.setup(config);
        var token = config.token;

        $q.when ($scope.$parent.initialize(config) )
        .then ( function (res) {

            $http.get('/clinic?token=' + token)
            .success ( function (response) {
                console.log("Initialized User page");

                $scope.Clinics = response;
                console.log(JSON.stringify(response));
            })
            .error (function (error) {
                console.log("Error loading clinics");
                console.log(error);
            });  
        });
    }

}]);
