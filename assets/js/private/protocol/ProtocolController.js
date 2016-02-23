'use strict';

var app = angular.module('myApp');

app.controller('ProtocolController', 
    ['$scope', '$rootScope', '$http', '$q'  ,
    
        function protocolController ($scope, $rootScope, $http, $q) {

            console.log('loaded protocol controller');        
            $scope.context = 'Protocol';

        }
    ]
);
