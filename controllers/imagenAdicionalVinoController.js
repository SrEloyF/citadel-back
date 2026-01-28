const BaseController = require('./BaseController');
const imagenAdicionalVinoService = require('../services/imagenAdicionalVinoService');

class ImagenAdicionalVinoController extends BaseController {
  constructor() {
    super(imagenAdicionalVinoService);
  }
}

module.exports = new ImagenAdicionalVinoController();