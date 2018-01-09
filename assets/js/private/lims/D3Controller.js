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

		// clear these options since they are only used to normalize data object
		options.data = null;
		options.file = null;

		if (data) {
			console.log('data supplied explicitly: ' + JSON.stringify(data));
			$scope.drawData(id, data, options);
		}
		else if (file) {
			d3.tsv(file, type, function (err, filedata) {
				if (err) {
					console.log('error parsing data file')
				} else {
					console.log('parsed data from data file; ' + file)
					console.log(JSON.stringify(filedata));
					$scope.drawData(id, filedata, options);
				}
			});

			function type(d) {
			  d.value = +d.value; // coerce to number
			  return d;
			}

		}
	}
	$scope.example = function (id, data, options) {
		var width = 960,
		    height = 500;

		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
		    .range([height, 0]);


		// customize ... 

		var wrapper = d3.select('#d3block');   // this is the one element in the page that should be defined... 
			
		var block = wrapper.append('div');
		
		var chart = block.append('svg')
			.attr('class', 'd3chart')
			.attr('id', id)
		    .attr("width", width)
		    .attr("height", height);


		// END Custom ..

		d3.tsv("data.tsv", type, function(error, data) {
		  x.domain(data.map(function(d) { return d.name; }));
		  y.domain([0, d3.max(data, function(d) { return d.value; })]);

		  var bar = chart.selectAll("g")
		      .data(data)
		    .enter().append("g")
		      .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

		  bar.append("rect")
		      .attr("y", function(d) { return y(d.value); })
		      .attr("height", function(d) { return height - y(d.value); })
		      .attr("width", x.rangeBand());

		  bar.append("text")
		      .attr("x", x.rangeBand() / 2)
		      .attr("y", function(d) { return y(d.value) + 3; })
		      .attr("dy", ".75em")
		      .text(function(d) { return d.value; });
		});

		function type(d) {
		  d.value = +d.value; // coerce to number
		  return d;
		}
	}

	$scope.drawData = function (id, data, options) {

		if (!options) { options = {} }

		// Optional input variables: 

		var full_width = options.width || 960;
		var full_height = options.height || 500;
		var barHeight = options.barHeight || 40;  // for bar charts only ... 

		var chart_type = options.chart_type || 'column';

		var wrapper = d3.select('#d3block');   // this is the one element in the page that should be defined... 

		if (data && data.length) {
			var labels = [];
			var data_type = data[0].constructor;

			var data_objects = [];
			var values = [];

			if (data_type === Object) {
				// Data supplied as object (expecting keys: name, value)
				values = _.pluck(data, 'value');
				labels = _.pluck(data, 'name');
				data_objects = data;
			}
			else if (data_type === Number) {
				// Data supplied as array of numbers
				values = data;
				for (var i=0; i<data.length; i++) {
					data_objects.push({ name: data[i], value: data[i] })
				}
			}
			else {
				console.log('unexpected data value type: ' + data_type);
			}

			console.log('data: ' + JSON.stringify(data_objects));
			var max = d3.max(values);

			var chart_height = full_height; // may need to adjust for title ?
			var chart_width = full_width;   // may need to adjust for margins ?

			if (chart_type === 'bar') {
				chart_height = barHeight * values.length;
			}

			var block = wrapper.append('div');
			block.append('h4').text('H:' + id);
			var margin = { top: 10 };
			if (block && block.margin) {
				console.log('margin: ' + block.margin);
			}

			var title = block.append("text")
			    .attr("x", (full_width / 2))             
				.attr("y", 0 - (margin.top / 2))
				.attr("text-anchor", "middle")
				.attr('data-toggle', 'tooltip')
				.attr('title', 'details if applicable')
				.style("font-size", "16px") 
				.style("text-decoration", "underline")  
					.text("Name: " + id);

			// Add title to view... 

			block.append('hr');

			var chart = block.append('svg')
				.attr('class', 'd3chart')
				.attr('id', id)
			    .attr("width", chart_width)
			    .attr("height", chart_height);

			chart.append("svg:title")
          		.text( "Generated with D3");

          	var bar, label;
			if (chart_type === 'bar') {
				var x = d3.scale.linear().domain([0, max]).range([0, chart_width]);

				bar = chart.selectAll("g")
				    .data(data_objects)
				  .enter().append("g")
				    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
			
				bar.append("rect")
				    .attr("width", function(d) { return x(d.value); })
				    .attr("height", barHeight - 1);

				label = bar.append("text")
						    .attr("x", function(d) { return x(d.value) - 3; })
		    				.attr("y", barHeight / 2)
		    				.attr("dy", ".35em");
			}
			else if (chart_type === 'column') {
				// bar width based on full_width. 
				var barWidth = chart_width / data.length		

				var x = d3.scale.ordinal().rangeRoundBands([0, chart_width], .1)
				x.domain(data_objects.map(function(d) { return d.name; }));

				var y = d3.scale.linear().range([chart_height, 0]);
				y.domain([0, max]);

				bar = chart.selectAll("g")
				      .data(data_objects)
				    .enter().append("g")
			    	.attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });
					
				bar.append("rect")
					.attr("y", function(d) { return y(d.value); })
					.attr("height", function(d) { return chart_height - y(d.value); })
					.attr("width", x.rangeBand());  // barWidth - 1);

							
				label = bar.append("text")
							.attr("x", x.rangeBand() / 2)  //  barWidth / 2)
    						.attr("y", function(d) { return y(d.value) + 3; })
    						.attr("dy", ".75em");
			}

			label.text(function(d) { return d.name; });
		}
		else {
			console.log("no data");
		}
	}
}]);
