const verifyCsrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const isMultipart = req.is('multipart/form-data');
  const csrfHeader = req.get('X-XSRF-TOKEN') || req.get('x-xsrf-token');

  if (isMultipart) {
    if (!csrfHeader) {
      return res.status(403).json({ error: 'Token CSRF inválido' });
    }
    return next();
  }

  const csrfCookie = req.cookies?.['XSRF-TOKEN'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  next();
};

module.exports = verifyCsrf;