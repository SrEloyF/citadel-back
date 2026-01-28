const BaseController = require('./BaseController');
const categoriaVinoService = require('../services/categoriaVinoService');

class CategoriaVinoController extends BaseController {
  constructor() {
    super(categoriaVinoService);
  }
}

module.exports = new CategoriaVinoController();