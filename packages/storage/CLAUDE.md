# packages/storage

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Abstract object storage interface with pluggable backends (MinIO for local dev, S3 for production). Used for storing skill files (SKILL.md + scripts + assets).

## Key Files

- `src/types.ts` — `StorageProvider` interface, `StorageConfig` type
- `src/s3.ts` — `S3Storage` class (works for both S3 and MinIO via `@aws-sdk/client-s3`)
- `src/minio.ts` — Re-exports `S3Storage` as `MinioStorage` (MinIO is S3-compatible)
- `src/factory.ts` — `createStorageProvider(config)` factory function
- `src/index.ts` — Barrel export

## Conventions

- Both MinIO and S3 use the same `S3Storage` class — MinIO is S3-compatible
- MinIO distinguished by `endpoint` + `forcePathStyle: true`; S3 uses `region`
- Factory reads `StorageConfig` and returns the appropriate provider
- All methods are async and work with `Buffer` or `Readable` streams

## Common Tasks

```bash
pnpm --filter @accrue-ai/storage build   # Compile to dist/
pnpm --filter @accrue-ai/storage test    # Run vitest
```

## Gotchas

- MinIO must be running for integration tests (`docker compose up -d minio`)
- `deletePrefix` iterates all objects under the prefix and deletes individually — no batch delete
- `getSignedUrl` default expiry is 1 hour (3600 seconds)
