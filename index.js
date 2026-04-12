const dotenv = require('dotenv');
dotenv.config({ path: '.env', quiet: true });
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
  override: true,
  quiet: true
});

const app = require('./app');
const db = require('./models');
const logger = require('./utils/logger');
const PORT = process.env.PORT || 3000;
const { initPools } = require('./config/bdAi');

process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  process.exit(1);
});

async function startServer() {
  try {
    await initPools();
    await db.sequelize.authenticate();
    logger.info('Conexión a BD establecida correctamente.');

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    logger.error({ err: error }, 'Error al conectar con la base de datos');
    process.exit(1);
  }
}

startServer();