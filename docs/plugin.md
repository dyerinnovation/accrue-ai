# Claude Code Plugin

## Overview

Accrue AI can be used as a Claude Code plugin, giving AI agents direct access to the skill library via MCP tools. The plugin is located in the `plugin/` directory at the repo root.

## Structure

```
plugin/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── skills/
│   └── skill-creator/
│       └── SKILL.md          # Bundled skill-creator skill
├── .mcp.json                 # MCP server configuration
└── README.md                 # Plugin installation docs
```

## Installation

### From Local Clone

```bash
claude --plugin-dir /path/to/accrue-ai/plugin
```

### Using the MCP Server Directly

Add to `~/.config/claude/claude_desktop_config.json`:

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

Build first: `pnpm --filter @accrue-ai/mcp-server build`

## Available Tools

When the plugin is active, the following MCP tools are available:

| Tool | Description |
|------|-------------|
| `list_skills` | Search and filter published skills |
| `get_skill` | Fetch full SKILL.md content |
| `create_skill` | Create a new skill |
| `iterate_skill` | Request iteration on a skill |
| `list_skill_files` | List files in a skill package |
| `get_skill_file` | Fetch a specific file from a skill |

## Bundled Skills

The plugin includes a bundled `skill-creator` skill — a meta-skill that guides AI agents through creating new skills using a 7-step workflow.

## Agent Skills Standard

Skills exported from Accrue AI follow the [Agent Skills](https://agentskills.io) standard used by Claude Code. Exported tar.gz archives can be extracted directly into `~/.claude/skills/`.

### Compatible Frontmatter Fields

```yaml
---
name: skill-name
description: What this skill does
tags: [tag1, tag2]
version: 1
# Claude Code-specific fields (optional)
disable-model-invocation: false
user-invocable: true
allowed-tools: []
---
```

## Marketplace

A `marketplace.json` file at the repo root enables future distribution via a Claude Code marketplace:

```bash
/plugin marketplace add dyerinnovation/accrue-ai
```
