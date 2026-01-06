const BaseController = require('./BaseController');
const VinoService = require('../services/VinoService');

class VinoController extends BaseController {
  constructor() {
    super(VinoService);
  }
}

module.exports = new VinoController();