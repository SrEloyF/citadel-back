const BaseService = require('./BaseService');
const { Usuario } = require('../models');

class UsuarioService extends BaseService {
  constructor() {
    super(Usuario);
  }
}

module.exports = new UsuarioService();