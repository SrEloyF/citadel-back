const { Sabor, Presentacion } = require('../../models');

async function createSabor(data = {}) {
  return Sabor.create({
    nombre: 'Sabor Test',
    descripcion: 'descripcion test',
    ...data
  });
}

async function createPresentacion(data = {}) {
  return Presentacion.create({
    nombre: 'Botella',
    ...data
  });
}

async function createSaborPresentacion() {
  const sabor = await createSabor();
  const presentacion = await createPresentacion();

  return { sabor, presentacion };
}

module.exports = {
  createSabor,
  createPresentacion,
  createSaborPresentacion
};