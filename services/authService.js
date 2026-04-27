const usuarioService = require('./usuarioService');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../auth/jwtUtils');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (email, contrasena) => {
  const usuario = await usuarioService.validatePassword(email, contrasena);
  if (!usuario) return null;

  return _generateSession(usuario);
};

const googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { sub: google_id, email, given_name, family_name } = payload;

  let usuario = await usuarioService.model.findOne({ where: { google_id } });

  if (!usuario) {
    usuario = await usuarioService.model.findOne({ where: { email } });
    
    if (usuario) {
      usuario.google_id = google_id;
      await usuario.save();
    } else {
      usuario = await usuarioService.model.create({
        google_id,
        email,
        nombres: given_name,
        apellidos: family_name || given_name,
        tipo: 'U'
      });
    }
  }

  return _generateSession(usuario);
};

const _generateSession = async (usuario) => {
  const refreshToken = generateRefreshToken({
    id: usuario.id_usuario,
    email: usuario.email,
    tipo: usuario.tipo,
    seed: Date.now()
  });

  usuario.refresh_token = refreshToken;
  await usuario.save();

  return {
    accessToken: generateAccessToken({
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.tipo,
    }),
    refreshToken: refreshToken,
  };
};

const refreshAccessToken = async (oldRefreshToken) => {
  const payload = verifyRefreshToken(oldRefreshToken);

  const usuario = await usuarioService.model.scope('withRefreshToken').findOne({
    where: {
      id_usuario: payload.id,
      refresh_token: oldRefreshToken
    }
  });

  if (!usuario) {
    throw new Error('Refresh token inválido o revocado');
  }

  const newAccessToken = generateAccessToken({
    id: usuario.id_usuario,
    email: usuario.email,
    tipo: usuario.tipo,
  });

  const newRefreshToken = generateRefreshToken({
    id: usuario.id_usuario,
    email: usuario.email,
    tipo: usuario.tipo,
    seed: Date.now()
  });

  usuario.refresh_token = newRefreshToken;
  await usuario.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  
  try {
    const payload = verifyRefreshToken(refreshToken);
    const usuario = await usuarioService.model.findByPk(payload.id);
    if (usuario) {
      usuario.refresh_token = null;
      await usuario.save();
    }
  } catch (err) {
    
  }
};

module.exports = { login, googleLogin, refreshAccessToken, logout };
