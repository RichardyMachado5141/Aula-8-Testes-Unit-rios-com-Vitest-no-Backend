const prisma = require('../lib/prisma');

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validUserInput(body) {
  return typeof body?.name === 'string' && body.name.trim() !== ''
    && typeof body?.email === 'string' && body.email.trim() !== '';
}

async function createUser(req, res) {
  if (!validUserInput(req.body)) {
    return res.status(400).json({ error: 'name e email são obrigatórios.' });
  }

  const user = await prisma.user.create({
    data: { name: req.body.name.trim(), email: req.body.email.trim() },
  });
  return res.status(201).json(user);
}

async function listUsers(_req, res) {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
  return res.json(users);
}

async function getUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido.' });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json(user);
}

async function updateUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido.' });
  if (!validUserInput(req.body)) {
    return res.status(400).json({ error: 'name e email são obrigatórios.' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name: req.body.name.trim(), email: req.body.email.trim() },
  });
  return res.json(user);
}

async function deleteUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido.' });

  await prisma.user.delete({ where: { id } });
  return res.status(204).end();
}

module.exports = { createUser, listUsers, getUser, updateUser, deleteUser };