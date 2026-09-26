const app = require('./src/app');
const prisma = require('./src/lib/prisma');

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API disponível na porta ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);