const BaseController = require('./BaseController');
const CuponService = require('../services/cuponService');

class CuponController extends BaseController {
  constructor() {
    super(CuponService);
  }
}

module.exports = new CuponController();