const request = require('supertest');
const app = require('../../app');
const { Usuario } = require('../../models');
const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;

async function ensureTestAdmin() {
  let admin = await Usuario.findOne({ where: { email: adminEmail } });

  if (!admin) {
    admin = await Usuario.create({
      nombres: 'Admin',
      apellidos: 'Test',
      email: adminEmail,
      tipo: 'A',
      hash_contrasena: adminPassword
    });
  }

  return admin;
}

async function createAdminAgent() {
  await ensureTestAdmin();

  const agent = request.agent(app);

  const loginRes = await agent
    .post('/auth/login')
    .send({
      email: adminEmail,
      contrasena: adminPassword
    });

  if (loginRes.status !== 200) {
    throw new Error(`Login de admin falló: ${loginRes.body.error || 'desconocido'}`);
  }

  const accessToken = loginRes.body.accessToken;
  agent.set('Authorization', `Bearer ${accessToken}`);

  const cookies = loginRes.headers['set-cookie'] || [];
  const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));

  if (xsrfCookie) {
    const xsrfToken = decodeURIComponent(xsrfCookie.split(';')[0].split('=')[1]);
    agent.set('X-XSRF-TOKEN', xsrfToken);
  }

  return { agent, loginRes };
}

module.exports = {
  createAdminAgent,
};