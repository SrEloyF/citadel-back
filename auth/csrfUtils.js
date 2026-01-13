const crypto = require('crypto');

const generateCsrfToken = () => crypto.randomBytes(48).toString('hex');

module.exports = generateCsrfToken;
