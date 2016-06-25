
var assert = require('chai').assert;
var Rack = require('../../../api/models/Rack');

describe('Rack', function() {
    describe('* add', function() {

		it('new racks', function () {
			var parent = 7;
			Rack.add({parent: 7, type: 'Box'})
			. then (function (result) {
				console.log("TEST created rack: " + JSON.stringify(result));
			})
			.catch ( function (err) {
				console.log("TEST Error: " + JSON.stringify(err));
			});
    	});
	});

	describe('* transferSamples', function () {
		it ('single transfer', function () {
			Rack.transferLocation('Plate', [1], 4, { pack : true })
			.then (function (result) {
				console.log("TEST transferred plate: " + JSON.stringify(result) );
			})
			.catch ( function (err) {
				console.log("TEST Error: " + JSON.stringify(err));
			});

		});
	});
});
