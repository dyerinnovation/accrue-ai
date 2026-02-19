import type { Readable } from "stream";

export interface StorageProvider {
  /** Upload an object to the store */
  putObject(key: string, data: Buffer | Readable, contentType?: string): Promise<void>;

  /** Download an object as a Buffer */
  getObject(key: string): Promise<Buffer>;

  /** Download an object as a readable stream */
  getObjectStream(key: string): Promise<Readable>;

  /** Delete a single object */
  deleteObject(key: string): Promise<void>;

  /** Delete all objects under a prefix */
  deletePrefix(prefix: string): Promise<void>;

  /** List all object keys under a prefix */
  listObjects(prefix: string): Promise<string[]>;

  /** Generate a pre-signed URL for direct download */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /** Check if an object exists */
  objectExists(key: string): Promise<boolean>;
}

export interface StorageConfig {
  provider: "minio" | "s3";
  bucket: string;
  /** MinIO endpoint URL (e.g., "http://localhost:9000") */
  endpoint?: string;
  /** Access key (MinIO root user or AWS access key) */
  accessKey?: string;
  /** Secret key (MinIO root password or AWS secret key) */
  secretKey?: string;
  /** AWS region (S3 only) */
  region?: string;
}
