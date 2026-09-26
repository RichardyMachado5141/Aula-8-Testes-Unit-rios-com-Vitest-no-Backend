const express = require('express');
const usersRoutes = require('./routes/usersRoutes');
const prisma = require('./lib/prisma');

const app = express();

app.use(express.json());

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  return res.json({ status: 'ok', database: 'connected' });
});

app.use('/users', usersRoutes);

app.use((error, _req, res, _next) => {
  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um usuário com este email.' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'JSON inválido.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;