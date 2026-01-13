const BaseService = require('./BaseService');
const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

class UsuarioService extends BaseService {
  constructor() {
    super(Usuario);
  }

  async validatePassword(email, plainPassword) {
    const usuario = await this.model.findOne({ where: { email } });
    if (!usuario) return null;

    const match = await bcrypt.compare(plainPassword, usuario.hash_contrasena);
    if (!match) return null;

    return usuario;
  }
}

module.exports = new UsuarioService();