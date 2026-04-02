const BaseController = require('./BaseController');
const DulzorService = require('../services/dulzorService');

class DulzorController extends BaseController {
  constructor() {
    super(DulzorService);
  }
}

module.exports = new DulzorController();
