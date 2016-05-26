
var assert = require('chai').assert;
var Rack = require('../../../api/models/Rack');
var Record = require('../../../api/models/Record');

describe('Rack', function() {
    describe('* add', function() {

		it('new racks', function () {
			var parent = 7;
			Rack.add({parent: 7, type: 'Box', name: 'B1'})
			. then (function (result) {
				console.log("created rack: " + JSON.stringify(result));
			})
			.catch ( function (err) {
				console.log("Error: " + JSON.stringify(err));
			})
    	});
	});
});