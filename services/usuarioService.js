const BaseService = require('./BaseService');
const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');

class UsuarioService extends BaseService {
  constructor() {
    super(Usuario, ownershipConfig.Usuario, models);
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