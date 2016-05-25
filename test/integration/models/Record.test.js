
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
        ]

        var merged = Record.merge_Messages(results);

        it('retrieved messages', function () {
            assert.equal('m1,m2a,m2b', merged.messages.join(','));
            assert.equal('w1,w2a,w2b', merged.warnings.join(','));
            assert.equal('e1a,e1b,e3', merged.errors.join(','));
        });
    });
});

