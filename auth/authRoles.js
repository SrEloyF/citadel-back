module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.tipo)) {
      return res.status(403).json({
        error: 'No tiene permisos para acceder a este recurso'
      });
    }
    next();
  };
};
