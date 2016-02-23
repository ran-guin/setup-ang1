var jwt = require('jsonwebtoken');

var tokenSecret = process.env.TOKEN_SECRET || 'defaultSecret';

module.exports.issueToken = function(payload) {
    var options = { 
        expiredInMinutes : 1
    };
            
    console.log("PAYLOAD: " + JSON.stringify(payload));

    return jwt.sign(payload, tokenSecret, options);
};

module.exports.verifyToken = function(token, callback) {
    return jwt.verify(token, tokenSecret, {}, callback);
};

