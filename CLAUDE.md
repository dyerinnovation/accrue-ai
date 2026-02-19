# Accrue AI Monorepo

## What This Is

Monorepo for an AI skill creation and management platform. Three apps (api, web, mcp-server) share six packages (shared, db, auth, claude-client, skill-engine, storage). Skills are packages — directories containing SKILL.md + supporting files, stored in an object store (MinIO/S3).

## Tech Stack

Node 22+, TypeScript 5.7 (strict), pnpm 9 workspaces, Turborepo, Vitest, Zod.

## Dependency Graph

```
@accrue-ai/shared          (leaf: types, constants, utils — no internal deps)
    ▲
    ├── @accrue-ai/db           (Prisma 6.2, PostgreSQL 16)
    ├── @accrue-ai/auth         (custom HS256 JWT, bcryptjs)
    ├── @accrue-ai/claude-client (Anthropic SDK 0.37)
    ├── @accrue-ai/storage      (MinIO/S3 object store abstraction)
    │
    └── @accrue-ai/skill-engine (parse, create, validate, iterate, compare, package, import)
            ▲
            ├── apps/api         (Express 4.21, port 3001 — depends on ALL packages)
            ├── apps/mcp-server  (MCP stdio — depends on db, shared, skill-engine, claude-client, storage)
            └── apps/web         (Next.js 15, port 3000 — depends on @shared ONLY)
```

## Workspace Layout

```
apps/api/             Express REST API, port 3001
apps/web/             Next.js 15 + React 19 frontend, port 3000
apps/mcp-server/      MCP protocol server, stdio transport
packages/shared/      Types, constants, env validation, utils (Zod schemas)
packages/db/          Prisma 6.2 schema + client singleton
packages/auth/        JWT (custom HS256) + bcryptjs passwords
packages/claude-client/  Anthropic SDK wrapper (chat + chatStream)
packages/skill-engine/   Skill lifecycle: parse, create, validate, iterate, compare, package, import
packages/storage/        Object store abstraction (MinIO for dev, S3 for production)
skills/               Bundled skill definitions (SKILL.md files)
plugin/               Claude Code plugin (manifest, MCP config, bundled skills)
docker/               Dockerfiles + docker-compose.yml (postgres, minio, api, web, mcp-server)
helm/                 Kubernetes Helm chart
docs/                 Project documentation
```

## Build & Run

```bash
pnpm install                    # Install all deps
pnpm dev                        # Run all apps (Turborepo parallel)
pnpm build                      # Build everything (tsc + next build)
pnpm test                       # Run all vitest suites
pnpm db:generate                # Generate Prisma client
pnpm db:migrate                 # Run Prisma migrations
pnpm db:seed                    # Seed database

# Individual apps
pnpm --filter @accrue-ai/api dev
pnpm --filter @accrue-ai/web dev
pnpm --filter @accrue-ai/<name> test

# Database + Object Store
docker compose -f docker/docker-compose.yml up -d postgres minio minio-init
```

## TypeScript Conventions

- Target ES2022, module Node16, strict mode
- `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`
- All packages export through `dist/` (tsc compiled)
- Import with `.js` extensions (Node16 module resolution)
- Zod for all runtime validation (env, request bodies, skill frontmatter)

## Environment

Copy `.env.example` to `.env`. Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — 16+ character HMAC secret
- `BETTER_AUTH_SECRET` — 16+ character session secret
- `ANTHROPIC_API_KEY` — `sk-ant-*` API key

## Key Patterns

- **API layering:** routes -> controllers -> services -> repositories (all object literals, not classes)
- **Response envelope:** `{ success, data?, error?: { code, message }, pagination? }`
- **Skill packages:** SKILL.md + supporting files stored in object store (MinIO/S3), metadata in PostgreSQL
- **Skill content:** SKILL.md format with YAML frontmatter (gray-matter) + markdown sections
- **Prisma singleton:** global caching in dev (`packages/db/src/index.ts`)
- **ClaudeClient:** wraps Anthropic SDK with `chat()` and `chatStream()` methods
- **Template substitution:** `SKILL_TEMPLATE` uses `{{placeholder}}` (double curly braces)
- **`API_ROUTES`** in `packages/shared/src/constants.ts` is the single source of truth for all route paths

## Testing

All packages use vitest. Tests live in `__tests__/` directories co-located with source.

## Documentation

See `docs/` directory for detailed documentation on each component.
