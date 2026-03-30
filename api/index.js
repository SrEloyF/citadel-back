const app = require('../app');
const db = require('../models');
const logger = require('./../utils/logger');

module.exports = async (req, res) => {
  try {
    await db.sequelize.authenticate();
    return app(req, res);
  } catch (error) {
    logger.error({ err: error }, 'Server error');
    res.status(500).json({ error: "Server error" });
  }
};