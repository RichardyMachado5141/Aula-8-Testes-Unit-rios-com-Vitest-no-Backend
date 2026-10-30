import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const require = createRequire(import.meta.url);
const app = require('../../src/app.js');
const prisma = require('../../src/lib/prisma.js');

describe('rotas de usuários', () => {
  it('cria um usuário pela API', async () => {
    const user = { id: 1, name: 'Ana Silva', email: 'ana@example.com' };
    const create = vi.spyOn(prisma.user, 'create').mockResolvedValue(user);

    const response = await request(app)
      .post('/users')
      .send({ name: 'Ana Silva', email: 'ana@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(user);
    expect(create).toHaveBeenCalledWith({
      data: { name: 'Ana Silva', email: 'ana@example.com' },
    });
  });

  it('retorna HTTP 409 quando o email já está cadastrado', async () => {
    const duplicateEmailError = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
    });
    vi.spyOn(prisma.user, 'create').mockRejectedValue(duplicateEmailError);

    const response = await request(app)
      .post('/users')
      .send({ name: 'Ana Silva', email: 'ana@example.com' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: 'Já existe um usuário com este email.',
    });
  });

  it('retorna HTTP 404 quando o usuário solicitado não existe', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const response = await request(app).get('/users/42');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Usuário não encontrado.' });
  });
});
