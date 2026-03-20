const usuarioService = require('./usuarioService');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../auth/jwtUtils');

const login = async (email, contrasena) => {
  const usuario = await usuarioService.validatePassword(email, contrasena);
  if (!usuario) return null;

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

module.exports = { login, refreshAccessToken, logout };
