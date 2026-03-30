const path = require('path');
const fs = require('fs');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const { Banner, Usuario, sequelize } = require('../../models');
const storageService = require('../../services/storageService');
const request = require('supertest');
const app = require('../../app');

describe('Banner Flow (Admin CRUD & Expiration)', () => {
  let agent;
  const timeout = 120000;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const admin = await createAdminAgent();
    agent = admin.agent;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    const banners = await Banner.findAll();
    for (const b of banners) {
      await storageService.delete(b.url_img);
    }
    await Banner.destroy({ where: {}, force: true });
  });

  test('POST /admin/banners crea un banner con imagen real en R2', async () => {
    const imgPath = path.join(__dirname, '../fixtures/img.jpg');
    if (!fs.existsSync(imgPath)) throw new Error(`Fixture img.jpg no encontrado en ${imgPath}`);

    const res = await agent
      .post('/admin/banners')
      .attach('url_img', imgPath)
      .field('fecha_expiracion', '2030-01-01T00:00:00Z')
      .expect(201);

    expect(res.body.url_img).toContain(process.env.R2_PUBLIC_URL);
    
    const banner = await Banner.findByPk(res.body.id_imagen);
    expect(banner).not.toBeNull();
    expect(banner.url_img).toBe(res.body.url_img);

    const key = storageService.extractKey(res.body.url_img);
    const head = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: key })
      .promise();
    expect(head).toBeDefined();
  }, timeout);

  test('PUT /admin/banners/:id actualiza imagen y borra la anterior de R2', async () => {
    const imgPath1 = path.join(__dirname, '../fixtures/img.jpg');
    const res1 = await agent
      .post('/admin/banners')
      .attach('url_img', imgPath1)
      .expect(201);
    
    const bannerId = res1.body.id_imagen;
    const oldUrl = res1.body.url_img;
    const oldKey = storageService.extractKey(oldUrl);

    const imgPath2 = path.join(__dirname, '../fixtures/img2.jpg');
    const res2 = await agent
      .put(`/admin/banners/${bannerId}`)
      .attach('url_img', imgPath2)
      .expect(200);

    const newUrl = res2.body.url_img;
    const newKey = storageService.extractKey(newUrl);

    const headNew = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: newKey })
      .promise();
    expect(headNew).toBeDefined();

    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: oldKey }).promise()
    ).rejects.toThrow();

    const updated = await Banner.findByPk(bannerId);
    expect(updated.url_img).toBe(newUrl);
  }, timeout);

  test('DELETE /admin/banners/:id elimina banner y su imagen de R2', async () => {
    const imgPath = path.join(__dirname, '../fixtures/img.jpg');
    const res = await agent
      .post('/admin/banners')
      .attach('url_img', imgPath)
      .expect(201);

    const bannerId = res.body.id_imagen;
    const url = res.body.url_img;
    const key = storageService.extractKey(url);

    await agent
      .delete(`/admin/banners/${bannerId}`)
      .expect(204);

    const exists = await Banner.findByPk(bannerId);
    expect(exists).toBeNull();

    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: key }).promise()
    ).rejects.toThrow();
  }, timeout);

  test('POST /admin/banners/purge-expired elimina banners expirados y sus imágenes de R2', async () => {
    const imgPath = path.join(__dirname, '../fixtures/img.jpg');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const resExp = await agent
      .post('/admin/banners')
      .attach('url_img', imgPath)
      .field('fecha_expiracion', yesterday.toISOString())
      .expect(201);

    const expiredUrl = resExp.body.url_img;
    const expiredKey = storageService.extractKey(expiredUrl);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const resAct = await agent
      .post('/admin/banners')
      .attach('url_img', imgPath)
      .field('fecha_expiracion', tomorrow.toISOString())
      .expect(201);

    const activeUrl = resAct.body.url_img;
    const activeKey = storageService.extractKey(activeUrl);

    const purgeRes = await agent
      .post('/admin/banners/purge-expired')
      .expect(200);

    expect(purgeRes.body.deletedCount).toBe(1);

    await expect(
      storageService.s3.headObject({ Bucket: process.env.R2_BUCKET, Key: expiredKey }).promise()
    ).rejects.toThrow();
    
    const banners = await Banner.findAll();
    expect(banners.length).toBe(1);
    expect(banners[0].url_img).toBe(activeUrl);

    const headActive = await storageService.s3
      .headObject({ Bucket: process.env.R2_BUCKET, Key: activeKey })
      .promise();
    expect(headActive).toBeDefined();
  }, timeout);

  test('Un usuario no admin no puede acceder a CRUD de banners', async () => {
    const userEmail = 'user_banner_test@test.com';
    const userPassword = 'password123';
    
    await Usuario.destroy({ where: { email: userEmail } });
    await Usuario.create({
      nombres: 'Normal',
      apellidos: 'User',
      email: userEmail,
      tipo: 'U',
      hash_contrasena: userPassword
    });

    const normalAgent = request.agent(app);
    const loginRes = await normalAgent.post('/auth/login').send({ email: userEmail, contrasena: userPassword });
    normalAgent.set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    const cookies = loginRes.headers['set-cookie'] || [];
    const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
      const xsrfTokenValue = decodeURIComponent(xsrfCookie.split(';')[0].split('=')[1]);
      const xsrfToken = xsrfTokenValue.split('.')[0];
      normalAgent.set('X-XSRF-TOKEN', xsrfToken);
    }

    await normalAgent
      .get('/admin/banners')
      .expect(403);

    await normalAgent
      .post('/admin/banners')
      .expect(403);
  });

});
