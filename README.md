# AV Manager API

API de gerenciamento de equipes de áudio e vídeo, construída com [NestJS](https://nestjs.com/).

## Visão geral

- Cadastro e login de usuários (login por `username`, email opcional).
- Circuitos com nome, aos quais os usuários podem ser vinculados (um circuito por usuário, vários usuários por circuito).
- Permissões por usuário, com chaves granulares e filtro por curinga.
- Documentação Swagger/OpenAPI de todas as rotas.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + Drizzle ORM
- Autenticação JWT (Passport)
- Validação com Zod
- Hash de senha com Argon2
- Swagger (`@nestjs/swagger`)

## Configuração

Crie um arquivo `.env` na raiz:

```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/av_manager"
JWT_SECRET="troque-este-segredo"
PORT=3000
```

Instale as dependências e aplique as migrations:

```bash
npm install
npx drizzle-kit migrate
```

## Executando

```bash
# desenvolvimento
npm run start

# watch mode
npm run start:dev

# produção (após npm run build)
npm run start:prod
```

## Documentação

Com a API no ar:

- Swagger UI: `http://localhost:3000/api`
- OpenAPI JSON: `http://localhost:3000/api-json`

Use o botão **Authorize** e informe o `accessToken` retornado pelo login para testar as rotas protegidas.

## Health check

```http
GET /ping
```

Resposta: `pong`.

## Autenticação

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

O cadastro exige `username`, `firstName`, `lastName` e `password`; `middleName`, `email` e `circuitoId` são opcionais.

## Rotas

### Circuitos

| Método | Rota | Permissão |
| --- | --- | --- |
| GET | `/circuitos` | autenticado |
| GET | `/circuitos/:id` | autenticado |
| GET | `/circuitos/:id/users` | autenticado |
| POST | `/circuitos` | `circuito.create` |
| PATCH | `/circuitos/:id` | `circuito.edit` |
| PATCH | `/circuitos/:id/users/:userId` | `circuito.edit` |

### Usuários e permissões

| Método | Rota | Permissão |
| --- | --- | --- |
| GET | `/users` | `users.view` |
| GET | `/users/me/permissions` | autenticado |
| GET | `/users/:userId/permissions` | `users.viewPerm` |
| PUT | `/users/me/permissions` | `users.setPerm` |
| PUT | `/users/:userId/permissions` | `users.setPerm` |

A listagem de usuários aceita os query params `search` (username, nome ou email), `circuitoId`, `isAdmin`, `page` e `limit`:

```http
GET /users?circuitoId=Aw_M6jP36B8F&search=joao&page=1&limit=20
```

As rotas de leitura aceitam o query param `pattern` para filtrar chaves exatas ou por curinga:

```http
GET /users/me/permissions?pattern=circuito.*
```

Usuários com `is_admin` têm acesso total, independentemente das permissões atribuídas.

## Estrutura

```
src/
  auth/          cadastro, login, JWT e guards
  circuitos/     CRUD de circuitos e vínculo de usuários
  permissions/   catálogo, guards e gestão de permissões
  users/         acesso a dados de usuários
  db/            schema Drizzle e conexão
  swagger/       schemas compartilhados da documentação
drizzle/         migrations geradas pelo drizzle-kit
```

## Scripts

```bash
npm run build       # compila para dist/
npm run start:dev   # servidor com reload
npm run test        # testes unitários
npm run test:e2e    # testes end-to-end
```
