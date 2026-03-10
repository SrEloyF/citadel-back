require('dotenv').config({ quiet: true });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authMiddleware = require('./auth/authMiddleware');
const verifyCsrf = require('./auth/csrfMiddleware');
const authorizeRoles = require('./auth/authRoles');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rutas REST

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

module.exports = app;