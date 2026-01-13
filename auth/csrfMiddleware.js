const verifyCsrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const csrfCookie = req.cookies?.['XSRF-TOKEN'];
  const csrfHeader = req.get('X-XSRF-TOKEN') || req.get('x-xsrf-token');

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  next();
};

module.exports = verifyCsrf;
