# apps/mcp-server

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Model Context Protocol server exposing skill tools to AI agents like Claude. Uses stdio transport. See [docs/mcp-server.md](../../docs/mcp-server.md) for full documentation.

## Key Files

- `src/index.ts` — Single-file server. All 6 tools defined here.

## Tools

| Tool | Description |
|------|-------------|
| `list_skills` | Search/filter published skills (query, tags, team) |
| `get_skill` | Fetch full skill content from object store (DB fallback) |
| `create_skill` | Create new skill, write files to object store |
| `iterate_skill` | Request iteration (placeholder — full AI iteration not yet wired) |
| `list_skill_files` | List files in a skill (DB records or object store listing) |
| `get_skill_file` | Fetch a specific file from object store |

## Conventions

- **Single-file architecture** — no routes/controllers pattern
- Direct Prisma queries — no repository layer
- Storage provider initialized at startup from env vars
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
- `get_skill` reads SKILL.md from object store first, falls back to DB `content` column
- `create_skill` writes to object store and creates SkillVersion + SkillFile DB records
- `iterate_skill` currently returns guidance text only — does not call Claude API
- Requires storage env vars (STORAGE_PROVIDER, MINIO_ENDPOINT, etc.)
