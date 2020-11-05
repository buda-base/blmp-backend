const jwt = require('express-jwt');
const jwksClient = require('jwks-rsa');
const config = require('../../config/env');

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header & the signing keys provided by the JWKS endpoint.
  secret: jwksClient.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: `${config.AUTH0_ISSUER}.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: config.AUTH0_AUDIENCE,
  issuer: config.AUTH0_ISSUER,
  algorithms: ['RS256']
});

const scopesJwt = (req, res, next) => {
  if (req.user && req.user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
    // eslint-disable-next-line no-param-reassign
    req.user.scope = [...req.user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']]
  } else if (req.user) {
    // eslint-disable-next-line no-param-reassign
    req.user.scope = []
  }
  next();
}

export { checkJwt, scopesJwt };
