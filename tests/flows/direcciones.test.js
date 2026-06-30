const { createAgentAndUser, resetDatabase } = require('../utils/testHelpers');
const { Direccion, Carrito, sequelize } = require('../../models');

describe('Flujo de Direcciones y Soft Delete', () => {
  let agent;
  let user;
  
  beforeAll(async () => {
    await resetDatabase();
    const result = await createAgentAndUser({
      nombres: 'Test',
      apellidos: 'User',
      email: 'direcciontest@example.com',
      hash_contrasena: 'password123'
    });
    agent = result.agent;
    user = result.user;
  });

  it('Debe crear una nueva dirección y asignarla como principal por defecto', async () => {
    const res = await agent.post('/me/direcciones').send({
      calle: 'Av. Siempre Viva',
      numero: '742',
      cp: 12345
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id_direccion');
    expect(res.body.calle).toBe('Av. Siempre Viva');
    expect(res.body.principal).toBe(true);
  });

  it('Debe obtener todas las direcciones del usuario', async () => {
    const res = await agent.get('/me/direcciones');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Debe obtener la dirección principal', async () => {
    const res = await agent.get('/me/direcciones/principal');
    expect(res.status).toBe(200);
    expect(res.body.principal).toBe(true);
    expect(res.body.calle).toBe('Av. Siempre Viva');
  });

  it('Debe cambiar la dirección principal si se crea otra explícitamente como principal', async () => {
    const res = await agent.post('/me/direcciones').send({
      calle: 'Calle Falsa',
      numero: '123',
      principal: true
    });

    expect(res.status).toBe(201);
    expect(res.body.principal).toBe(true);

    const direcciones = await Direccion.findAll({ where: { id_usuario: user.id_usuario }, order: [['id_direccion', 'ASC']] });
    expect(direcciones.length).toBe(2);
    expect(direcciones[0].principal).toBe(false);
    expect(direcciones[1].principal).toBe(true);
  });

  it('Soft Delete (Edición): Modificar una dirección debe crear una nueva y preservar la antigua para historial de pedidos', async () => {
    const resDir = await agent.get('/me/direcciones/principal');
    const direccionA = resDir.body;
    expect(direccionA.calle).toBe('Calle Falsa');

    const carrito = await Carrito.create({
      id_usuario: user.id_usuario,
      id_direccion: direccionA.id_direccion,
      estado: 'E'
    });

    const resEdit = await agent.put(`/me/direcciones/${direccionA.id_direccion}`).send({
      calle: 'Calle Verdadera',
      numero: '123'
    });

    expect(resEdit.status).toBe(200);
    const nuevaDireccionB = resEdit.body;

    expect(nuevaDireccionB.id_direccion).not.toBe(direccionA.id_direccion);
    expect(nuevaDireccionB.calle).toBe('Calle Verdadera');
    expect(nuevaDireccionB.principal).toBe(true);

    const dirAntiguaBD = await Direccion.findByPk(direccionA.id_direccion);
    expect(dirAntiguaBD.principal).toBe(false);
    expect(dirAntiguaBD.calle).toBe('Calle Falsa');

    const carritoBD = await Carrito.findByPk(carrito.id_carrito);
    expect(carritoBD.id_direccion).toBe(direccionA.id_direccion);
    
    const direccionDelPedido = await Direccion.findByPk(carritoBD.id_direccion);
    expect(direccionDelPedido.calle).toBe('Calle Falsa');
  });
});
