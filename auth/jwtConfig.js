const requireEnv = require('./../validators/validateEnv');
const JWT_SECRET = requireEnv('JWT_SECRET');
const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');
const accessExpiresIn = requireEnv('JWT_ACCESS_TIME');
const refreshExpiresIn = requireEnv('JWT_REFRESH_TIME');

module.exports = {
  access: {
    secret: JWT_SECRET,
    expiresIn: accessExpiresIn,
  },
  refresh: {
    secret: JWT_REFRESH_SECRET,
    expiresIn: refreshExpiresIn,
  },
};
