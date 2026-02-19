# Accrue AI Plugin for Claude Code

This plugin integrates Accrue AI's skill management platform with Claude Code, giving you access to your AI skill library directly from the command line.

## Installation

```bash
# Install as a Claude Code plugin
claude plugin add ./plugin

# Or install from the repository
claude plugin add dyerinnovation/accrue-ai
```

## Prerequisites

- **PostgreSQL** — For storing skill metadata
- **MinIO** (local) or **S3** (production) — For storing skill files
- **Node.js 22+** — Runtime

### Quick Setup

```bash
# Start local services
docker compose -f docker/docker-compose.yml up -d postgres minio

# Build the MCP server
pnpm install && pnpm build

# Set environment variables
export DATABASE_URL="postgresql://accrue:accrue@localhost:5432/accrue"
export STORAGE_PROVIDER=minio
export MINIO_ENDPOINT=http://localhost:9000
export MINIO_ACCESS_KEY=accrue
export MINIO_SECRET_KEY=accrue123
export STORAGE_BUCKET=accrue-skills
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_skills` | Search and filter published skills |
| `get_skill` | Fetch a skill's full SKILL.md content |
| `create_skill` | Create a new skill with auto-generated template |
| `iterate_skill` | Request improvements to an existing skill |
| `list_skill_files` | List all files in a skill package |
| `get_skill_file` | Fetch a specific file from a skill |

## Bundled Skills

### skill-creator

The foundational meta-skill that guides AI agents through creating, testing, and iterating on reusable AI skills. This is the bootstrap — it creates all other skills.

Located at: `plugin/skills/skill-creator/SKILL.md`

## Skill Format

Skills follow the [Agent Skills](https://agentskills.io) open standard:

```
my-skill/
├── SKILL.md              # Main skill definition (required)
├── scripts/              # Executable scripts (optional)
├── templates/            # Templates (optional)
├── examples/             # Examples (optional)
└── references/           # Reference docs (optional)
```

## Learn More

- [Accrue AI Documentation](https://github.com/dyerinnovation/accrue-ai/tree/main/docs)
- [Agent Skills Standard](https://agentskills.io)
