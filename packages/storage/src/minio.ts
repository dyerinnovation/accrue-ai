// MinIO is S3-compatible — this re-exports S3Storage configured for MinIO.
// The S3Storage class handles MinIO via endpoint + forcePathStyle options.
export { S3Storage as MinioStorage } from "./s3.js";
