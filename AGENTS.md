# AGENTS.md

NestJS 11 API (AV Manager): PostgreSQL + Drizzle ORM 1.0 RC, JWT/Passport, Zod, Swagger.
The Portuguese `README.md` documents routes but lags the code (no equipamentos/event sections).

## Commands

- `npm run start:dev` — dev server with reload. `npm run build` then `npm run start:prod` runs `node dist/src/main.js` (note the extra `dist/src` level).
- `npm run lint` — ESLint **with `--fix`**; it rewrites files. `npm run format` — Prettier (single quotes, trailing commas).
- `npm test` — unit tests (Jest `rootDir: src`, `*.spec.ts`). Single file: `npm test -- app.controller`.
- `npm run test:e2e` — e2e (`test/*.e2e-spec.ts`); single file: `npm run test:e2e -- app.e2e`.
- Migrations have no npm script: `npx drizzle-kit generate`, then `npx drizzle-kit migrate`. Config: `drizzle.config.ts` → schema `src/db/schema/index.ts`, output `drizzle/` (one directory per migration).

## Setup and environment gotchas

- Required env: `DATABASE_URL`, `JWT_SECRET` (see README). `.env` is gitignored.
- Only `src/main.ts` loads `.env` (`import 'dotenv/config'`). Jest/e2e never import `main.ts`, and `JwtModule`/`DbModule` read `process.env` at module load. Export the vars in the shell before `npm run test:e2e`; it boots the full `AppModule` and needs a reachable Postgres because `PermissionsSync` runs on bootstrap.
- `dotenv` is not a direct dependency; it arrives transitively via `@nestjs/config`. If you remove `@nestjs/config`, add `dotenv` explicitly or `main.ts` breaks.

## Architecture

- Feature modules: `auth`, `users`, `permissions`, `circuitos`, `equipamentos`, `event`. Convention per module: `<name>.controller.ts`, `<name>.service.ts`, `<name>.schemas.ts` (Zod), `<name>.module.ts`.
- `src/db/schema/*` holds Drizzle tables. Every new schema file must be exported from `src/db/schema/index.ts` — that barrel is what drizzle-kit reads.
- Relations are defined centrally in `src/db/relations.ts` with `defineRelations` and passed to `drizzle()` in `src/db/db.module.ts`. Add new relations there. In this drizzle-orm RC, import `relations` from `drizzle-orm/_relations`; the package root exports `defineRelations` but not `relations`.
- All primary keys are 12-char `nanoid` strings generated in app code via `$defaultFn`, not DB defaults. Raw SQL inserts must supply IDs.
- Inject DB access with `@Inject(DRIZZLE) private db: DB`. `DbModule` is `@Global`, so feature modules do not import it. `db.query.<table>` works only for tables wired into `relations.ts`.
- Imports like `from 'src/...'` (baseUrl `./`) are intentional and mixed with relative imports; `nest build` rewrites them to relative paths. Don't "fix" them.

## Auth and permissions (non-obvious)

- The first registered user becomes admin. After that, `POST /auth/register` requires an admin or the `users.create` permission.
- Admins bypass every permission check. The JWT carries `isAdmin`/`circuitoId`; guards read `req.user`.
- `src/permissions/permissions.registry.ts` is the single source of truth for permission keys. `PermissionsSync` reconciles the `permissions` table on startup (inserts new keys, deletes removed ones), so catalog changes need no migration. Use its `Permission` type in `@RequirePermissions(...)`.
- `@RequirePermissions()` alone does nothing: each protected route also needs `@UseGuards(PermissionsGuard)`. Controllers typically apply `@UseGuards(JwtAuthGuard)` at class level. `PermissionsModule` is `@Global` and exports the guard/service.

## Conventions

- Validate input with `new ZodValidationPipe(schema)` and schemas in `<module>.schemas.ts`; class-validator is not used.
- Swagger decorators are expected on routes; shared response schemas live in `src/swagger/schemas.ts`. UI at `/api`, JSON at `/api-json`.
- User-facing error messages are Portuguese; keep new endpoints consistent.
- Tests are minimal (health check only). Add unit tests as `*.spec.ts` under `src/`.

## Work in progress

- `src/event/` is scaffolded: schemas and services exist, controllers are empty stubs.
