const jwt = require('jsonwebtoken');
const config = require('./jwtConfig');

const generateAccessToken = (payload) =>
  jwt.sign(payload, config.access.secret, { expiresIn: config.access.expiresIn });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.refresh.secret, { expiresIn: config.refresh.expiresIn });

const verifyAccessToken = (token) =>
  jwt.verify(token, config.access.secret);

const verifyRefreshToken = (token) =>
  jwt.verify(token, config.refresh.secret);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
