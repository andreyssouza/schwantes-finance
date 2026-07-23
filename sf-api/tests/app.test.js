const request = require('supertest');
const app = require('../src/app');

describe('API root', () => {
  it('deve responder com a mensagem de sucesso', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('API do Schwantes Finance rodando perfeitamente!');
  });
});