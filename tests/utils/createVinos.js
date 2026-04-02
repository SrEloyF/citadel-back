const { Sabor, Presentacion, Dulzor } = require('../../models');

async function createSabor(data = {}) {
  return Sabor.create({
    nombre: 'Sabor Test',
    ...data
  });
}

async function createDulzor(data = {}) {
  return Dulzor.create({
    nombre: 'Dulzor Test',
    ...data
  });
}

async function createPresentacion(data = {}) {
  return Presentacion.create({
    volumen_ml: 750,
    botellas_por_caja: 1,
    ...data
  });
}

async function createProductRelations() {
  const sabor = await createSabor();
  const dulzor = await createDulzor();
  const presentacion = await createPresentacion();

  return { sabor, dulzor, presentacion };
}

module.exports = {
  createSabor,
  createDulzor,
  createPresentacion,
  createProductRelations,
};