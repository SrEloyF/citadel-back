const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.name);
    process.exit(1);
  }
}

startServer();
