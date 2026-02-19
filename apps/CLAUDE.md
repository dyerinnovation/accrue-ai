# apps/

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Three deployable applications that consume the shared packages.

## Applications

| App | Stack | Port | Internal Dependencies |
|-----|-------|------|-----------------------|
| `api/` | Express 4.21 REST API | 3001 | ALL packages |
| `web/` | Next.js 15 + React 19 | 3000 | `@accrue-ai/shared` ONLY |
| `mcp-server/` | MCP protocol (stdio) | stdio | db, shared, skill-engine, claude-client |

## Key Rule

**`web/` must NEVER import from `db`, `auth`, `claude-client`, or `skill-engine`.** Only `@accrue-ai/shared` is allowed as a dependency for the frontend — the other packages contain Node.js-only code (Prisma, crypto, Anthropic SDK).

## Running

```bash
pnpm dev                              # All apps via Turborepo
pnpm --filter @accrue-ai/api dev      # API only
pnpm --filter @accrue-ai/web dev      # Web only
pnpm --filter @accrue-ai/mcp-server dev  # MCP server only
```
