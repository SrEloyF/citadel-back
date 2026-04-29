const { createAdminAgent } = require('../utils/adminAgentHelper');
const { sequelize, Reclamo, Cupon, Carrito, Pago, Usuario } = require('../../models');
const supertest = require('supertest');
const app = require('../../app');

describe('Pruebas para Reclamos y Cupones', () => {
  let adminAgent;
  let publicAgent;
  let userAgent;
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    const admin = await createAdminAgent();
    adminAgent = admin.agent;

    publicAgent = supertest(app);

    const user = await Usuario.create({
      dni: '12345678',
      nombres: 'Test',
      apellidos: 'User',
      email: 'user@test.com',
      hash_contrasena: 'password123',
      tipo: 'U'
    });
    testUser = user.toJSON();

    userAgent = supertest.agent(app);
    const loginRes = await userAgent.post('/auth/login').send({
      email: 'user@test.com',
      contrasena: 'password123'
    });
    
    const accessToken = loginRes.body.accessToken;
    userAgent.set('Authorization', `Bearer ${accessToken}`);

    const cookies = loginRes.headers['set-cookie'] || [];
    const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));

    if (xsrfCookie) {
      const xsrfTokenValue = decodeURIComponent(xsrfCookie.split(';')[0].split('=')[1]);
      const xsrfToken = xsrfTokenValue.split('.')[0];
      userAgent.set('X-XSRF-TOKEN', xsrfToken);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Reclamos', () => {
    test('Público puede crear un reclamo', async () => {
      await publicAgent.post('/public/reclamos').send({
        tipo: 'R',
        motivo: 'Mal servicio',
        detalles: 'El vino llegó roto',
        email: 'cliente@test.com'
      }).expect(201);
    });

    test('Público no puede listar reclamos', async () => {
      await publicAgent.get('/public/reclamos').expect(404);
    });

    test('Admin puede ver y actualizar estado de reclamo', async () => {
      const reclamo = await Reclamo.create({
        tipo: 'Q',
        motivo: 'Queja',
        estado: 'N'
      });

      await adminAgent.patch(`/admin/reclamos/${reclamo.id_reclamo}`)
        .send({ estado: 'R' })
        .expect(200);
      
      const updated = await Reclamo.findByPk(reclamo.id_reclamo);
      expect(updated.estado).toBe('R');

      await adminAgent.patch(`/admin/reclamos/${reclamo.id_reclamo}`)
        .send({ motivo: 'Motivo editado' })
        .expect(400);
    });
  });

  describe('Cupones', () => {
    let cuponActivo;
    let cuponExpirado;

    beforeAll(async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      cuponActivo = await Cupon.create({
        codigo: 111,
        tipo_descuento: 'F',
        descuento: 10,
        fecha_inicio: past,
        fecha_fin: future,
        activo: true
      });

      cuponExpirado = await Cupon.create({
        codigo: 222,
        tipo_descuento: 'P',
        descuento: 15,
        fecha_inicio: past,
        fecha_fin: past,
        activo: true
      });
    });

    test('El estado activo cambia automáticamente al consultar un cupón expirado', async () => {
      const res = await adminAgent.get(`/admin/cupones/${cuponExpirado.id_cupon}`).expect(200);
      expect(res.body.activo).toBe(false);
    });

    test('Público puede listar y ver cupones', async () => {
      await publicAgent.get('/public/cupones').expect(200);
      await publicAgent.get(`/public/cupones/${cuponActivo.id_cupon}`).expect(200);
    });

    test('Público no puede crear, editar o borrar cupones', async () => {
      await publicAgent.post('/public/cupones').send({ codigo: 999 }).expect(404);
      await publicAgent.put(`/public/cupones/${cuponActivo.id_cupon}`).expect(404);
      await publicAgent.delete(`/public/cupones/${cuponActivo.id_cupon}`).expect(404);
    });

    test('No se puede eliminar un cupón si ya ha sido usado en un pago', async () => {
      const carrito = await Carrito.create({
        id_usuario: testUser.id_usuario,
        id_cupon: cuponActivo.id_cupon,
        estado: 'E'
      });

      await Pago.create({
        id_pedido: carrito.id_carrito,
        metodo: 'E',
        monto: 100
      });

      await adminAgent.delete(`/admin/cupones/${cuponActivo.id_cupon}`).expect(400);
    });

    test('Un usuario no puede usar el mismo cupón dos veces en compras pagadas', async () => {
      const nuevoCarrito = await Carrito.create({
        id_usuario: testUser.id_usuario,
        estado: 'E'
      });

      const res = await userAgent.patch(`/me/carritos/${nuevoCarrito.id_carrito}`)
        .send({ id_cupon: cuponActivo.id_cupon })
        .expect(400);
      
      expect(res.body.error).toContain('ya ha utilizado este cupón');
    });

    test('No se puede quitar un cupón de un carrito ya pagado', async () => {
      const carritoPagado = await Carrito.findOne({
        where: { id_cupon: cuponActivo.id_cupon },
        include: [{ model: Pago, as: 'pago' }]
      });

      const res = await userAgent.patch(`/me/carritos/${carritoPagado.id_carrito}`)
        .send({ id_cupon: null })
        .expect(400);
      
      expect(res.body.error).toContain('No se puede eliminar el cupón de un pedido ya pagado');
    });
  });
});