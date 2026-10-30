# API de usuários com Docker Compose

## Objetivo

API REST de CRUD para usuários, construída como projeto acadêmico para praticar a criação e os testes de uma aplicação backend. Os testes unitários e de integração isolam o Prisma com mocks e não exigem um PostgreSQL ativo.

## Tecnologias

- Node.js 22 ou superior
- Express 5.1.0
- Prisma ORM e `@prisma/client` 6.19.0
- PostgreSQL 16
- Docker Compose
- Vitest, Supertest e cobertura V8

O banco e a API executam em serviços separados, ligados pela rede `app_network`; os dados do PostgreSQL ficam no volume nomeado `postgres_data`.

## Estrutura do projeto

```text
.
├── prisma/                 # Schema e migrations do Prisma
├── src/
│   ├── controllers/        # Operações e validações de usuários
│   ├── lib/                # Cliente singleton do Prisma
│   ├── routes/             # Rotas HTTP de usuários
│   └── app.js              # Configuração da aplicação Express
├── tests/
│   ├── integration/        # Testes HTTP com Supertest
│   ├── unit/               # Testes unitários dos controllers
│   └── setup.js            # Configuração de ambiente dos testes
├── server.js               # Inicialização e encerramento do servidor
└── vitest.config.mjs       # Configuração do Vitest e cobertura
```

## Requisitos

- Docker Desktop com Docker Compose v2.
- Para executar a API fora do Docker: Node.js 22 ou superior e npm.

## Configuração e execução

Opcionalmente, copie `.env.example` para `.env` e ajuste as variáveis. Os valores padrão existem apenas para desenvolvimento local e não devem ser usados em produção. O arquivo `.env` é ignorado pelo Git.

```sh
docker compose up -d
docker compose ps
docker compose logs api
docker compose logs db
```

O serviço `api` aguarda o healthcheck do PostgreSQL, aplica as migrations com `prisma migrate deploy` e então inicia o servidor. A URL de conexão usa o hostname `db` da rede do Compose, não `localhost`. A API fica disponível em `http://localhost:3000` (ou na porta definida por `API_PORT`).

## Testes e cobertura

Instale as dependências e execute a suíte de testes:

```sh
npm install
npm test
```

`npm test` executa os testes uma vez e gera a cobertura com V8. O resumo é exibido no terminal e o relatório HTML fica em `coverage/index.html`. Para executar os testes novamente a cada alteração:

```sh
npm run test:watch
```

Os testes de integração enviam requisições HTTP à aplicação Express com Supertest. As operações do Prisma são simuladas, portanto os testes não dependem de um PostgreSQL ativo nem alteram dados reais.

## Endpoints

| Método | Caminho | Descrição |
| --- | --- | --- |
| GET | `/health` | Verifica a API e a conexão com o PostgreSQL |
| POST | `/users` | Cria um usuário (`name`, `email`) |
| GET | `/users` | Lista usuários |
| GET | `/users/:id` | Busca um usuário pelo ID |
| PUT | `/users/:id` | Atualiza `name` e `email` |
| DELETE | `/users/:id` | Remove um usuário |

Exemplo de criação:

```sh
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Silva","email":"ana@example.com"}'
```

Os emails são únicos; uma duplicidade retorna HTTP 409. IDs inexistentes retornam HTTP 404.

## Persistência e parada

Para reiniciar os contêineres preservando os dados:

```sh
docker compose down
docker compose up -d
```

O volume continua associado e não é removido por `docker compose down`. `docker compose down -v` remove o volume e apaga os dados do banco.

## Prisma fora do Docker

Com PostgreSQL acessível localmente e `DATABASE_URL` definida no ambiente, execute:

```sh
npm install
npm run db:generate
npm run db:deploy
npm start
```

Dentro do Compose, a aplicação executa automaticamente a migration versionada em `prisma/migrations` ao iniciar.