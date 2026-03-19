const app = require('./app');
const db = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
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