'use strict';

var app = angular.module('myApp');

app.controller('ViewController', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ViewController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded view controller');

	$scope.view = '';
	$scope.set_page_status('initialized');

	$scope.changed_view = false;

   	$scope.load = function(config) {
        console.log('load : ' + JSON.stringify(config));

    }

	$scope.initialize = function (config) {
		$scope.initialize_payload(config);

		$scope.view = config['view'] || {};
		$scope.id = config['id'] || $scope.view.id;
		$scope.initialPick = config['pick'] || [];

		$scope.form = {
			view_id: '',
			layer: '',
			condition: '',
			show: {},
			search: {},
			from: {},
			until: {},
			field_id: {},
			limit: 1000
		};

		$scope.resetForm();
		
		$scope.data = config['data'];
		$scope.file = config['file'];
		$scope.excel = config['excel'];

		console.log('Config: ' + JSON.stringify(config));
	}

	$scope.resetForm = function () {

		$scope.changed_view = false;

		if ($scope.view) {
			$scope.fields = $scope.view.fields;
			$scope.field_data = $scope.view.field_data;

			$scope.form.view_id = $scope.view.id;
			$scope.form.layer = $scope.view.default_layer;
			$scope.form.condition = $scope.view.condition;
		}

		$scope.pick = $scope.initialPick;
		$scope.show = [];
		$scope.form.show = [];

		if ($scope.pick && $scope.pick.length) {
			for (var i=0; i<$scope.pick.length; i++) {
				console.log('check ' + $scope.pick[i]);
				var fp = $scope.pick[i].match(/(.*) AS (.*)/i);
				if ( fp && fp.length ) {
					var f = fp[1];
					var p = fp[2];
					$scope.show.push(p);
					$scope.form.show[p] = true;
				}
				else {
					$scope.form.show[$scope.show[i]] = true;
					$scope.show.push($scope.show[i]);
				}
			}
		}
	            
		console.log("** FIELDS: " + JSON.stringify($scope.field_data));

		for (var i=0; i<$scope.field_data.length; i++) {
			var prompt = $scope.field_data[i].prompt;
			var field_id = $scope.field_data[i].view_field_id;
			var def_search = $scope.field_data[i].default_search || '';
			
			$scope.view_id = $scope.field_data[i].view_id;

			if (def_search) { console.log(prompt + ' set default condition: ' + def_search) }
			$scope.form.search[prompt] = def_search;
			$scope.form.field_id[prompt] = field_id;

			if ($scope.form.from && $scope.form.from[prompt]) { $scope.form.from[prompt] = '' }
			if ($scope.form.until && $scope.form.until[prompt]) { $scope.form.until[prompt] = '' }

			var f_type = $scope.field_data[i].field_type;
			var def    = $scope.field_data[i].default_search;
		            
			if (f_type && f_type.match(/(enum|dropdown)/i)) {
	            if (def) {
		            $scope.msd[prompt] = [];
		            var def_list = def.split(/\s*[,\n|]\s*/);
		            for (var j=0; j<def_list.length; j++) {
		            	// if (f_type.match(/enum/i)) {
		            	if (def_list[j].match(/^\d+$/)) {
			            	$scope.msd[prompt].push({id: def_list[j]})
			            }
			            else {
			            	$scope.msd[prompt].push({name: def_list[j]})
			            }
		            }
		            console.log('default msd to ' + $scope.field_data[i].default_search);
		            console.log(JSON.stringify($scope.msd[prompt]))
	            }
	            else {
		            $scope.msd[prompt] = [];
	            }
	            console.log('initialize multiselect for ' + prompt);
			}
			else {
				console.log('ignore non-dropdown ' + $scope.field_data[i].field_type);
			}
		}


		$scope.showOptions = true;

		console.log("** INIT VIEW: " + JSON.stringify($scope.view));
		console.log("** SHOW: " + JSON.stringify($scope.show));
		console.log("** Form SHOW: " + JSON.stringify($scope.form.show));

		$scope.filename = null;
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
		
		$scope.set_page_status('loading');

		console.log('validate ranges...');

		$scope.validateForm( {search: $scope.form.search, from: $scope.form.from, until: $scope.form.until})
		.then (function (result) {
			console.log("validated form ...");
			$scope.render = 0;

			var data = {
				view_id : $scope.view.id,
				group  : $scope.form.groupBy,
				layer  : $scope.form.layer,
				search : $scope.form.search,
				select : $scope.show,
				filename : $scope.filename,
				limit  : $scope.form.limit,
				render: $scope.render,
				condition : $scope.form.extra_condition
			}		

			console.log("** FORM: " + JSON.stringify($scope.form));
			console.log("** POST: " + url);
			console.log(JSON.stringify(data));
			console.log("***************");

			$http.post(url, data)
			.then ( function (result) {

				if ($scope.render) {
					 // Not used...
					console.log('try to render results');
					console.log('Rendered: ' + JSON.stringify(result));

					var el = document.getElementById('injectedViewResults');			
					el.innerHTML = result.data;
					$scope.injected = true;
				}

				// $scope.injectRenderedData('injectedViewData', result);
				console.log("requested data generation for this view");

				var data = result.data || {};
				$scope.extra_conditions = data.extra_conditions || 'None';

				$scope.data = data.data || [];

				$scope.layer_data = {};
				if ($scope.form.layer) {
					console.log('separate into data layers... ');
					for (var i=0; i<$scope.data.length; i++) {
						var record = $scope.data[i];

						var l = $scope.data[i][$scope.form.layer];

						if (! $scope.layer_data[l]) {
							$scope.layer_data[l] = [];
						}
						console.log('Layer: ' + l);

						if (i==0) { console.log("First Record: " + JSON.stringify(record)) }
						$scope.layer_data[l].push(record);
					}
					$scope.layers = Object.keys($scope.layer_data);
				}
				else {
					console.log('use single layer for results');
					$scope.layer_data['Results'] = $scope.data;
					$scope.layers = ['Results'];
				}
				$scope.page = $scope.layers[0];

				$scope.query = data.query || '?';



				if (data.message) { 
					$scope.message(data.message)
				}

				if (data.warning) {
					$scope.warning(data.warning)
				}

				if (data.excel) {
					console.log('excel: ' + JSON.stringify(data.excel));
					$scope.excel = data.excel;
					$scope.filename = data.excel.file;
				}
				else {
					$scope.excel = {};
					$scope.warning('no data file generated');
				}

				if (data.error) {
					$scope.error(data.error)
					$scope.showOptions = true;   // close options window 
					$scope.set_page_status('aborted');
				} else {
					$scope.showOptions = false;   // close options window 
					$scope.set_page_status('loaded');
				}

				console.log($scope.data.length + ' Records');
			})
			.catch ( function (err) {
				console.log("Error generating view");
				$scope.error('Error generating view');
				console.log(JSON.stringify(err));
				$scope.set_page_status('aborted')
				$scope.data = null;
			});
		})
		.catch ( function (err) {
			console.log('invalid ranges ' + err)
			$scope.showOptions = true;   // close options window 
			$scope.set_page_status('aborted');

		});
	},

	$scope.setPage = function (layer) {
		$scope.page = layer;
		console.log('set page to ' + layer);
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

		$scope.changedView();
	}

	$scope.changedView = function () {
		$scope.changed_view = true;
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

	$scope.trimmed_hash = function (hash) {
		var keys = Object.keys(hash);
		var Trim = {};

		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			if (hash[k] && hash[k].constructor === String && hash[k].length) {
				Trim[k] = hash[k];
			}
			else if (hash[k]) {
				Trim[k] = JSON.parse(JSON.stringify(hash[k]));
			}
		}
		return Trim;
	}

	$scope.saveView = function () {
		var url = "/saveReport";
		$scope.reset_messages();
		
		console.log("SEARCH: " + JSON.stringify($scope.form.search)); 
		$scope.validateForm( {search: $scope.form.search, from: $scope.form.from, until: $scope.form.until})
		.then (function (validated) {
			console.log("validated form ...");
			$scope.render = 0;

			var overwrite = $scope.form.overwrite || false;

			var data = {
				view_id : $scope.view_id,
				layer  : $scope.form.layer,
				search : $scope.trimmed_hash($scope.form.search),
				select : $scope.show,
				condition : $scope.form.extra_condition,
				custom_name : $scope.view.custom_name,
				overwrite : overwrite,
				field_id  : $scope.trimmed_hash($scope.form.field_id)
			};		

			$http.get("/lookup/custom_view?condition=custom_name='" + $scope.view.custom_name + "'")
			.then ( function (found) {
				var exists = found.data;
				console.log(overwrite + " Exists ? " + JSON.stringify(exists) + exists.length);
				if (exists && exists.length && !overwrite) {
					$scope.error("'" + $scope.view.custom_name + "' Exists.  Select overwrite option or change name");
				}
				else {
					if (exists && exists.length) {
						data.custom_view_id = exists[0].id;
					}
					console.log("** POST: " + url);
					console.log(JSON.stringify(data));
					console.log("***************");

					$http.post(url, data)
					.then ( function (result) {
						console.log(JSON.stringify(result));
						$scope.message("Saved view: " + $scope.view.custom_name);
					})
					.catch ( function (err) {
						console.log("error saving view");
						$scope.error("Error saving view");
					})					
				}
			})
			.catch ( function (Gerr) {
				console.log("Error checking for existing view");
				$scope.error("Could not access existing view list");
			});
		})
		.catch ( function (Verr) {
			console.log("error validating form");
			$scope.error("Form validation error ?");
		});
	}

	$scope.draw = function () {

		var data, file;

		var test = {'F80-1': [{name: 'Alfred', value: 32}, {name: 'Joey', value: 66}], 'F80-3': [4,5,33.32,9]};
		var sets = Object.keys(test);

		console.log('data: ' + JSON.stringify($scope.data));

		for (var i=0; i<sets.length; i++) {
			
			var id = sets[i];
			data = test[id];
			// Test 3 input variations below: 

			// data = [4,5,33.32,9];
			// data = [{name: 'Alfred', value: 32}, {name: 'Joey', value: 66}]
			// file = 'data.tsv'; // $scope.fileData('data.tsv');

			var options = {
				data: data,
				file: file
			}
			console.log(id + ': ' + JSON.stringify(options));
			$scope.d3draw(id, options);
		}
	}
}]);
