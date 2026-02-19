# Getting Started

## Prerequisites

- **Node.js 22+** — required by the `engines` field in `package.json`
- **pnpm 9.15+** — workspace package manager ([install guide](https://pnpm.io/installation))
- **Docker** — for running PostgreSQL locally
- **Anthropic API key** — for AI-powered skill iteration (`sk-ant-*`)

## Installation

```bash
# Clone the repository
git clone https://github.com/dyerinnovation/accrue-ai.git
cd accrue-ai

# Copy environment variables
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY, JWT_SECRET (16+ chars), BETTER_AUTH_SECRET (16+ chars)

# Install dependencies
pnpm install

# Start PostgreSQL and MinIO (object store)
docker compose -f docker/docker-compose.yml up -d postgres minio minio-init

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed

# Start all applications in development mode
pnpm dev
```

## Services

After `pnpm dev`, the following services are running:

| Service | URL | Description |
|---------|-----|-------------|
| Web UI | http://localhost:3000 | Next.js frontend |
| API | http://localhost:3001/api/health | Express REST API |
| MCP Server | stdio | Model Context Protocol server |
| MinIO S3 API | http://localhost:9000 | Object store (skill files) |
| MinIO Console | http://localhost:9001 | MinIO web UI (accrue/accrue123) |

## Running Individual Apps

```bash
# API only
pnpm --filter @accrue-ai/api dev

# Web frontend only
pnpm --filter @accrue-ai/web dev

# MCP server (for testing)
pnpm --filter @accrue-ai/mcp-server dev
```

## Using the MCP Server with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "accrue-ai": {
      "command": "node",
      "args": ["<path-to-repo>/apps/mcp-server/dist/index.js"],
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

## Creating Your First Skill

### Via the Web UI

1. Navigate to http://localhost:3000
2. Register an account
3. Go to the Dashboard and click "Create Skill"
4. Follow the wizard through the 7-step process

### Via the API

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Dev"}'

# Login (save the accessToken)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' | jq -r '.data.accessToken')

# Create a skill
curl -X POST http://localhost:3001/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"My Skill","description":"Does something useful","content":"---\nname: My Skill\ndescription: Does something useful\ntags: []\nversion: 1\n---\n\n## Purpose\nTBD\n\n## Instructions\nTBD"}'
```

## Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @accrue-ai/shared test
pnpm --filter @accrue-ai/api test

# CI mode (single run, no watch)
pnpm test:ci
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | HMAC secret for JWT signing (min 16 chars) |
| `JWT_EXPIRY` | No | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | No | `7d` | Refresh token lifetime |
| `BETTER_AUTH_SECRET` | Yes | — | Better Auth session secret (min 16 chars) |
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key (`sk-ant-*`) |
| `CLAUDE_MODEL` | No | `claude-sonnet-4-20250514` | Claude model ID |
| `API_PORT` | No | `3001` | API server port |
| `API_URL` | No | `http://localhost:3001` | API base URL |
| `WEB_PORT` | No | `3000` | Web server port |
| `MCP_SERVER_PORT` | No | `3002` | MCP server port (reserved) |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001/api` | API URL for the frontend |
| `NODE_ENV` | No | `development` | Environment |
| `LOG_LEVEL` | No | `debug` | Log verbosity |
| `STORAGE_PROVIDER` | No | `minio` | `"minio"` or `"s3"` |
| `STORAGE_BUCKET` | No | `accrue-skills` | Object store bucket name |
| `MINIO_ENDPOINT` | For MinIO | — | MinIO S3 API URL (e.g., `http://localhost:9000`) |
| `MINIO_ACCESS_KEY` | For MinIO | — | MinIO root user |
| `MINIO_SECRET_KEY` | For MinIO | — | MinIO root password |
| `S3_REGION` | For S3 | — | AWS region |
| `AWS_ACCESS_KEY_ID` | For S3 | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | For S3 | — | AWS secret key |
