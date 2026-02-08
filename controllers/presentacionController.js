const BaseController = require('./BaseController');
const PresentacionService = require('../services/presentacionService');

class PresentacionController extends BaseController {
  constructor() {
    super(PresentacionService);
  }
}

module.exports = new PresentacionController();