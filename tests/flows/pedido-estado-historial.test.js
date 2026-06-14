const request = require('supertest');
const app = require('../../app');
const { createAgentAndUser, resetDatabase } = require('../utils/testHelpers');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const { Carrito, PedidoEstadoHistorial, sequelize } = require('../../models');

describe('Pedido Estado Historial Flow', () => {
  let userAgent;
  let adminAgent;
  let user;
  let carritoId;

  beforeAll(async () => {
    await resetDatabase();

    const userPayload = {
      nombres: 'Test',
      apellidos: 'User',
      email: `user_${Date.now()}@example.com`,
      hash_contrasena: 'password123',
      tipo: 'U'
    };

    const setup = await createAgentAndUser(userPayload);
    userAgent = setup.agent;
    user = setup.user;

    const adminSetup = await createAdminAgent();
    adminAgent = adminSetup.agent;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Should automatically create history entry when Carrito is created (Status E)', async () => {
    const res = await userAgent
      .post('/me/carritos')
      .send({
        id_usuario: user.id_usuario,
        estado: 'E',
        tipo: 'D'
      });

    expect(res.status).toBe(201);
    carritoId = res.body.id_carrito;
    expect(carritoId).toBeDefined();

    const historialRes = await userAgent
      .get(`/me/carritos/${carritoId}/historial`);

    expect(historialRes.status).toBe(200);
    expect(historialRes.body).toHaveLength(1);
    expect(historialRes.body[0].estado).toBe('E');
  });

  test('Should automatically add history entry when admin updates status to P', async () => {
    // Admin updates status to 'P' (Pagado)
    const updateRes = await adminAgent
      .patch(`/admin/carritos/${carritoId}`)
      .send({
        estado: 'P'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.estado).toBe('P');

    // Verify history for user
    const historialRes = await userAgent
      .get(`/me/carritos/${carritoId}/historial`);

    expect(historialRes.status).toBe(200);
    expect(historialRes.body).toHaveLength(2);
    expect(historialRes.body[1].estado).toBe('P');
  });

  test('Should add another history entry when admin updates status to R', async () => {
    // Admin updates status to 'R' (Revisado)
    const updateRes = await adminAgent
      .patch(`/admin/carritos/${carritoId}`)
      .send({
        estado: 'R'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.estado).toBe('R');

    // Verify history
    const historialRes = await userAgent
      .get(`/me/carritos/${carritoId}/historial`);

    expect(historialRes.status).toBe(200);
    expect(historialRes.body).toHaveLength(3);
    expect(historialRes.body[2].estado).toBe('R');
  });

  test('Should not add history entry if status does not change', async () => {
    // Admin updates something else, e.g., tipo
    const updateRes = await adminAgent
      .patch(`/admin/carritos/${carritoId}`)
      .send({
        tipo: 'T'
      });

    expect(updateRes.status).toBe(200);

    // Verify history length remains 3
    const historialRes = await userAgent
      .get(`/me/carritos/${carritoId}/historial`);

    expect(historialRes.status).toBe(200);
    expect(historialRes.body).toHaveLength(3);
  });
});
