const express = require('express');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000',];
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rutas REST
app.use('/carritosproductos', require('./routes/carritoProductoRoutes'));
app.use('/carritos', require('./routes/carritoRoutes'));
app.use('/categoriasvinos', require('./routes/categoriaVinoRoutes'));
app.use('/imagenesadicionalesvinos', require('./routes/imagenAdicionalVinoRoutes'));
app.use('/pagos', require('./routes/pagoRoutes'));
app.use('/usuarios', require('./routes/usuarioRoutes'));
app.use('/vinos', require('./routes/vinoRoutes'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
