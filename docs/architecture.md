# Architecture

## System Overview

Accrue AI is a platform for creating, iterating, testing, and sharing reusable AI agent skills. The system has three user-facing applications backed by five shared packages.

```
                  ┌──────────────┐
                  │   Web UI     │  Next.js 15 / React 19
                  │   :3000      │  Tailwind 4
                  └──────┬───────┘
                         │ HTTP (React Query)
                         ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐
│  AI Agent    │  │   API        │  │   PostgreSQL 16   │  │  MinIO / S3    │
│  (Claude)    │  │   :3001      │  │   :5432           │  │  :9000         │
│              │  │  Express 4   │  └────────▲──────────┘  └────────▲───────┘
│              │  └──────┬───────┘           │ Prisma ORM           │ S3 SDK
│              │         │                   │                      │
│  ┌───────────┴──┐      └───────────────────┼──────────────────────┘
│  │  MCP Server  │                          │
│  │  (stdio)     ├──────────────────────────┘
│  └──────────────┘
└──────────────────┘
```

Both the API and MCP Server use the shared skill-engine for all skill operations, Prisma for database access, and the storage provider for skill file access. PostgreSQL stores metadata (users, teams, skill records) while MinIO/S3 stores skill files (SKILL.md + scripts + assets). The Claude API (via claude-client) is used for AI-powered skill iteration.

## Package Dependency Graph

```
@accrue-ai/shared          (leaf: types, constants, utils, env validation)
    ▲
    ├── @accrue-ai/db           (Prisma ORM, schema, client singleton)
    ├── @accrue-ai/auth         (JWT, password hashing)
    ├── @accrue-ai/claude-client (Anthropic SDK wrapper)
    │
    └── @accrue-ai/skill-engine (skill CRUD: parse, create, validate, iterate, compare, package, import)
            ▲
            ├── apps/api         (Express REST API — depends on ALL packages)
            ├── apps/mcp-server  (MCP protocol — depends on db, shared, skill-engine, claude-client)
            └── apps/web         (Next.js — depends on @shared ONLY)
```

`@accrue-ai/shared` is the leaf node with zero internal dependencies. All types and schemas that cross package boundaries live there.

The web frontend intentionally only depends on `@accrue-ai/shared` to avoid bundling server-side packages (Prisma, bcryptjs, Anthropic SDK) into the browser.

## Data Flow: Skill Lifecycle

1. **Create** — User input (web wizard or API) -> skill-engine `createSkill()` -> template substitution -> Prisma insert
2. **Validate** — `parseSkill()` extracts frontmatter via gray-matter + sections -> `validateSkill()` checks structure
3. **Iterate** — Feedback + current content -> `iterateSkill()` -> ClaudeClient API call -> new version stored
4. **Compare** — Eval prompts run against two versions -> `compareVersions()` -> scored comparison
5. **Publish** — `validateSkill()` passes -> status change from DRAFT/TESTING to PUBLISHED
6. **Export/Import** — `packageSkill()` -> SkillBundle JSON -> `importSkill()` to restore

### State Machine

```
DRAFT  ──>  TESTING  ──>  PUBLISHED  ──>  ARCHIVED
                │              │
                └──────────────┘  (can revert to TESTING)
```

## API Layer Architecture

The API follows a strict layered pattern:

```
Request
  │
  ▼
Route (path + HTTP method + middleware binding)
  │
  ▼
Controller (parse request, call service, send response)
  │
  ▼
Service (business logic, orchestration)
  │
  ▼
Repository (Prisma queries)
  │
  ▼
Database
```

**Middleware stack** (applied in order):
1. `helmet()` — security headers
2. `cors()` — cross-origin requests
3. `express.json({ limit: "1mb" })` — body parsing
4. `apiRateLimit` — rate limiting
5. Per-route: `authMiddleware`, `validate()` — auth + Zod validation
6. `errorMiddleware` — global error handler (last)

**Response envelope** — all endpoints return:
```json
{
  "success": true,
  "data": {},
  "error": { "code": "...", "message": "..." },
  "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 }
}
```

## Frontend Architecture

- **Next.js 15 App Router** with route groups: `(auth)` for login/register, `(app)` for authenticated pages
- **React Query** for server state management via `Providers` wrapper
- **`src/lib/api.ts`** — fetch wrapper that auto-attaches `Bearer` token from `localStorage`
- **Tailwind CSS 4** via `@tailwindcss/postcss`

## MCP Server Architecture

- Single-file server at `apps/mcp-server/src/index.ts`
- 4 tools: `list_skills`, `get_skill`, `create_skill`, `iterate_skill`
- **Stdio transport** (not HTTP) — designed for Claude Desktop integration
- Direct Prisma access (no API intermediary)

## Authentication Flow

1. User registers/logs in via API -> `generateTokens()` returns access (15m) + refresh (7d) JWT pair
2. Frontend stores tokens in `localStorage`
3. Every API request attaches `Authorization: Bearer <accessToken>` header
4. `authMiddleware` verifies token via custom HS256 implementation, attaches `userId`/`email` to request
5. Refresh flow: client sends refresh token -> API verifies and issues new token pair
