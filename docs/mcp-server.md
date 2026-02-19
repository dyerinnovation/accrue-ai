# MCP Server

## Overview

The MCP (Model Context Protocol) server exposes Accrue AI's skill library to AI agents like Claude. It runs over stdio transport and provides six tools for interacting with skills. The server integrates with the object store (MinIO/S3) for reading and writing skill files.

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

### `list_skill_files`

List all files belonging to a skill.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `identifier` | string | Yes | Skill ID, slug, or name |

Returns file manifest from the database (SkillFile records). Falls back to listing objects from the object store if no DB records exist.

### `get_skill_file`

Fetch a specific file from a skill.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `identifier` | string | Yes | Skill ID, slug, or name |
| `path` | string | Yes | Relative file path (e.g., `scripts/run.py`) |

Reads the file from the object store. Returns text content for text files; returns `[binary file]` placeholder for binary content types.

## Claude Desktop Configuration

Add to `~/.config/claude/claude_desktop_config.json` (or equivalent):

```json
{
  "mcpServers": {
    "accrue-ai": {
      "command": "node",
      "args": ["/path/to/accrue-ai/apps/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://accrue:accrue@localhost:5432/accrue_ai",
        "STORAGE_PROVIDER": "minio",
        "MINIO_ENDPOINT": "http://localhost:9000",
        "MINIO_ACCESS_KEY": "accrue",
        "MINIO_SECRET_KEY": "accrue123",
        "STORAGE_BUCKET": "accrue-skills"
      }
    }
  }
}
```

Build the server first: `pnpm --filter @accrue-ai/mcp-server build`

## Architecture Notes

- Single-file implementation at `apps/mcp-server/src/index.ts`
- Direct Prisma queries (no API intermediary or repository layer)
- Storage provider initialized at startup from environment variables
- Zod schemas defined inline in `server.tool()` calls
- `console.error` for logging (stdout is reserved for MCP protocol)
- `get_skill` reads SKILL.md from object store (falls back to DB `content` column)
- `create_skill` writes files to object store and creates SkillVersion + SkillFile DB records
