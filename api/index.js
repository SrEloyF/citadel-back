const app = require('../app');
const db = require('../models');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    await db.sequelize.authenticate();
    return app(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};