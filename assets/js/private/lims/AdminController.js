'use strict';

var app = angular.module('myApp');

app.controller('AdminController', 
['$scope', '$rootScope', '$http', '$q' , 
function adminController ($scope, $rootScope, $http, $q ) {

	$scope.activate_user = function () {

		var access = 'lab';
		if ($scope.make_admin) { access = 'admin' }

		var status = 'active';
		if ($scope.deactivate_user) { status = 'inactive' }

		var data = { user : { id: $scope.limsuser.id, access: access, status: status} };

		$http.post('/User/activate', data)
		.then ( function (response) {
			var msg = "Activated  " + $scope.limsuser.name + " with " + response.data.access + ' access';
			console.log(msg);
			$scope.message(msg);
		})
		.catch ( function (err) {
			console.log("Error: " + err);
			$scope.error("Error granting user access: " + err);
		});
	}

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
			var err = data.error;
			if (err) { 
				var errMsg = $scope.parse_standard_error(msg);
				$scope.error(errMsg);
			}
			else if (msg) {
				$scope.set_default_name();   // set next one if applicable ... 
				$scope.message(msg);
			}

			console.log("Admin returned:" + JSON.stringify(result));
		})
		.catch ( function (err) {
			$scope.error(err);
		})
	}

	$scope.validate_boxname = function () {

		$scope.reset_messages();

		var name = $scope.name;
		if ($scope.parent) {
			var parent = $scope.parent.replace(/^LOC/i,'');
			var q = "SELECT Rack_ID as id FROM Rack WHERE FKParent_Rack__ID = " + parent + " AND Rack_Name = '" + name + "'";
			
			var url = "/remoteQuery";
			console.log(q);
			$http.post(url, { query : q })
			.then ( function (result) {
				if (result.data && result.data.length) {
					var exists = result.data[0].id;
					$scope.name = '';
					$scope.error(name + ' already exists on this Rack [' + $scope.Prefix('location') + exists + '] - Box NOT Created...');
				}
			})
			.catch (function (err) {
				$scope.warning("Error checking for conflict: " + err);
			});
		}
	}

	$scope.set_default_name = function () {
		
		// $scope.reset_messages();
		if ($scope.parent) {
			var parent = $scope.parent.replace(/^LOC/i,'');
			var Bnum = "CAST(Mid(Slot.Rack_Name, 2, 2) AS UNSIGNED)";
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
		console.log("...");
	}
}]);