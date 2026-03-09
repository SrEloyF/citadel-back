const app = require('../app');
const db = require('../models');

let isConnected = false;

module.exports = async (req, res) => {
  try {

    if (!isConnected) {
      await db.sequelize.authenticate();
      console.log("DB conectada");
      isConnected = true;
    }

    return app(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};