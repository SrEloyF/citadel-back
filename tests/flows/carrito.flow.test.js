const { resetDatabase, createAgentAndUser } = require('../utils/testHelpers');

describe('Flow carritos', () => {
  let agent;
  let user;

  beforeAll(async () => {
    await resetDatabase();

    const res = await createAgentAndUser({
      nombres: 'Test Name',
      apellidos: 'Test Lastname',
      email: 'test@example.com',
      hash_contrasena: 'Password123!'
    });

    if (res.registerRes.status !== 201) {
      console.error('REGISTER ERROR:', res.registerRes.body);
    }

    expect(res.registerRes.status).toBe(201);

    agent = res.agent;
    user = res.user;
  });

  beforeEach(async () => {
    await agent.post('/me/carritos').send({
      id_usuario: user.id_usuario
    });
  });

  afterAll(async () => {
    const { sequelize } = require('../../models');
    await sequelize.close();
  });

  test('POST /me/carritos - crear carrito', async () => {
    const payload = {
      id_usuario: user.id_usuario,
    };
    const res = await agent
      .post('/me/carritos')
      .send(payload);

    if (res.status !== 201) {
      console.error('STATUS:', res.status);
      console.error('BODY:', res.body);
    }

    expect(res.status).toBe(201);
  });

  test('GET /me/carritos - devolver mis carritos', async () => {
    let statusExpected = 200;

    const res = await agent
      .get('/me/carritos')
      .expect(statusExpected);

    if (res.status !== statusExpected) {
      console.error('STATUS:', res.status);
      console.error('BODY:', res.body);
    }

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('PUT /me/carritos/:id - actualizar mi carrito', async () => {
    const statusExpected = 200;

    const list = await agent
      .get('/me/carritos')
      .expect(200);

    const carrito = list.body[0];

    const updatePayload = {
      estado: 'V',
    };

    const res = await agent
      .put(`/me/carritos/${carrito.id_carrito}`)
      .send(updatePayload)
      .expect(statusExpected);

    if (res.status !== statusExpected) {
      console.error('STATUS:', res.status);
      console.error('BODY:', res.body);
    }

    expect(res.body.estado).toBe('V');
  });

  test('PATCH /me/carritos/:id - actualizar parcialmente mi carrito', async () => {
    const createRes = await agent.post('/me/carritos').send({
      id_usuario: user.id_usuario
    }).expect(201);

    const id = createRes.body.id_carrito;
    const patchPayload = {
      estado: 'V'
    };

    const patchRes = await agent
      .patch(`/me/carritos/${id}`)
      .send(patchPayload)
      .expect(200);

    expect(patchRes.body.estado).toBe('V');
    expect(patchRes.body.id_carrito).toBe(id);
    expect(patchRes.body.id_usuario).toBe(user.id_usuario);
  });

  test('DELETE /me/carritos/:id - eliminar mi carrito', async () => {
    const create = await agent.post('/me/carritos').send({
      id_usuario: user.id_usuario,
    }).expect(201);
    const id = create.body.id_carrito;

    await agent.delete(`/me/carritos/${id}`).expect(204);
    await agent.get(`/me/carritos/${id}`).expect(404);
  });
});
