const request = require('supertest');
const app = require('../../app');
const { sequelize } = require('../../models');

async function createAgentAndUser(userPayload) {
  const agent = request.agent(app);

  const registerRes = await agent
    .post('/auth/register')
    .send(userPayload);

  const createdUser = registerRes.body;

  const loginRes = await agent
    .post('/auth/login')
    .send({
      email: userPayload.email,
      contrasena: userPayload.hash_contrasena
    });

  const accessToken = loginRes.body.accessToken;
  agent.set('Authorization', `Bearer ${accessToken}`);

  const xsrfCookie = loginRes.headers['set-cookie']
    .find(c => c.startsWith('XSRF-TOKEN='));
  
  if (xsrfCookie) {
    const xsrfTokenValue = decodeURIComponent(
      xsrfCookie.split(';')[0].split('=')[1]
    );
    const xsrfToken = xsrfTokenValue.split('.')[0];
    agent.set('X-XSRF-TOKEN', xsrfToken);
  }

  return {
    agent,
    registerRes,
    loginRes,
    user: createdUser
  };
}

async function resetDatabase() {
  await sequelize.sync({ force: true });
}

module.exports = {
  createAgentAndUser,
  resetDatabase,
};
