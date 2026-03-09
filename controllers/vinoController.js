const BaseController = require('./BaseController');
const VinoService = require('../services/vinoService');

class VinoController extends BaseController {
  constructor() {
    super(VinoService);
  }
}

module.exports = new VinoController();