const request = require('supertest');
const app = require('../../app');
const { resetDatabase } = require('../utils/testHelpers');
const { Usuario } = require('../../models');

describe('Flow de refresh token', () => {
  const userPayload = {
    nombres: 'Test',
    apellidos: 'Refresh',
    email: 'refresh@example.com',
    hash_contrasena: 'Password123!',
    dni: '12345678'
  };

  beforeAll(async () => {
    await resetDatabase();
    await request(app).post('/auth/register').send(userPayload).expect(201);
  });

  afterAll(async () => {
    const { sequelize } = require('../../models');
    await sequelize.close();
  });

  test('Login debe establecer una cookie refreshToken y guardarla en la BD.', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: userPayload.email,
        contrasena: userPayload.hash_contrasena
      })
      .expect(200);

    const cookies = res.headers['set-cookie'];
    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
    expect(refreshTokenCookie).toBeDefined();

    const token = refreshTokenCookie.split(';')[0].split('=')[1];
    const usuario = await Usuario.scope('withRefreshToken').findOne({ where: { email: userPayload.email } });
    expect(usuario.refresh_token).toBe(token);
  });

  test('Refresh debe rotar tokens y actualizar la DB', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: userPayload.email,
        contrasena: userPayload.hash_contrasena
      });
    
    const firstRefreshToken = loginRes.headers['set-cookie']
      .find(c => c.startsWith('refreshToken='))
      .split(';')[0].split('=')[1];

    const refreshRes = await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${firstRefreshToken}`])
      .expect(200);

    const secondRefreshToken = refreshRes.headers['set-cookie']
      .find(c => c.startsWith('refreshToken='))
      .split(';')[0].split('=')[1];

    expect(secondRefreshToken).not.toBe(firstRefreshToken);

    const usuario = await Usuario.scope('withRefreshToken').findOne({ where: { email: userPayload.email } });
    expect(usuario.refresh_token).toBe(secondRefreshToken);

    await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${firstRefreshToken}`])
      .expect(403);
  });

  test('Logout debe invalidar refreshToken en DB', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: userPayload.email,
        contrasena: userPayload.hash_contrasena
      });
    
    const refreshToken = loginRes.headers['set-cookie']
      .find(c => c.startsWith('refreshToken='))
      .split(';')[0].split('=')[1];

    const xsrfCookie = loginRes.headers['set-cookie'].find(c => c.startsWith('XSRF-TOKEN='));
    const fullXsrfToken = decodeURIComponent(xsrfCookie.split(';')[0].split('=')[1]);
    const rawXsrfToken = fullXsrfToken.split('.')[0];

    await request(app)
      .post('/auth/logout')
      .set('Cookie', [`refreshToken=${refreshToken}`, `XSRF-TOKEN=${fullXsrfToken}`])
      .set('X-XSRF-TOKEN', rawXsrfToken)
      .expect(204);

    const usuario = await Usuario.scope('withRefreshToken').findOne({ where: { email: userPayload.email } });
    expect(usuario.refresh_token).toBeNull();

    await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(403);
  });
});
