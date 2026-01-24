const usuarioService = require('./usuarioService');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../auth/jwtUtils');

const login = async (email, contrasena) => {
  const usuario = await usuarioService.validatePassword(email, contrasena);
  if (!usuario) return null;

  return {
    accessToken: generateAccessToken({
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.tipo,
    }),
    refreshToken: generateRefreshToken({
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.tipo,
    }),
  };
};

const refreshAccessToken = (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);

  return generateAccessToken({
    id: payload.id,
    email: payload.email,
    tipo: payload.tipo,
  });
};

module.exports = { login, refreshAccessToken };
