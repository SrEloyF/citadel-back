const authService = require('../services/authService');
const generateCsrfToken = require('../auth/csrfUtils');
const usuarioService = require('../services/usuarioService');
const validarCamposModelo = require('../validators/modelValidator');
const isProd = process.env.NODE_ENV === 'production';
const logger = require('./../utils/logger');

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/'
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/'
};

const register = async (req, res) => {
  try {
    const data = {
      ...req.body,
      tipo: 'U'
    };
    validarCamposModelo(usuarioService.model, data);
    const usuario = await usuarioService.create(data);
    res.status(201).json(usuario);
  } catch (err) {
    logger.error({ err }, 'Error al registrar usuario');
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
        msg: 'Error'
      });
    }

    const { email, contrasena } = req.body;

    if (!email?.trim() || !contrasena) {
      return res.status(400).json({
        error: 'Email y contraseña requeridos'
      });
    }

    const tokens = await authService.login(email, contrasena);

    if (!tokens) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const csrfToken = generateCsrfToken();

    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      refreshCookieOptions
    );

    res.cookie(
      'XSRF-TOKEN',
      csrfToken,
      csrfCookieOptions
    );

    return res.json({
      accessToken: tokens.accessToken
    });

  } catch (err) {
    logger.error({ err }, 'Error al iniciar sesión');
    return res.status(500).json({
      error: `Error interno del servidor: ${err}`
    });
  }
};

const refresh = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token requerido'
    });
  }

  try {
    const accessToken = authService.refreshAccessToken(refreshToken);
    const csrfToken = generateCsrfToken();

    res.cookie(
      'XSRF-TOKEN',
      csrfToken,
      csrfCookieOptions
    );

    res.json({
      accessToken
    });

  } catch (err) {
    logger.error({ err }, 'Error al refrescar token');
    res.status(403).json({
      error: 'Refresh token inválido o expirado'
    });

  }
};

const logout = (req, res) => {
  res.clearCookie('XSRF-TOKEN', csrfCookieOptions);
  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(204).end();
};

module.exports = { register, login, refresh, logout };
