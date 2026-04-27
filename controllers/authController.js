const authService = require('../services/authService');
const { generateCsrfToken, signToken } = require('../auth/csrfUtils');
const usuarioService = require('../services/usuarioService');
const validarCamposModelo = require('../validators/modelValidator');
const isProd = process.env.NODE_ENV === 'production';
const logger = require('./../utils/logger');

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
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
    res.status(400).json({ error: "Error al registar usuario" });
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

    return _sendAuthResponse(res, tokens);

  } catch (err) {
    logger.error({ err }, 'Error al iniciar sesión');
    return res.status(500).json({ error: `Error interno del servidor`});
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken es requerido' });
    }

    const tokens = await authService.googleLogin(idToken);

    return _sendAuthResponse(res, tokens);
  } catch (err) {
    logger.error({ err }, 'Error en Google Login');
    return res.status(401).json({ error: 'Autenticación de Google fallida' });
  }
};

const _sendAuthResponse = (res, tokens) => {
  const rawCsrfToken = generateCsrfToken();
  const signedCsrfToken = `${rawCsrfToken}.${signToken(rawCsrfToken)}`;

  res.cookie(
    'refreshToken',
    tokens.refreshToken,
    refreshCookieOptions
  );

  res.cookie(
    'XSRF-TOKEN',
    signedCsrfToken,
    csrfCookieOptions
  );

  return res.json({
    accessToken: tokens.accessToken
  });
};

const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;

  if (!oldRefreshToken) {
    return res.status(401).json({
      error: 'Refresh token requerido'
    });
  }

  try {
    const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken);
    const rawCsrfToken = generateCsrfToken();
    const signedCsrfToken = `${rawCsrfToken}.${signToken(rawCsrfToken)}`;

    res.cookie(
      'refreshToken',
      refreshToken,
      refreshCookieOptions
    );

    res.cookie(
      'XSRF-TOKEN',
      signedCsrfToken,
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

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logout(refreshToken);

  res.clearCookie('XSRF-TOKEN', csrfCookieOptions);
  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(204).end();
};

module.exports = { register, login, googleLogin, refresh, logout };
