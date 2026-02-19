# apps/mcp-server

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Model Context Protocol server exposing skill tools to AI agents like Claude. Uses stdio transport. See [docs/mcp-server.md](../../docs/mcp-server.md) for full documentation.

## Key Files

- `src/index.ts` — Single-file server. All 4 tools defined here.

## Tools

| Tool | Description |
|------|-------------|
| `list_skills` | Search/filter published skills (query, tags, team) |
| `get_skill` | Fetch full skill content by id/slug/name |
| `create_skill` | Create new skill (uses skill-engine + shared slugify) |
| `iterate_skill` | Request iteration (placeholder — full AI iteration not yet wired) |

## Conventions

- **Single-file architecture** — no routes/controllers pattern
- Direct Prisma queries — no repository layer
- Zod schemas defined inline in `server.tool()` calls
- Results always return `{ content: [{ type: "text", text: "..." }] }`
- Errors use `isError: true` flag

## Adding a New Tool

```typescript
server.tool("tool_name", "Description", { /* Zod params */ }, async (params) => {
  // ... implementation
  return { content: [{ type: "text", text: result }] };
  // For errors: return { content: [...], isError: true };
});
```

## Common Tasks

```bash
pnpm --filter @accrue-ai/mcp-server dev     # Dev with tsx watch
pnpm --filter @accrue-ai/mcp-server build   # Compile TypeScript
```

## Gotchas

- Uses **stdio transport**, NOT HTTP. Port 3002 is reserved but unused.
- `console.error` for server logs — stdout is reserved for MCP protocol
- Dynamic imports for `@accrue-ai/skill-engine` and `@accrue-ai/shared` in `create_skill` tool
- `iterate_skill` currently returns guidance text only — does not call Claude API
