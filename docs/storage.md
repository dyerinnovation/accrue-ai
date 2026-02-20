# Storage

## Overview

Accrue AI uses an object store for skill file storage. Skills are packages — directories containing `SKILL.md` plus supporting files (scripts, templates, examples). PostgreSQL stores metadata (users, teams, skill records), while the object store (MinIO for local dev, S3 for production) holds the actual skill files.

## Architecture

```
PostgreSQL                           Object Store (MinIO / S3)
┌──────────────────────┐            ┌──────────────────────────────────┐
│ Skill                │            │ skills/{team}/{slug}/v{version}/ │
│   name, slug, status │            │   ├── SKILL.md                  │
│   version, tags      │            │   ├── scripts/run.py            │
│   storagePath ───────┼──────────> │   ├── templates/output.md       │
│   content (cached)   │            │   └── examples/sample.md        │
│                      │            │                                  │
│ SkillFile            │            │                                  │
│   path, storageKey ──┼──────────> │  (individual file references)    │
│   size, contentType  │            └──────────────────────────────────┘
└──────────────────────┘
```

## Storage Provider

The `@accrue-ai/storage` package provides an abstract `StorageProvider` interface with a single implementation (`S3Storage`) that works for both S3 and MinIO (MinIO is S3-compatible).

### Interface

```typescript
interface StorageProvider {
  putObject(key: string, data: Buffer | Readable, contentType?: string): Promise<void>;
  getObject(key: string): Promise<Buffer>;
  getObjectStream(key: string): Promise<Readable>;
  deleteObject(key: string): Promise<void>;
  deletePrefix(prefix: string): Promise<void>;
  listObjects(prefix: string): Promise<string[]>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  objectExists(key: string): Promise<boolean>;
}
```

### Configuration

```typescript
interface StorageConfig {
  provider: "minio" | "s3";
  bucket: string;
  endpoint?: string;   // MinIO endpoint (e.g., "http://localhost:9000")
  accessKey?: string;   // MinIO root user or AWS access key
  secretKey?: string;   // MinIO root password or AWS secret key
  region?: string;      // S3 region (e.g., "us-east-1")
}
```

### Factory

```typescript
import { createStorageProvider } from "@accrue-ai/storage";

const storage = createStorageProvider({
  provider: "minio",
  bucket: "accrue-skills",
  endpoint: "http://localhost:9000",
  accessKey: "accrue",
  secretKey: "accrue123",
});
```

## Object Store Layout

```
skills/{teamSlug|_personal}/{skillSlug}/v{version}/
├── SKILL.md              # Main skill definition (required)
├── scripts/              # Executable scripts (optional)
│   └── run.py
├── templates/            # Templates (optional)
│   └── template.md
├── examples/             # Example input/output (optional)
│   └── sample.md
└── references/           # Reference documentation (optional)
    └── guide.md
```

- `_personal` prefix for skills with no team
- Each version is a complete snapshot (no deltas)
- `SKILL.md` is always the entrypoint

## MinIO Setup (Local Development)

MinIO is included in `docker/docker-compose.yml`:

```bash
docker compose -f docker/docker-compose.yml up -d minio
```

- **S3 API:** http://localhost:9000
- **Console UI:** http://localhost:9001
- **Credentials:** `accrue` / `accrue123`
- **Default bucket:** `accrue-skills` (auto-created by `minio-init` service)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE_PROVIDER` | No | `minio` | `"minio"` or `"s3"` |
| `STORAGE_BUCKET` | No | `accrue-skills` | Object store bucket name |
| `MINIO_ENDPOINT` | For MinIO | — | MinIO S3 API URL |
| `MINIO_ACCESS_KEY` | For MinIO | — | MinIO root user |
| `MINIO_SECRET_KEY` | For MinIO | — | MinIO root password |
| `S3_REGION` | For S3 | — | AWS region |
| `AWS_ACCESS_KEY_ID` | For S3 | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | For S3 | — | AWS secret key |

## S3 Setup (Production)

For production, use S3 instead of MinIO:

```bash
STORAGE_PROVIDER=s3
STORAGE_BUCKET=my-accrue-skills-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

No `endpoint` is needed for S3 — the AWS SDK uses the region to determine the endpoint automatically.

## Skill Export/Import

Skills are exported as `.tar.gz` archives containing the full directory structure. The archive format is compatible with the [Agent Skills](https://agentskills.io) standard used by Claude Code.

```bash
# Export via API
GET /api/skills/:id/download  → skill-name-v1.tar.gz

# Import via API
POST /api/skills/import       ← multipart/form-data with archive field
```
