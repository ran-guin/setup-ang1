var q = require('q');
var assert = require('chai').assert;
var Record = require('../../../api/models/Record');
 
describe('Record', function() {
    describe('* cast_to', function() {

	   it('scalar input', function () {
            assert.equal('1,2,3', Record.cast_to('1,2,3', 'array').join(','));
            assert.equal('A,B,C', Record.cast_to("A, B, C", 'Array').join(','));
        });

	   it('array input', function () {
            assert.equal('1,2,3', Record.cast_to(['1','2','3'], 'array').join(','));
            assert.equal('1;2;3', Record.cast_to([1,2,3], 'array').join(';'));
            assert.equal('A:B:C', Record.cast_to(["A", 'B', "C"], 'Array').join(':'));
        });
 
	   it('array of keyed hashes ', function () {
            assert.equal('1,2,3', Record.cast_to([{key: 1},{key:2},{key:3}], 'array','key').join(','));
            assert.equal('A', Record.cast_to([{key: "A"},{key: 'B'},{key: 'C'}], 'Array','key')[0]);
        });
    });

    describe('* merge_Messages', function () {
        var results = [ 
        	{ message: 'm1', warning: 'w1', error: ['e1a','e1b'] },
        	{ messages: ['m2a','m2b'], warnings: ['w2a','w2b']},
        	{ errors : 'e3'}
        ];

        var merged = Record.merge_Messages(results);

        it('retrieved messages', function () {
            assert.equal('m1,m2a,m2b', merged.messages.join(','));
            assert.equal('w1,w2a,w2b', merged.warnings.join(','));
            assert.equal('e1a,e1b,e3', merged.errors.join(','));
        });
    });

    describe('* to_Legacy', function () {
        var data = { 
            received: '2001-02-03', 
            other: 'misc', 
        };

        var Stock = require('../../../api/models/Stock');
        var legacy = Record.to_Legacy(data, Stock.legacy_map);
        var keys = Object.keys(legacy);


        it('legacy Stock fields', function () {
            assert.equal('2001-02-03', legacy.Stock_Received);
            assert.equal('misc', legacy.other);
        });
    });

    describe('* parseValue', function () {
    	it('id fields', function () {
    		assert.equal('"id"', Record.parseValue('<id>', { model: 'user' }) );
    		// assert.equal("Plate_ID", Record.parseValue('<id>', { model: 'container' }) );
    	});
    	it('null values', function () {
    		assert.equal('null', Record.parseValue(null, { model: 'user' }) );
    		assert.equal('null', Record.parseValue('<NULL>', { model: 'container' }) );
    		assert.equal(14, Record.parseValue('<NULL>', { defaultTo: 14 }) );
    		assert.equal('hello', Record.parseValue(undefined, { defaultTo: 'hello' }) );
    	});
    });

    describe('* update_History', function () {
		it('invalid table', function () {
			var promises = [];
			promises.push( Record.update_History('ABCD',1,{}) );
			promises.push( Record.update_History('user',1,{name: 'Ran'}) );
			promises.push( Record.update_History('container',1,{'FK_Rack__ID': 1}) );

			q.all(promises) 
			.then ( function (results) {
				assert.equal(null, result[0]);
				assert.equal(null, result[1]);
				assert.equal(1, result[2].length);
				assert.equal(1, result[2][0].FK_Rack__ID);
			});
		});

		it('grab original data', function () {
			var promises = [];
			promises.push( Record.update_History('container',1,{'FK_Rack__ID': 1}) );

			q.all(promises) 
			.then ( function (results) {
				assert.equal(1, result[0][0].FK_Rack__ID);
			});
		});
    });

    describe('* parseMetaFields', function () {
    	
    	it('standard fields', function () {
    		Record.parseMetaFields('lab_protocol',['name','id','status'])
    		.then ( function (parsed) { 
                console.log('Parsed: ' + JSON.stringify(parsed));
                var keys = Object.keys(parsed['fields']);
    			assert.equal('name,id,status', keys.join(','));
    			assert.equal(1, parsed['ids'].index);
    		})
    		.catch ( function (err) {
                assert('',err);
    			console.log("Error: " + err);
    		});
    	});

    	it('alias fields', function () {
            var parsed = {};
    		Record.parseMetaFields('container',['id','target_format'])
    		.then (function (result) {
                parsed = result;
                console.log('Parsed: ' + JSON.stringify(parsed));
                assert.equal('Plate_ID', parsed[fields].id)
                assert.equal('FK_Plate_Format__ID', parsed['fields'].target_format)
                assert.equal(0, parsed['ids'].index)
    		})
    		.catch ( function (err) {
                assert('',err);
    			console.log("alias Error: " + err);
    		});


   	});

    	it('attributes fields', function () {
    		Record.parseMetaFields('container',['Matrix_Barcode'])
    		.then (function (parsed) {
                assert.equal(1, parsed.attributes.length);
	    		assert.equal('Matrix_Barcode', parsed.attributes[0].name);
	    		assert.equal('66', parsed.attributes[0].id);
    			assert.equal(null, parsed.id_index)
    			console.log('Parsed: ' + JSON.stringify(parsed));
    		})
    		.catch ( function (err) {
    			console.log("Error: " + err);
    		});
    	});

    });
});

