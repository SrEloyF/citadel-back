require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authMiddleware = require('./auth/authMiddleware');
const verifyCsrf = require('./auth/csrfMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));

// Rutas REST
app.use('/auth', require('./routes/authRoutes'));
app.use('/carritosproductos', authMiddleware, verifyCsrf, require('./routes/carritoProductoRoutes'));
app.use('/carritos', authMiddleware, verifyCsrf, require('./routes/carritoRoutes'));
app.use('/categoriasvinos', authMiddleware, verifyCsrf, require('./routes/categoriaVinoRoutes'));
app.use('/imagenesadicionalesvinos', authMiddleware, verifyCsrf, require('./routes/imagenAdicionalVinoRoutes'));
app.use('/pagos', authMiddleware, verifyCsrf, require('./routes/pagoRoutes'));
app.use('/usuarios', require('./routes/usuarioRoutes'));
app.use('/vinos', authMiddleware, verifyCsrf, require('./routes/vinoRoutes'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
