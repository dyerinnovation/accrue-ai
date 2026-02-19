# apps/api

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Express 4.21 REST API. Port 3001. All routes prefixed `/api`. See [docs/api-reference.md](../../docs/api-reference.md) for endpoint documentation and [docs/architecture.md](../../docs/architecture.md) for layer diagrams.

## Architecture

```
routes/ -> controllers/ -> services/ -> repositories/ -> Prisma
```

Middleware stack (applied in order in `src/app.ts`):
1. `helmet()` — security headers
2. `cors()` — cross-origin
3. `express.json({ limit: "1mb" })` — body parsing
4. `apiRateLimit` — rate limiting
5. Per-route: `authMiddleware`, `validate()` — auth + Zod validation
6. `errorMiddleware` — global error handler (last)

## Key Files

- `src/server.ts` — Entry point (starts Express)
- `src/app.ts` — Express app factory (middleware + routes)
- `src/routes/index.ts` — Route mounting (`/auth`, `/skills`, `/teams`, `/evals`, `/wizard`, `/health`)
- `src/config/env.ts` — Zod-validated environment (`getEnv()`) — includes storage env vars
- `src/config/storage.ts` — Storage provider singleton (`getStorage()`)
- `src/middleware/auth.middleware.ts` — JWT verification, `AuthenticatedRequest` type
- `src/middleware/upload.middleware.ts` — Multer config for multipart file uploads

## Conventions

- Controllers: **object literal** with async methods (NOT classes)
- Services: **object literal**, thin orchestration over repositories + packages
- Repositories: **object literal**, direct Prisma calls
- Validators: Zod schemas in `src/validators/*.schema.ts`
- All responses: `{ success: boolean, data?, error?: { code, message }, pagination? }`

## Adding a New Endpoint

1. Create validator in `src/validators/<domain>.schema.ts`
2. Create repository in `src/repositories/` (if new entity)
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Create route in `src/routes/`
6. Mount in `src/routes/index.ts`

## Common Tasks

```bash
pnpm --filter @accrue-ai/api dev     # Dev with tsx watch
pnpm --filter @accrue-ai/api build   # Compile TypeScript
pnpm --filter @accrue-ai/api test    # Run vitest
```

## Dependencies

`@accrue-ai/db`, `@accrue-ai/shared`, `@accrue-ai/auth`, `@accrue-ai/skill-engine`, `@accrue-ai/claude-client`, `@accrue-ai/storage`

## Gotchas

- Error handling uses try/catch in each controller method — no global async wrapper
- `authMiddleware` attaches `userId` and `userEmail` to the request object
- Route paths match `API_ROUTES` in `packages/shared/src/constants.ts` — keep them in sync
- File uploads use `multer` with memory storage (10MB per file, 20 files max)
- `skill.service.ts` writes skill files to object store and maintains SkillFile DB records
- Storage provider is a singleton initialized from env vars in `src/config/storage.ts`
