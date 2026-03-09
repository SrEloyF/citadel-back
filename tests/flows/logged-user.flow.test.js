const { resetDatabase, createAgentAndUser } = require('../utils/testHelpers');

describe('Flow logged-user (ownership & self)', () => {
  let agent;
  let user;

  let otherAgent;
  let otherUser;

  let myCarrito;
  let otherCarrito;

  beforeAll(async () => {
    await resetDatabase();

    const res = await createAgentAndUser({
      nombres: 'Logged',
      apellidos: 'User',
      email: 'logged@example.com',
      hash_contrasena: 'Password123!'
    });

    if (res.registerRes.status !== 201) {
      console.error('REGISTER ERROR (main):', res.registerRes.body);
    }
    expect(res.registerRes.status).toBe(201);

    agent = res.agent;
    user = res.user;

    const res2 = await createAgentAndUser({
      nombres: 'Other',
      apellidos: 'User',
      email: 'other@example.com',
      hash_contrasena: 'Password123!'
    });

    if (res2.registerRes.status !== 201) {
      console.error('REGISTER ERROR (other):', res2.registerRes.body);
    }
    expect(res2.registerRes.status).toBe(201);

    otherAgent = res2.agent;
    otherUser = res2.user;

    const createMine = await agent.post('/me/carritos').send({
      id_usuario: user.id_usuario
    });

    if (createMine.status !== 201) {
      console.error('CREATE CARITO (mine) ERROR:', createMine.status, createMine.body);
    }
    expect(createMine.status).toBe(201);
    myCarrito = createMine.body;

    const createOther = await otherAgent.post('/me/carritos').send({
      id_usuario: otherUser.id_usuario
    });

    if (createOther.status !== 201) {
      console.error('CREATE CARITO (other) ERROR:', createOther.status, createOther.body);
    }
    expect(createOther.status).toBe(201);
    otherCarrito = createOther.body;
  });

  afterAll(async () => {
    const { sequelize } = require('../../models');
    await sequelize.close();
  });

  test('GET /me/usuario - obtener mi perfil', async () => {
    const res = await agent.get('/me/usuario').expect(200);

    if (res.status !== 200) {
      console.error('STATUS:', res.status);
      console.error('BODY:', res.body);
    }

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    expect(res.body[0]).toHaveProperty('id_usuario');
    expect(res.body[0].id_usuario).toBe(user.id_usuario);

  });

  test('PUT /me/usuario/:id - actualizar mi perfil', async () => {
    const payload = {
        nombres: 'LoggedChanged'
    };

    const res = await agent
        .put(`/me/usuario/${user.id_usuario}`)
        .send(payload);

    if (res.status !== 200) {
        console.error('STATUS:', res.status);
        console.error('BODY:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.nombres).toBe('LoggedChanged');
  });

  test('GET /me/carritos/:id - no puedo ver el carrito de otro usuario (403)', async () => {
    await agent.get(`/me/carritos/${otherCarrito.id_carrito}`).expect(403);
  });

  test('PUT /me/carritos/:id - no puedo actualizar carrito de otro usuario (403)', async () => {
    const payload = { estado: 'V' };

    const res = await agent
      .put(`/me/carritos/${otherCarrito.id_carrito}`)
      .send(payload);

    if (res.status !== 403) {
      console.error('EXPECTED 403, GOT:', res.status, res.body);
    }

    expect(res.status).toBe(403);
  });

  test('PATCH /me/carritos/:id - puedo editar parcialmente mi carrito', async () => {
    const payload = { estado: 'V' };

    const res = await agent
      .patch(`/me/carritos/${myCarrito.id_carrito}`)
      .send(payload);

    if (res.status !== 200) {
      console.error('PATCH ERROR:', res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('V');
    expect(res.body.id_carrito).toBe(myCarrito.id_carrito);
  });

  test('PATCH /me/carritos/:id - no puedo editar parcialmente el carrito de otro usuario (403)', async () => {
    const payload = { estado: 'V' };

    const res = await agent
      .patch(`/me/carritos/${otherCarrito.id_carrito}`)
      .send(payload);

    if (res.status !== 403) {
      console.error('EXPECTED 403, GOT:', res.status, res.body);
    }

    expect(res.status).toBe(403);
  });

  test('PATCH /me/carritos/:id - recurso inexistente devuelve 404', async () => {
    const payload = { estado: 'X' };

    const res = await agent
      .patch('/me/carritos/999999')
      .send(payload);

    expect(res.status).toBe(404);
  }); 

  test('DELETE /me/carritos/:id - no puedo eliminar carrito de otro usuario (403)', async () => {
    const res = await agent.delete(`/me/carritos/${otherCarrito.id_carrito}`);

    if (res.status !== 403) {
      console.error('EXPECTED 403, GOT:', res.status, res.body);
    }

    expect(res.status).toBe(403);
  });

  test('GET /me/carritos/:id - recurso inexistente devuelve 404', async () => {
    await agent.get('/me/carritos/999999').expect(404);
  });

  test('PUT /me/carritos/:id - recurso inexistente devuelve 404', async () => {
    await agent.put('/me/carritos/999999').send({ estado: 'X' }).expect(404);
  });

  test('DELETE /me/carritos/:id - recurso inexistente devuelve 404', async () => {
    await agent.delete('/me/carritos/999999').expect(404);
  });
});
