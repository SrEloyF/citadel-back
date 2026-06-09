const BaseController = require('./BaseController');
const usuarioService = require('../services/usuarioService');

class UsuarioController extends BaseController {
  constructor() {
    super(usuarioService);
  }

  getProfile = async (req, res) => {
    req.params.id = req.user.id;
    return this.findById(req, res);
  };
}

module.exports = new UsuarioController();