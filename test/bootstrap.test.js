var sails = require('sails');

var assert = require('chai').assert;

before(function(done) {
  console.log("start before...");
  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);

  console.log("lift...");
  sails.lift({
    // configuration for testing purposes
    models: { connection: 'testDB' }

  }, function(err, server) {
    if (err) {
	console.log("error lifting...");		
	return done(err);
    }
    // here you can load fixtures, etc.
    console.log("predone"); 
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
    console.log("lower"); 
  sails.lower(done);
});
