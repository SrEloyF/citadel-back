const path = require('path');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const { createProductRelations } = require('../utils/createVinos');
const { Vino, Precio, ImagenAdicionalVino, sequelize } = require('../../models');
const storageService = require('../../services/storageService');

describe('Flujo completo CRUD Vinos con datos anidados y archivos', () => {
  let agent;
  let sabor, dulzor, presentacion;
  const timeout = 120000;

  const img1 = path.join(__dirname, '../fixtures/img.jpg');
  const img2 = path.join(__dirname, '../fixtures/img2.jpg');

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const admin = await createAdminAgent();
    agent = admin.agent;

    const rel = await createProductRelations();
    sabor = rel.sabor;
    dulzor = rel.dulzor;
    presentacion = rel.presentacion;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Crear vino con precios e imágenes adicionales (archivos)', async () => {
    const precios = [
      { cantidad_minima: 1, precio: 100 },
      { cantidad_minima: 6, precio: 90 }
    ];

    const res = await agent
      .post('/admin/vinos')
      .field('sku', 'VINO-TEST-001')
      .field('nombre', 'Vino Full Test')
      .field('descripcion', 'Descripción del vino')
      .field('stock', 50)
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('precios', JSON.stringify(precios))
      .attach('url_img_principal', img1)
      .attach('imagen_adicionales', img1)
      .attach('imagen_adicionales', img2)
      .expect(201);

    const vinoId = res.body.id_vino;
    expect(vinoId).toBeDefined();

    const vinoFull = await Vino.findByPk(vinoId, {
      include: [Precio, ImagenAdicionalVino]
    });

    expect(vinoFull.Precios).toHaveLength(2);
    expect(vinoFull.ImagenAdicionalVinos).toHaveLength(2);
    expect(vinoFull.url_img_principal).toContain(process.env.R2_PUBLIC_URL);
  }, timeout);

  test('Actualización parcial (PATCH) no debe borrar datos anidados', async () => {
    const vino = await Vino.findOne();
    
    const res = await agent
      .patch(`/admin/vinos/${vino.id_vino}`)
      .field('nombre', 'Vino Nombre Editado')
      .expect(200);

    expect(res.body.nombre).toBe('Vino Nombre Editado');

    const vinoPostPatch = await Vino.findByPk(vino.id_vino, {
      include: [Precio, ImagenAdicionalVino]
    });
    expect(vinoPostPatch.Precios).toHaveLength(2);
    expect(vinoPostPatch.ImagenAdicionalVinos).toHaveLength(2);
  }, timeout);

  test('Actualización completa (PUT) reemplazando imágenes y precios', async () => {
    const vino = await Vino.findOne({ include: [ImagenAdicionalVino] });
    const oldImgUrl = vino.ImagenAdicionalVinos[0].url_img;

    const nuevosPrecios = [{ cantidad_minima: 1, precio: 150 }];
    const imagenesMantener = [{ url_img: oldImgUrl }];

    const res = await agent
      .put(`/admin/vinos/${vino.id_vino}`)
      .field('sku', 'VINO-TEST-001-EDIT')
      .field('nombre', 'Vino Editado Full')
      .field('descripcion', 'Nueva desc')
      .field('stock', 20)
      .field('id_sabor', sabor.id_sabor)
      .field('id_dulzor', dulzor.id_dulzor)
      .field('id_presentacion', presentacion.id_presentacion)
      .field('precios', JSON.stringify(nuevosPrecios))
      .field('imagen_adicionales', JSON.stringify(imagenesMantener))
      .attach('imagen_adicionales', img2)
      .expect(200);

    expect(res.body.Precios).toHaveLength(1);
    expect(res.body.Precios[0].precio).toBe("150.00");
    expect(res.body.ImagenAdicionalVinos).toHaveLength(2);
    
    const urls = res.body.ImagenAdicionalVinos.map(i => i.url_img);
    expect(urls).toContain(oldImgUrl);
  }, timeout);

  test('Eliminar vino limpia todos los registros y storage', async () => {
    const vino = await Vino.findOne({ include: [ImagenAdicionalVino] });
    const mainImg = vino.url_img_principal;
    const extraImg = vino.ImagenAdicionalVinos[0].url_img;

    await agent.delete(`/admin/vinos/${vino.id_vino}`).expect(204);

    expect(await Vino.findByPk(vino.id_vino)).toBeNull();
    expect(await Precio.count({ where: { id_vino: vino.id_vino } })).toBe(0);
    expect(await ImagenAdicionalVino.count({ where: { id_vino: vino.id_vino } })).toBe(0);

    const mainKey = storageService.extractKey(mainImg);
    const extraKey = storageService.extractKey(extraImg);

    await expect(storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: mainKey }).promise())
      .rejects.toThrow();
    await expect(storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: extraKey }).promise())
      .rejects.toThrow();
  }, timeout);
});
