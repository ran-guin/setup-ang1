'use strict';

var app = angular.module('myApp');

app.controller('D3Controller', 
    ['$scope', '$rootScope', '$http', '$q' , 
    function ViewController ($scope, $rootScope, $http, $q) {  
  
    console.log('loaded D3 controller');

	$scope.d3draw = function (id, options) {

		if (!options) { options = {} }
		if (!id) { id = 'chart' }

		var data = options.data;
		var file = options.file;

		var width = 420,
		    barHeight = 40;

		if (data) {
			console.log('data supplied: ' + JSON.stringify(options.data))
			$scope.drawData(id, data);
		}
		else if (file) {

			var wrapper = d3.select('#d3block');   // this is the one element in the page that should be defined... 
			
			console.log("data file supplied: " + options.file);
			var x = d3.scale.linear()
			    .range([0, width]);

			var chart = wrapper.append('svg')
				.attr('class', 'd3chart')
				.attr('id', id)
			    .attr("width", width);

			console.log('draw data from file...');
			d3.tsv(options.file, type, function(error, data) {
				x.domain([0, d3.max(data, function(d) { return d.value; })]);

				chart.attr("height", barHeight * data.length);

				var bar = chart.selectAll("g")
				  .data(data)
				.enter().append("g")
				  .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

				bar.append("rect")
				  .attr("width", function(d) { return x(d.value); })
				  .attr("height", barHeight - 1);

				bar.append("text")
				  .attr("x", function(d) { return x(d.value) - 3; })
				  .attr("y", barHeight / 2)
				  .attr("dy", ".35em")
				  .text(function(d) { return d.name; });
			});

			function type(d) {
			  d.value = +d.value; // coerce to number
			  return d;
			}
		}
		else {
			console.log('no data or file suppliec');
		}
	}

	$scope.drawData = function (id, data) {

		var width = 420,
		    barHeight = 40;

		// var data = [{name: 'Roger', value: 4}, {name: 'Steve', value: 8}, {name: 'Joey', value: 15}];
		// var data = [3,4,5];

		var values = data;
		var max;
		var data_type = 'numeric';

		var wrapper = d3.select('#d3block');   // this is the one element in the page that should be defined... 

		if (data && data.length) {
			var data_type = data[0].constructor;

			if (data_type === Object) {
				values = _.pluck(data, 'value');
			}
			else {
				values = data;
			}

			var x = d3.scale.linear()
			    .domain([0, d3.max(values)])
			    .range([0, width]);

			var block = wrapper.append('div');
			block.append('h4')
				.text('H:' + id);

			var margin = { top: 10 };
			block.append("text")
			    .attr("x", (width / 2))             
				.attr("y", 0 - (margin.top / 2))
				.attr("text-anchor", "middle")
				.attr('data-toggle', 'tooltip')
				.attr('title', 'details if applicable')
				.style("font-size", "16px") 
				.style("text-decoration", "underline")  
					.text("Name: " + id)

			// Add title to view... 

			block.append('hr');

			var chart = block.append('svg')
				.attr('class', 'd3chart')
				.attr('id', id)
			    .attr("width", width)
			    .attr("height", barHeight * values.length);

			chart.append("svg:title")
          		.text( "Generated with D3");

			var bar = chart.selectAll("g")
			    .data(data)
			  .enter().append("g")
			    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });


			if (data_type === Object) {
				bar.append("rect")
				    .attr("width", function(d) { return x(d.value); })
				    .attr("height", barHeight - 1);


				bar.append("text")
			    .attr("x", function(d) { return x(d.value) - 3; })
			    .attr("y", barHeight / 2)
			    .attr("dy", ".35em")
			    .text(function(d) { return d.name; });
			}
			else {
				bar.append("rect")
				    .attr("width", x)
				    .attr("height", barHeight - 1);

				bar.append("text")
			    .attr("x", function(d) { return x(d) - 3; })
			    .attr("y", barHeight / 2)
			    .attr("dy", ".35em")
			    .text(function(d) { return d; });			
			}
		}
		else {
			console.log("no data");
		}
	}
}]);
