const BaseController = require('./BaseController');
const usuarioService = require('../services/usuarioService');

class UsuarioController extends BaseController {
  constructor() {
    super(usuarioService);
  }
}

module.exports = new UsuarioController();