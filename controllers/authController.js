const authService = require('../services/authService');
const generateCsrfToken = require('../auth/csrfUtils');
const usuarioService = require('../services/usuarioService');
const validarCamposModelo = require('../validators/modelValidator');

const register = async (req, res) => {
  try {
    validarCamposModelo(usuarioService.model, req.body);
    const usuario = await usuarioService.create(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    res.status(400).json({
      error: err.message,
      msg: err.name || undefined,
      original: err.original?.sqlMessage || undefined
    });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Request body vacío o no es JSON',
        msg: 'Error',
      });
    }

    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const tokens = await authService.login(email, contrasena);

    if (!tokens) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const csrfToken = generateCsrfToken();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    return res.status(500).json({
      error: `Error interno del servidor: ${err}`,
    });
  }
};

const refresh = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token requerido' });
  }

  try {
    const accessToken = authService.refreshAccessToken(refreshToken);
    const csrfToken = generateCsrfToken();

    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({ accessToken });
  } catch {
    res.status(403).json({ error: 'Refresh token inválido o expirado' });
  }
};

const logout = (req, res) => {
  res
    .clearCookie('XSRF-TOKEN', { path: '/' });
  res
    .clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    })
    .status(204)
    .end();
};

module.exports = { register, login, refresh, logout };
