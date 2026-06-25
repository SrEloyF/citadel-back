const request = require('supertest');
const app = require('../../app');
const { createAgentAndUser, resetDatabase } = require('../utils/testHelpers');
const { createAdminAgent } = require('../utils/adminAgentHelper');
const { sequelize } = require('../../models');

describe('Estadisticas Admin Panel Flow', () => {
  let userAgent;
  let adminAgent;

  beforeAll(async () => {
    await resetDatabase();

    const userPayload = {
      nombres: 'Regular',
      apellidos: 'User',
      email: `user_${Date.now()}@example.com`,
      hash_contrasena: 'password123',
      tipo: 'U'
    };

    const setup = await createAgentAndUser(userPayload);
    userAgent = setup.agent;

    const adminSetup = await createAdminAgent();
    adminAgent = adminSetup.agent;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Should block access for normal authenticated users', async () => {
    const res = await userAgent.get('/admin/estadisticas');
    expect(res.status).toBe(403);
  });

  test('Should allow access for admin users and return default statistics structure', async () => {
    const res = await adminAgent.get('/admin/estadisticas');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    
    // Default structure validation
    expect(res.body).toHaveProperty('kpi');
    expect(res.body).toHaveProperty('ventasMensuales');
    expect(res.body).toHaveProperty('topProductos');
    expect(res.body).toHaveProperty('estadosPedidos');
    expect(res.body).toHaveProperty('ventasSabores');
    expect(res.body).toHaveProperty('ciudadesVentas');
    expect(res.body).toHaveProperty('productosBajoStock');

    // KPI values structure
    expect(res.body.kpi).toHaveProperty('totalSales');
    expect(res.body.kpi).toHaveProperty('productsSold');
    expect(res.body.kpi).toHaveProperty('totalUsers');
    expect(res.body.kpi).toHaveProperty('usersPurchased');
    expect(res.body.kpi).toHaveProperty('newClients');
    expect(res.body.kpi).toHaveProperty('avgSaleCost');
  });

  test('Should return specific metric if metric parameter is provided (metric=sales)', async () => {
    const res = await adminAgent.get('/admin/estadisticas?metric=sales');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Should return specific metric if metric parameter is provided (metric=kpi)', async () => {
    const res = await adminAgent.get('/admin/estadisticas?metric=kpi');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('totalSales');
  });

  test('Should return bad request error if metric is invalid', async () => {
    const res = await adminAgent.get('/admin/estadisticas?metric=invalid_metric_name');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
