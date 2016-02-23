'use strict';

var app = angular.module('TestModule');

app.controller('TestController', 
    ['$scope', '$http', '$q', 'Nto1Factory',
    function TestController ($scope, $http, $q, Nto1Factory) {

    $scope.title = "Test Controller Page";

    $scope.TestLookup = {};

    $scope.Clinics = [];

    $scope.exampleData = [{'id' : 1, 'label' : 'ABCDEFG'}, { 'id': 2, 'label' : 'HIJKLMNOP'}];

}]);
