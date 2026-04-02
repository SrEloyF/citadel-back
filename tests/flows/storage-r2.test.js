const path = require('path');
const fs = require('fs');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const { createProductRelations } = require('../utils/createVinos');
const { Vino, sequelize } = require('../../models');
const storageService = require('../../services/storageService');

describe('Crud imágenes (R2)', () => {
  let agent;
  let sabor;
  let dulzor;
  let presentacion;

  let vinoId;
  let firstImageUrl;
  let secondImageUrl;
  const timeout = 120000;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const admin = await createAdminAgent();
    agent = admin.agent;

    const rel = await createProductRelations();
    sabor = rel.sabor;
    dulzor = rel.dulzor;
    presentacion = rel.presentacion;

    vinoId = null;
    firstImageUrl = null;
    secondImageUrl = null;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Crear vino con imagen', async () => {
    const img1 = path.join(__dirname, '../fixtures/img.jpg');
    if (!fs.existsSync(img1)) throw new Error(`Fixture img.jpg no encontrado en ${img1}`);

    const res = await agent
      .post('/admin/vinos')
      .field('sku', 'SKU-R2-1')
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('nombre', 'vino test integración')
      .field('descripcion', 'desc')
      .field('stock', '10')
      .attach('url_img_principal', img1)
      .expect(201);

    vinoId = res.body.id_vino;
    firstImageUrl = res.body.url_img_principal;

    expect(firstImageUrl).toContain(process.env.R2_PUBLIC_URL);

    const firstKey = storageService.extractKey(firstImageUrl);
    const head = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: firstKey })
      .promise();

    expect(head).toBeDefined();
  }, timeout);

  test('Actualizar imagen del vino', async () => {
    const img1 = path.join(__dirname, '../fixtures/img.jpg');
    const createRes = await agent
      .post('/admin/vinos')
      .field('sku', 'SKU-R2-2')
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('nombre', 'vino test integración')
      .field('descripcion', 'desc')
      .field('stock', '10')
      .attach('url_img_principal', img1)
      .expect(201);

    vinoId = createRes.body.id_vino;
    firstImageUrl = createRes.body.url_img_principal;

    const img2 = path.join(__dirname, '../fixtures/img2.jpg');
    const res = await agent
      .patch(`/admin/vinos/${vinoId}`)
      .attach('url_img_principal', img2)
      .expect(200);

    secondImageUrl = res.body.url_img_principal;

    const secondKey = storageService.extractKey(secondImageUrl);
    const head2 = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: secondKey })
      .promise();

    expect(head2).toBeDefined();

    const firstKey = storageService.extractKey(firstImageUrl);
    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: firstKey }).promise()
    ).rejects.toThrow();
  }, timeout);

  test('Eliminar vino y su imagen', async () => {
    const img1 = path.join(__dirname, '../fixtures/img.jpg');
    const createRes = await agent
      .post('/admin/vinos')
      .field('sku', 'SKU-R2-3')
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('nombre', 'vino test integración')
      .field('descripcion', 'desc')
      .field('stock', '10')
      .attach('url_img_principal', img1)
      .expect(201);

    vinoId = createRes.body.id_vino;
    firstImageUrl = createRes.body.url_img_principal;
    const firstKey = storageService.extractKey(firstImageUrl);

    await agent.delete(`/admin/vinos/${vinoId}`).expect(204);

    const deleted = await Vino.findByPk(vinoId);
    expect(deleted).toBeNull();

    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: firstKey }).promise()
    ).rejects.toThrow();
  }, timeout);
});