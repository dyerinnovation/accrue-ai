# MCP Server

## Overview

The MCP (Model Context Protocol) server exposes Accrue AI's skill library to AI agents like Claude. It runs over stdio transport and provides four tools for interacting with skills.

## Transport

The server uses `StdioServerTransport` — communication happens over stdin/stdout, not HTTP. This is designed for direct integration with Claude Desktop and other MCP-compatible clients.

Port 3002 is reserved in the environment config but currently unused.

## Tools

### `list_skills`

Search and filter published skills.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Search in name and description (case-insensitive) |
| `tags` | string[] | No | Filter by tags (hasSome) |
| `team` | string | No | Filter by team slug |

Returns top 50 published skills ordered by most recently updated.

### `get_skill`

Fetch full skill content by identifier.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `identifier` | string | Yes | Skill ID, slug, or name |

Returns the full SKILL.md content. Returns `isError: true` if not found.

### `create_skill`

Create a new skill.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Skill name |
| `description` | string | Yes | Skill description |
| `content` | string | No | Initial SKILL.md content (auto-generated from template if omitted) |

Uses `createSkill()` from skill-engine for template generation and `slugify()` from shared for slug creation.

### `iterate_skill`

Request iteration on an existing skill.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `identifier` | string | Yes | Skill ID, slug, or name |
| `feedback` | string | Yes | Improvement feedback |

**Note:** This tool currently returns guidance text only. Full AI-powered iteration requires the web app or API (which have ClaudeClient access).

## Claude Desktop Configuration

Add to `~/.config/claude/claude_desktop_config.json` (or equivalent):

```json
{
  "mcpServers": {
    "accrue-ai": {
      "command": "node",
      "args": ["/path/to/accrue-ai/apps/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://accrue:accrue@localhost:5432/accrue_ai"
      }
    }
  }
}
```

Build the server first: `pnpm --filter @accrue-ai/mcp-server build`

## Architecture Notes

- Single-file implementation at `apps/mcp-server/src/index.ts`
- Direct Prisma queries (no API intermediary or repository layer)
- Zod schemas defined inline in `server.tool()` calls
- `console.error` for logging (stdout is reserved for MCP protocol)
- Dynamic imports for `@accrue-ai/skill-engine` and `@accrue-ai/shared` in the `create_skill` tool
