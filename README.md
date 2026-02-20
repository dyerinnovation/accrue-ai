<p align="center">
  <img src="assets/logo.png" alt="Accrue AI" width="200" />
</p>

<h1 align="center">Accrue AI</h1>

<p align="center">Build, iterate, test, and share reusable AI agent skills that compound over time.</p>

Accrue AI is a platform for managing the full lifecycle of AI skills — from initial creation through testing, iteration, and publishing. Skills are defined in a portable markdown format (SKILL.md) and can be accessed via a web UI, REST API, or Model Context Protocol (MCP) server for direct AI agent integration.

## Quick Start

```bash
# Prerequisites: Node.js 22+, pnpm 9+, Docker

# Clone and configure
git clone https://github.com/dyerinnovation/accrue-ai.git
cd accrue-ai
cp .env.example .env   # Edit: set ANTHROPIC_API_KEY, JWT_SECRET, BETTER_AUTH_SECRET

# Install and set up database
pnpm install
docker compose -f docker/docker-compose.yml up -d postgres
pnpm db:generate && pnpm db:migrate

# Start development
pnpm dev
```

**Services:**
| Service | URL | Description |
|---------|-----|-------------|
| Web UI | http://localhost:3000 | Skill management dashboard |
| API | http://localhost:3001/api/health | REST API |
| MCP Server | stdio | AI agent integration |

## Architecture

```
                  ┌──────────────┐
                  │   Web UI     │  Next.js 15 / React 19
                  │   :3000      │  Tailwind CSS 4
                  └──────┬───────┘
                         │ HTTP
                         ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  AI Agent    │  │   API        │  │   PostgreSQL 16   │
│  (Claude)    │  │   :3001      │  │   :5432           │
│              │  │  Express 4   │  └────────▲──────────┘
│              │  └──────┬───────┘           │ Prisma 6.2
│  ┌───────────┴──┐      └───────────────────┤
│  │  MCP Server  │                          │
│  │  (stdio)     ├──────────────────────────┘
│  └──────────────┘
└──────────────────┘
```

## Project Structure

```
accrue-ai/
├── apps/
│   ├── api/               Express REST API (port 3001)
│   ├── web/               Next.js frontend (port 3000)
│   └── mcp-server/        MCP protocol server (stdio)
├── packages/
│   ├── shared/            Types, constants, utilities, Zod schemas
│   ├── db/                Prisma ORM schema and client
│   ├── auth/              JWT authentication and password hashing
│   ├── claude-client/     Anthropic SDK wrapper
│   └── skill-engine/      Skill lifecycle operations
├── skills/                Bundled skill definitions
├── docker/                Dockerfiles and docker-compose.yml
├── helm/                  Kubernetes Helm charts
└── docs/                  Documentation
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System overview, dependency graph, data flows |
| [Getting Started](docs/getting-started.md) | Prerequisites, installation, first skill |
| [API Reference](docs/api-reference.md) | All REST API endpoints |
| [Skill Engine](docs/skill-engine.md) | Skill lifecycle functions |
| [Skill Format](docs/skill-format.md) | SKILL.md specification |
| [Authentication](docs/auth.md) | JWT flow, tokens, middleware |
| [Database](docs/database.md) | Prisma schema, models, migrations |
| [MCP Server](docs/mcp-server.md) | MCP tools, Claude Desktop setup |
| [Web Frontend](docs/web-frontend.md) | Next.js structure, React Query, routing |
| [Deployment](docs/deployment.md) | Docker, Helm, production setup |
| [Contributing](docs/contributing.md) | Code conventions, adding endpoints/packages/skills |

## Tech Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript 5.7 |
| Package Manager | pnpm 9.15 |
| Build | Turborepo 2.3 |
| Backend | Express 4.21 |
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Database | PostgreSQL 16, Prisma 6.2 |
| AI | Anthropic SDK 0.37, MCP SDK 1.4 |
| Auth | Custom JWT (HS256), bcryptjs, Better Auth |
| Validation | Zod 3.24 |
| Testing | Vitest 2.1 |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all test suites |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm clean` | Clean all build artifacts |

## License

TBD
