'use strict';

var app = angular.module('myApp');

app.controller('UserController', 
    ['$scope', '$http', '$q',
    function userController ($scope, $http, $q) {

    console.log('loaded user controller');        

    $scope.Interests = {};

    $scope.context = 'User';

    $scope.initialize = function(config) {
        console.log('load : ' + JSON.stringify(config));

        //$scope.setup(config);
        var token = config.payload.token;
        var userid = config.payload.userid; 

        $q.when ($scope.initialize_payload(config) )
        .then ( function (res) {
            console.log('generate dashboard for user ' + userid);
            $http.get('/user/' + userid + '?token=' + token)
            .success ( function (response) {
                console.log("Initialized User page");

                $scope.Interests = response.Interests;
                console.log(JSON.stringify(response));
            })
            .error (function (error) {
                console.log("Error loading clinics");
                console.log(error);
            });  
        });
    }

}]);
