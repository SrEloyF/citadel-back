const crypto = require('crypto');
const SECRET = process.env.CSRF_SECRET;

const generateCsrfToken = () => crypto.randomBytes(48).toString('hex');

function signToken(token) {
  if (!SECRET) throw new Error('CSRF_SECRET no configurado');
  return crypto.createHmac('sha256', SECRET).update(token).digest('hex');
}

module.exports = { generateCsrfToken, signToken };
