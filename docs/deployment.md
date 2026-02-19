# Deployment

## Docker Compose (Development)

The full stack can be run with Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up
```

### Services

| Service | Image/Build | Port | Depends On |
|---------|-------------|------|------------|
| `postgres` | `postgres:16-alpine` | 5432 | — |
| `minio` | `minio/minio:latest` | 9000, 9001 | — |
| `minio-init` | `minio/mc:latest` | — | minio (healthy) |
| `api` | `docker/Dockerfile.api` | 3001 | postgres (healthy), minio (healthy) |
| `web` | `docker/Dockerfile.web` | 3000 | api |
| `mcp-server` | `docker/Dockerfile.mcp-server` | 3002 | postgres (healthy), minio (healthy) |

PostgreSQL uses a health check (`pg_isready`) before dependent services start.

### Environment Variables

Docker Compose reads from your shell environment or a `.env` file in the `docker/` directory. Required:

- `ANTHROPIC_API_KEY` — passed through to `api` and `mcp-server`
- `JWT_SECRET` — defaults to `change-me-in-production-min16`
- `BETTER_AUTH_SECRET` — defaults to `change-me-in-production-min16`

Default database credentials: `accrue`/`accrue` on database `accrue_ai`.

### Running Just Infrastructure

For local development without containerizing the apps:

```bash
# PostgreSQL + MinIO (recommended)
docker compose -f docker/docker-compose.yml up -d postgres minio minio-init

# PostgreSQL only (no object store)
docker compose -f docker/docker-compose.yml up -d postgres
```

MinIO Console is available at http://localhost:9001 (credentials: `accrue`/`accrue123`). The `minio-init` service auto-creates the `accrue-skills` bucket.

## Dockerfiles

All Dockerfiles are in the `docker/` directory with build context set to the repo root (`..`):

- **`Dockerfile.api`** — Multi-stage Node.js build for the Express API
- **`Dockerfile.web`** — Next.js standalone build
- **`Dockerfile.mcp-server`** — Node.js build for the MCP server

## Kubernetes (Helm)

A Helm chart is available at `helm/accrue-ai/`:

```bash
helm install accrue-ai ./helm/accrue-ai
```

Configure via `helm/accrue-ai/values.yaml` for:
- Image tags and pull policies
- Resource limits
- Environment variables and secrets
- Ingress configuration
- PostgreSQL connection

## Database Migrations in Production

```bash
# Apply pending migrations (non-interactive, safe for CI/CD)
pnpm --filter @accrue-ai/db migrate:deploy
```

This runs `prisma migrate deploy` which applies all pending migrations without creating new ones.

## Production Environment Variables

All variables from [Getting Started](./getting-started.md#environment-variables) apply. For production, ensure:

- `NODE_ENV=production`
- `JWT_SECRET` — strong random secret (32+ characters)
- `BETTER_AUTH_SECRET` — strong random secret (32+ characters)
- `DATABASE_URL` — production PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` — production API URL
- `STORAGE_PROVIDER=s3` — use S3 instead of MinIO
- `STORAGE_BUCKET` — S3 bucket name
- `S3_REGION` — AWS region
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — AWS credentials

See [storage.md](./storage.md) for detailed storage configuration.
