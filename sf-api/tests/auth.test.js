const request = require('supertest');
const app = require('../src/app');

describe('Auth routes', () => {
  it('deve retornar erro ao tentar login sem dados', async () => {
    const response = await request(app).post('/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});