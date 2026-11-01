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
```
