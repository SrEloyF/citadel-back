const BaseController = require('./BaseController');
const bannerService = require('../services/bannerService');

class BannerController extends BaseController {
  constructor() {
    super(bannerService);
  }

  create = async (req, res, next) => {
    try {
      const result = await this.service.create(req.body, req.file);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const result = await this.service.updateFields(req.params.id, req.body, req.file);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  updateFields = async (req, res, next) => {
    try {
      const result = await this.service.updateFields(req.params.id, req.body, req.file);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  purgeExpired = async (req, res, next) => {
    try {
      const result = await this.service.deleteExpired();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new BannerController();
