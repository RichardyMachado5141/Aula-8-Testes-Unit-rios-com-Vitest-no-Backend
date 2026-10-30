import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const usersController = require('../../src/controllers/usersController.js');
const prisma = require('../../src/lib/prisma.js');

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
}

describe('usersController', () => {
  it('creates a user with trimmed fields and returns HTTP 201', async () => {
    const user = { id: 1, name: 'Ana Silva', email: 'ana@example.com' };
    const create = vi.spyOn(prisma.user, 'create').mockResolvedValue(user);
    const res = createResponse();

    await usersController.createUser({
      body: { name: ' Ana Silva ', email: ' ana@example.com ' },
    }, res);

    expect(create).toHaveBeenCalledWith({
      data: { name: 'Ana Silva', email: 'ana@example.com' },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('rejects invalid user input without calling Prisma', async () => {
    const create = vi.spyOn(prisma.user, 'create');
    const res = createResponse();

    await usersController.createUser({
      body: { name: '   ', email: 'ana@example.com' },
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'name e email são obrigatórios.',
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('lists users ordered by id', async () => {
    const users = [{ id: 1, name: 'Ana Silva', email: 'ana@example.com' }];
    const findMany = vi.spyOn(prisma.user, 'findMany').mockResolvedValue(users);
    const res = createResponse();

    await usersController.listUsers({}, res);

    expect(findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('rejects an invalid user id before querying Prisma', async () => {
    const findUnique = vi.spyOn(prisma.user, 'findUnique');
    const res = createResponse();

    await usersController.getUser({ params: { id: '0' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'id inválido.' });
    expect(findUnique).not.toHaveBeenCalled();
  });
});
