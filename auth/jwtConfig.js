const requireEnv = require('./../validators/validateEnv');

const JWT_SECRET = requireEnv('JWT_SECRET');
const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');

module.exports = {
  access: {
    secret: JWT_SECRET,
    expiresIn: '30m',
  },
  refresh: {
    secret: JWT_REFRESH_SECRET,
    expiresIn: '7d',
  },
};
