'use strict';

var app = angular.module('myApp');

app.controller('AdminController', 
['$scope', '$rootScope', '$http', '$q' , 
function adminController ($scope, $rootScope, $http, $q ) {

	$scope.newSlottedBox = function () {

		$scope.reset_messages();
		var url = "/Rack/newBox";

		var data = {
			name : $scope.name,
			parent : $scope.parent,
			size   : $scope.size,
		}

		$http.post(url, data)
		.then ( function (result) {
			var data = result.data;
			var msg = data.message;
			console.log("admin returned:" + JSON.stringify(result));
			$scope.message(msg);
			console.log("MESSAGE: " + msg);
			console.log(JSON.stringify(result));
		})
		.catch ( function (err) {
			$scope.error(err);
		})
	}

	$scope.set_default_name = function () {
		
		$scope.reset_messages();
		if ($scope.parent) {
			var parent = $scope.parent.replace(/^LOC/i,'');
			var Bnum = "CAST (Mid(Slot.Rack_Name, 2, 2) AS UNSIGNED)";
			var q  = "SELECT Rack.Rack_Type as type," + Bnum + " AS Bnum FROM Rack LEFT JOIN Rack as Slot ON Slot.FKParent_Rack__ID=Rack.Rack_ID WHERE Rack.Rack_ID = " + parent + " ORDER BY " + Bnum;

			var rack_alias = 'Loc #';

			var url = "/remoteQuery";
			console.log(q);
			$http.post(url, { query : q })
			.then ( function (result) {
				var N = null;
				if (result.data && result.data.length) {
					var type = result.data[0].type;
					if (type === 'Rack') {
						if (result.data[0].Bnum === null) {
							N = 1;
						}
						else {
							var boxes = _.pluck(result.data,'Bnum');
							console.log(result.data.length + " Boxes: " + boxes.join(','));
							for (var i=1; i<=boxes.length; i++) {
								if ( boxes.indexOf(i) === -1 ) {
									N = i;
									console.log(N + " Missing " + i);
									i = result.data.length + 1;
								} 
								console.log(N + ' found : ' + i);
							}
							if ( !N ) { N = result.data.length + 1 }
						}
						$scope.message("Next available box: B" + N);
					}
					else {
						$scope.error("You must scan a 'Rack' location to store box on. " + rack_alias + parent + ' is a ' + type);
					}
				}
				else if (result.data && result.data.length == 0) {
					$scope.error("Could not find " + rack_alias + parent);
				}
				else { 
					$scope.error("Error retrieving next slot");
				}

				if (N) { $scope.name = 'B' + N.toString() }
			})
			.catch( function (err) {
				console.log("Error getting siblings from parent: " + parent);
			});
		}
		else { console.log("no parent or name ... skipping autoset") }

	}
}]);