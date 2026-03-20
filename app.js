require('dotenv').config({ quiet: true });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authMiddleware = require('./auth/authMiddleware');
const verifyCsrf = require('./auth/csrfMiddleware');
const authorizeRoles = require('./auth/authRoles');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();

app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  maxAge: 86400,
}));

// Rutas REST

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(globalLimiter);

// Rutas para autenticación
app.use('/auth', require('./routes/authRoutes'));

// Rutas públicas
app.use('/public/precios', require('./routes/public/precioPublicRoutes'));
app.use('/public/sabores', require('./routes/public/saborPublicRoutes'));
app.use('/public/presentaciones', require('./routes/public/presentacionPublicRoutes'));
app.use('/public/vinos', require('./routes/public/vinoPublicRoutes'));
app.use('/public/imagenesadicionalesvinos', require('./routes/public/imagenAdicionalVinoPublicRoutes'));

// Rutas para usuarios autenticados
app.use('/me/carritos', authMiddleware, verifyCsrf, require('./routes/authenticated-users/carritoRoutes'));
app.use('/me/carritosproductos', authMiddleware, verifyCsrf, require('./routes/authenticated-users/carritoProductoRoutes'));
app.use('/me/pagos', authMiddleware, verifyCsrf, require('./routes/authenticated-users/pagoRoutes'));
app.use('/me/usuario', authMiddleware, verifyCsrf, require('./routes/authenticated-users/usuarioSelfRoutes'));

// Rutas para ADMIN
app.use('/admin/presentaciones', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/presentacionRoutes'));
app.use('/admin/sabores', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/saborRoutes'));
app.use('/admin/precios', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/precioRoutes'));
app.use('/admin/vinos', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/vinoRoutes'));
app.use('/admin/imagenesadicionalesvinos', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/imagenAdicionalVinoRoutes'));
app.use('/admin/carritos', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/carritoRoutes'));
app.use('/admin/carritosproductos', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/carritoProductoRoutes'));
app.use('/admin/pagos', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/pagoRoutes'));
app.use('/admin/usuarios', authMiddleware, authorizeRoles('A'), verifyCsrf, require('./routes/admin/usuarioRoutes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  logger.error({ err: err }, 'Error al procesar la solicitud');
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message
  });
});

module.exports = app;