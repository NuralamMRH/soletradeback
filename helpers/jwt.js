const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  try {
    // Check if the user should be revoked based on some condition
    if (!payload.isAdmin) {
      // User is not admin, revoke the token
      return done(null, true);
    }

    // User is authorized, don't revoke the token
    return done(null, false);
  } catch (error) {
    // If an error occurs, consider it as token revocation and revoke the token
    return done(error, true);
  }
}

module.exports = authJwt;
