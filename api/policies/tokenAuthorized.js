/**
 * tokenAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function (req, res, next) {
  var token;

  if (req.headers) {
    console.log('HEADER: ' + JSON.stringify(req.headers) );
  }
  else {
    console.log("NO HEADER in REQUEST");
  }

  if (req.headers && req.headers.authorization) {
    console.log("found authorization... ");
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];

      console.log("Test: " + scheme + " = " + credentials);
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.json(401, {err: 'Format is authorization: Bearer [token]'});
    }
  } else if (req.headers && req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }
  else if (req.param('token')) {
    token = req.param('token');
    
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.json(401, {err: 'No Authorization header was found'});
  }

  // ... continue by verifying token received ... 

  console.log("Verify token: " + token);
  
  jwToken.verifyToken(token, function (err, payload) {
    if (err) return res.json(401, {err: 'Invalid Token!'});

    console.log("Verified Token Payload: " + JSON.stringify(payload));

    req.token = token; // This is the decrypted token or the payload you provided
    req.payload = payload; // This is the decrypted token or the payload you provided
    next();
  });
};
