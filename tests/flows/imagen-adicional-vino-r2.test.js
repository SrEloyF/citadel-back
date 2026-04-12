const path = require('path');
const fs = require('fs');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const { createProductRelations } = require('../utils/createVinos');
const { Vino, ImagenAdicionalVino, sequelize } = require('../../models');
const storageService = require('../../services/storageService');

describe('Crud imágenes adicionales de vinos (R2)', () => {
  let agent;
  let sabor;
  let dulzor;
  let presentacion;
  let vinoId;
  const timeout = 120000;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const admin = await createAdminAgent();
    agent = admin.agent;

    const rel = await createProductRelations();
    sabor = rel.sabor;
    dulzor = rel.dulzor;
    presentacion = rel.presentacion;

    const imgPath = path.join(__dirname, '../fixtures/img.jpg');
    if (!fs.existsSync(imgPath)) throw new Error(`Fixture img.jpg no encontrado en ${imgPath}`);

    const vinoRes = await agent
      .post('/admin/vinos')
      .field('sku', 'SKU-ADD-1')
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('nombre', 'vino test imagenes adicionales')
      .field('descripcion', 'desc')
      .field('stock', '10')
      .attach('url_img_principal', imgPath);

    vinoId = vinoRes.body.id_vino;
  });

  afterAll(async () => {
    await sequelize.close();
    if (storageService.s3?.destroy) {
      storageService.s3.destroy();
    }
  });

  test('Crear imagen adicional de vino', async () => {
    const img = path.join(__dirname, '../fixtures/img.jpg');
    if (!fs.existsSync(img)) throw new Error(`Fixture img.jpg no encontrado en ${img}`);

    const res = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img)
      .expect(201);

    const imagenId = res.body.id_imagen;
    const imageUrl = res.body.url_img;

    expect(imagenId).toBeDefined();
    expect(imageUrl).toContain(process.env.R2_PUBLIC_URL);

    const key = storageService.extractKey(imageUrl);
    const head = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: key })
      .promise();

    expect(head).toBeDefined();

    const imagenEnBD = await ImagenAdicionalVino.findByPk(imagenId);
    expect(imagenEnBD).toBeDefined();
    expect(imagenEnBD.url_img).toBe(imageUrl);
    expect(imagenEnBD.id_vino).toBe(vinoId);
  }, timeout);

  test('Obtener imagen adicional', async () => {
    const img = path.join(__dirname, '../fixtures/img.jpg');
    const createRes = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img)
      .expect(201);

    const imagenId = createRes.body.id_imagen;

    const getRes = await agent
      .get(`/admin/imagenesadicionalesvinos/${imagenId}`)
      .expect(200);

    expect(getRes.body.id_imagen).toBe(imagenId);
    expect(getRes.body.id_vino).toBe(vinoId);
    expect(getRes.body.url_img).toContain(process.env.R2_PUBLIC_URL);
  }, timeout);

  test('Actualizar imagen adicional', async () => {
    const img1 = path.join(__dirname, '../fixtures/img.jpg');
    const createRes = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img1)
      .expect(201);

    const imagenId = createRes.body.id_imagen;
    const firstImageUrl = createRes.body.url_img;
    const firstKey = storageService.extractKey(firstImageUrl);

    const img2 = path.join(__dirname, '../fixtures/img2.jpg');
    const updateRes = await agent
      .patch(`/admin/imagenesadicionalesvinos/${imagenId}`)
      .attach('url_img', img2)
      .expect(200);

    const secondImageUrl = updateRes.body.url_img;
    const secondKey = storageService.extractKey(secondImageUrl);

    const head2 = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: secondKey })
      .promise();

    expect(head2).toBeDefined();

    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: firstKey }).promise()
    ).rejects.toThrow();

    const imagenActualizada = await ImagenAdicionalVino.findByPk(imagenId);
    expect(imagenActualizada.url_img).toBe(secondImageUrl);
  }, timeout);

  test('Eliminar imagen adicional', async () => {
    const img = path.join(__dirname, '../fixtures/img.jpg');
    const createRes = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img)
      .expect(201);

    const imagenId = createRes.body.id_imagen;
    const imageUrl = createRes.body.url_img;
    const key = storageService.extractKey(imageUrl);

    await agent.delete(`/admin/imagenesadicionalesvinos/${imagenId}`).expect(204);

    const imagenEliminada = await ImagenAdicionalVino.findByPk(imagenId);
    expect(imagenEliminada).toBeNull();

    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: key }).promise()
    ).rejects.toThrow();
  }, timeout);

  test('Crear múltiples imágenes adicionales para un vino', async () => {
    const img1 = path.join(__dirname, '../fixtures/img.jpg');
    const img2 = path.join(__dirname, '../fixtures/img2.jpg');

    const res1 = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img1)
      .expect(201);

    const res2 = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img2)
      .expect(201);

    const imagenId1 = res1.body.id_imagen;
    const imagenId2 = res2.body.id_imagen;

    expect(imagenId1).not.toBe(imagenId2);

    const imagen1 = await ImagenAdicionalVino.findByPk(imagenId1);
    const imagen2 = await ImagenAdicionalVino.findByPk(imagenId2);

    expect(imagen1).toBeDefined();
    expect(imagen2).toBeDefined();
    expect(imagen1.id_vino).toBe(vinoId);
    expect(imagen2.id_vino).toBe(vinoId);
  }, timeout);

  test('Eliminar vino elimina sus imágenes adicionales', async () => {
    const img = path.join(__dirname, '../fixtures/img.jpg');
    const res = await agent
      .post('/admin/imagenesadicionalesvinos')
      .field('id_vino', vinoId)
      .attach('url_img', img)
      .expect(201);
    const imagenId = res.body.id_imagen;
    const imageUrl = res.body.url_img;
    let imagenEnBD = await ImagenAdicionalVino.findByPk(imagenId);

    expect(imagenEnBD).toBeDefined();

    const deleteRes = await agent.delete(`/admin/vinos/${vinoId}`).expect(204);
    const vinoEliminado = await Vino.findByPk(vinoId);

    expect(vinoEliminado).toBeNull();

    imagenEnBD = await ImagenAdicionalVino.findByPk(imagenId);

    expect(imagenEnBD).toBeNull();

    const key = storageService.extractKey(imageUrl);

    try {
      await storageService.s3.headObject({
        Bucket: process.env.R2_BUCKET,
        Key: key
      }).promise();

      throw new Error('La imagen todavía existe en R2');

    } catch (err) {
      if (err.code !== 'NotFound') {
        throw err;
      }
    }
  }, timeout);
});
