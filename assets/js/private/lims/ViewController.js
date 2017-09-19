'use strict';

var app = angular.module('myApp');

app.controller('ViewController', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ViewController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded view controller');

	$scope.view = '';

   	$scope.load = function(config) {
        console.log('load : ' + JSON.stringify(config));

    }

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);

		$scope.view = config['view'] || {};
		$scope.id = config['id'];

		$scope.form = {
			view_id: '',
			layer: '',
			condition: '',
			show: {},
			search: {}
		};

		if ($scope.view) {
			$scope.fields = $scope.view.fields;
			$scope.form.view_id = $scope.view.id;
			$scope.form.layer = $scope.view.default_layer;
			$scope.form.condition = $scope.view.condition;
		}

		$scope.show = config['pick'] || $scope.fields || [];
		if ($scope.show && $scope.show.length) {
			for (var i=0; i<$scope.show.length; i++) {
				console.log('check ' + $scope.show[i]);
				var fp = $scope.show[i].match(/(.*) AS (.*)/i);
				if ( fp && fp.length ) {
					var f = fp[1];
					var p = fp[2];
					$scope.form.show[p] = true;
				}
				else {
					$scope.form.show[$scope.show[i]] = true;
				}
			}
		}

		$scope.data = config['data'];
		$scope.file = config['file'];
		$scope.excel = config['excel'];

		$scope.showOptions = true;

		console.log("** INIT VIEW: " + JSON.stringify($scope.view));
		console.log("** SHOW: " + JSON.stringify($scope.show));
		console.log("** Form SHOW: " + JSON.stringify($scope.form.show));

		$scope.filename = null;

		console.log('Config: ' + JSON.stringify(config));
	}

	$scope.addAtt = function(field) {
		console.log("force inclusion of attribute: " + field);
		$scope.form.show[field] = true;

		$scope.updateList('show',field);
	}

	$scope.generate = function () {
		var url = "/getReport/run";
		var options = $scope.view || {};

		$scope.reset_messages();

		var data = {
			view_id : $scope.view.id,
			group  : $scope.form.groupBy,
			layer  : $scope.form.layer,
			search : $scope.form.search,
			pick : [],
			filename : $scope.filename,
			limit  : 1000
			// condition : $scope.condition
		}		

		if ($scope.form.show) {
			console.log(JSON.stringify($scope.form.show));
			var fields = Object.keys($scope.form.show);
			if (fields && fields.length) {
				for (var i=0; i<fields.length; i++) {
					if ($scope.form.show[fields[i]]) {
						data.pick.push(fields[i]);
					}
				}
			}
		}

		console.log("FORM: " + JSON.stringify($scope.form));
		console.log("POST: " + url);
		console.log(JSON.stringify(data));

		$http.post(url, data)
		.then ( function (result) {
			console.log("requested data generation for this view");
			
			var data = result.data || {};
			$scope.data = data.data || [];
			$scope.query = data.query || '?';

			$scope.showOptions = false;   // close options window 

			if (data.message) { 
				$scope.message(data.message)
			}
			if (data.error) {
				$scope.error(data.error)
			}
			if (data.warning) {
				$scope.warning(data.warning)
			}

			if (data.excel) {
				console.log('excel: ' + JSON.stringify(data.excel));
				$scope.excel = data.excel;
				$scope.filename = data.excel.file;
			}

			console.log($scope.data.length + ' Records');
		})
		.catch ( function (err) {
			console.log("Error generating view");
			$scope.error('Error generating view');
			console.log(JSON.stringify(err));
			
			$scope.data = null;
		});
	},

	$scope.updateList = function (list, item) {
		console.log("update " + list + ' with ' + item);

		console.log('L1: ' + JSON.stringify($scope[list]));
		if ($scope.form[list][item]) {
			if ($scope[list].indexOf(item) === -1) {
				console.log('add ' + item);
				$scope[list].push(item);
			}
			else { console.log('already included ' + item) }
		}
		else {
			console.log('remove ' + item);
			var index = $scope[list].indexOf(item);
			if (index >= 0) {
				$scope[list].splice(index, 1);
			}
			
		}
	}

	$scope.regenerate = function () {
		console.log("regenerate...");
		$scope.generate();
	}

	$scope.download = function () {
		if ($scope.file) {

			var url = '/download';
			var options = { file: $scope.file };

			$http.post(url, options)
			.then ( function (result) {
				console.log('downloaded file: ' + $scope.file);
			})
			.catch ( function (err) {
				console.log("Error downloading file");
			})
		}
		else{
			console.log("no file to download - remember to select 'generate excel file' when generating results");
		}
	}

	
}]);
