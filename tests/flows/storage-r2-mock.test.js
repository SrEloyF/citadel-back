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
const { createProductRelations } = require('../utils/createVinos');

describe('Crud imágenes (Mock)', () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    jest.clearAllMocks();
  });

  test('POST /admin/vinos crea vino y sube imagen (multipart form-data)', async () => {
    const { agent } = await createAdminAgent();
    const { sabor, dulzor, presentacion } = await createProductRelations();
    const imgPath = path.join(__dirname, '../fixtures/img.jpg');

    const res = await agent
      .post('/admin/vinos')
      .field('sku', 'TEST-SKU-1')
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('nombre', 'Vino Test')
      .field('descripcion', 'desc')
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
    const { sabor, dulzor, presentacion } = await createProductRelations();
    const vino = await Vino.create({
      sku: 'TEST-SKU-2',
      id_sabor: sabor.id_sabor,
      id_dulzor: dulzor.id_dulzor,
      id_presentacion: presentacion.id_presentacion,
      nombre: 'VinoOld',
      descripcion: 'd',
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
    const { sabor, dulzor, presentacion } = await createProductRelations();
    const vino = await Vino.create({
      sku: 'TEST-SKU-3',
      id_sabor: sabor.id_sabor,
      id_dulzor: dulzor.id_dulzor,
      id_presentacion: presentacion.id_presentacion,
      nombre: 'VinoToDelete',
      descripcion: 'd',
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