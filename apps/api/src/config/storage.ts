import { createStorageProvider, type StorageProvider } from "@accrue-ai/storage";
import { getEnv } from "./env.js";

let _storage: StorageProvider | undefined;

export function getStorage(): StorageProvider {
  if (!_storage) {
    const env = getEnv();
    _storage = createStorageProvider({
      provider: env.STORAGE_PROVIDER,
      bucket: env.STORAGE_BUCKET,
      endpoint: env.MINIO_ENDPOINT,
      accessKey: env.MINIO_ACCESS_KEY ?? env.AWS_ACCESS_KEY_ID,
      secretKey: env.MINIO_SECRET_KEY ?? env.AWS_SECRET_ACCESS_KEY,
      region: env.S3_REGION,
    });
  }
  return _storage;
}
