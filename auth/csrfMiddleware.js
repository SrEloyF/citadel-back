const crypto = require('crypto');
const SECRET = process.env.CSRF_SECRET;

function signToken(token) {
  return crypto.createHmac('sha256', SECRET).update(token).digest('hex');
}

const verifyCsrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const csrfCookie = req.cookies?.['XSRF-TOKEN'];
  const csrfHeader = req.get('X-XSRF-TOKEN');

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  const [token, signature] = csrfCookie.split('.');

  if (!token || !signature) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  const expectedSignature = signToken(token);

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  if (csrfHeader !== token) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  next();
};

module.exports = verifyCsrf;