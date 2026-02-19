import { S3Storage } from "./s3.js";
import type { StorageProvider, StorageConfig } from "./types.js";

export function createStorageProvider(config: StorageConfig): StorageProvider {
  // Both MinIO and S3 use the same S3-compatible client.
  // MinIO is distinguished by having an endpoint set.
  // S3Storage handles forcePathStyle automatically when endpoint is present.
  return new S3Storage(config);
}
