const request = require('supertest');
const app = require('../src/app');

describe('Transactions routes', () => {
  it('deve bloquear acesso sem token', async () => {
    const response = await request(app).get('/transactions');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});