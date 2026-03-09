jest.mock('../../services/storageService', () => {
  return {
    upload: jest.fn().mockResolvedValue('https://r2.test/vinos/fake-upload.jpg'),
    delete: jest.fn().mockResolvedValue(),
    extractKey: jest.fn((v) => {
      if (!v) return null;
      if (typeof v === 'string' && v.startsWith('http')) {
        return v.replace('https://r2.test/', '');
      }
      return v;
    })
  };
});

const path = require('path');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const storageService = require('../../services/storageService');
const { Vino, sequelize } = require('../../models');
const { createSaborPresentacion } = require('../utils/createVinos');

describe('Crud imágenes (Mock)', () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Vino.destroy({ where: {} });
    jest.clearAllMocks();
  });

  test('POST /admin/vinos crea vino y sube imagen (multipart form-data)', async () => {
    const { agent } = await createAdminAgent();
    const { sabor, presentacion } = await createSaborPresentacion();
    const imgPath = path.join(__dirname, '../fixtures/img.jpg');

    const res = await agent
      .post('/admin/vinos')
      .field('id_sabor', sabor.id_sabor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('nombre', 'Vino Test')
      .field('descripcion', 'desc')
      .field('volumen_ml', '750')
      .field('stock', '10')
      .attach('url_img_principal', imgPath)
      .expect(201);

    expect(res.body.url_img_principal).toBe('https://r2.test/vinos/fake-upload.jpg');
    expect(storageService.upload).toHaveBeenCalled();
    const created = await Vino.findByPk(res.body.id_vino);
    expect(created).not.toBeNull();
  });

  test('PATCH /admin/vinos/:id actualiza imagen y borra la anterior si no referenciada', async () => {
    const initialUrl = 'https://r2.test/vinos/old.jpg';
    const { sabor, presentacion } = await createSaborPresentacion();
    const vino = await Vino.create({
      id_sabor: sabor.id_sabor,
      id_presentacion: presentacion.id_presentacion,
      nombre: 'VinoOld',
      descripcion: 'd',
      volumen_ml: 750,
      stock: 5,
      url_img_principal: initialUrl
    });

    const { agent } = await createAdminAgent();
    const imgPath = path.join(__dirname, '../fixtures/img.jpg');

    const res = await agent
      .patch(`/admin/vinos/${vino.id_vino}`)
      .attach('url_img_principal', imgPath)
      .expect(200);

    expect(storageService.upload).toHaveBeenCalled();
    expect(storageService.delete).toHaveBeenCalledWith(initialUrl);
    const updated = await Vino.findByPk(vino.id_vino);
    expect(updated.url_img_principal).toBe('https://r2.test/vinos/fake-upload.jpg');
  });

  test('DELETE /admin/vinos/:id elimina registro y borra imagen si no referenciada', async () => {
    const initialUrl = 'https://r2.test/vinos/oldToDelete.jpg';
    const { sabor, presentacion } = await createSaborPresentacion();
    const vino = await Vino.create({
      id_sabor: sabor.id_sabor,
      id_presentacion: presentacion.id_presentacion,
      nombre: 'VinoToDelete',
      descripcion: 'd',
      volumen_ml: 500,
      stock: 2,
      url_img_principal: initialUrl
    });

    const { agent } = await createAdminAgent();

    await agent
      .delete(`/admin/vinos/${vino.id_vino}`)
      .expect(204);

    expect(storageService.delete).toHaveBeenCalledWith(initialUrl);
    const exist = await Vino.findByPk(vino.id_vino);
    expect(exist).toBeNull();
  });

});