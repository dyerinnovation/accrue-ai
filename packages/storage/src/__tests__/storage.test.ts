import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStorageProvider } from "../factory.js";
import type { StorageConfig } from "../types.js";

// Mock the AWS SDK
vi.mock("@aws-sdk/client-s3", () => {
  const send = vi.fn();
  return {
    S3Client: vi.fn(() => ({ send })),
    PutObjectCommand: vi.fn((input: unknown) => ({ _type: "PutObject", input })),
    GetObjectCommand: vi.fn((input: unknown) => ({ _type: "GetObject", input })),
    DeleteObjectCommand: vi.fn((input: unknown) => ({ _type: "DeleteObject", input })),
    ListObjectsV2Command: vi.fn((input: unknown) => ({ _type: "ListObjects", input })),
    HeadObjectCommand: vi.fn((input: unknown) => ({ _type: "HeadObject", input })),
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(() => Promise.resolve("https://signed-url.example.com/test")),
}));

describe("Storage Factory", () => {
  it("creates a provider for minio config", () => {
    const config: StorageConfig = {
      provider: "minio",
      bucket: "test-bucket",
      endpoint: "http://localhost:9000",
      accessKey: "test",
      secretKey: "test123",
    };
    const provider = createStorageProvider(config);
    expect(provider).toBeDefined();
    expect(typeof provider.putObject).toBe("function");
    expect(typeof provider.getObject).toBe("function");
    expect(typeof provider.deleteObject).toBe("function");
    expect(typeof provider.listObjects).toBe("function");
    expect(typeof provider.getSignedUrl).toBe("function");
    expect(typeof provider.objectExists).toBe("function");
  });

  it("creates a provider for s3 config", () => {
    const config: StorageConfig = {
      provider: "s3",
      bucket: "prod-bucket",
      region: "us-east-1",
    };
    const provider = createStorageProvider(config);
    expect(provider).toBeDefined();
  });
});

describe("S3Storage", () => {
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { S3Client } = await import("@aws-sdk/client-s3");
    const client = new S3Client({});
    mockSend = client.send as ReturnType<typeof vi.fn>;
  });

  it("putObject sends PutObjectCommand", async () => {
    mockSend.mockResolvedValueOnce({});
    const provider = createStorageProvider({
      provider: "minio",
      bucket: "test",
      endpoint: "http://localhost:9000",
      accessKey: "test",
      secretKey: "test123",
    });
    await provider.putObject("test/file.txt", Buffer.from("hello"), "text/plain");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("objectExists returns true for existing objects", async () => {
    mockSend.mockResolvedValueOnce({});
    const provider = createStorageProvider({
      provider: "minio",
      bucket: "test",
      endpoint: "http://localhost:9000",
      accessKey: "test",
      secretKey: "test123",
    });
    const exists = await provider.objectExists("test/file.txt");
    expect(exists).toBe(true);
  });

  it("objectExists returns false for missing objects", async () => {
    mockSend.mockRejectedValueOnce(new Error("NotFound"));
    const provider = createStorageProvider({
      provider: "minio",
      bucket: "test",
      endpoint: "http://localhost:9000",
      accessKey: "test",
      secretKey: "test123",
    });
    const exists = await provider.objectExists("missing/file.txt");
    expect(exists).toBe(false);
  });

  it("listObjects paginates through results", async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [{ Key: "a/1.txt" }, { Key: "a/2.txt" }],
        NextContinuationToken: "token1",
      })
      .mockResolvedValueOnce({
        Contents: [{ Key: "a/3.txt" }],
        NextContinuationToken: undefined,
      });

    const provider = createStorageProvider({
      provider: "minio",
      bucket: "test",
      endpoint: "http://localhost:9000",
      accessKey: "test",
      secretKey: "test123",
    });
    const keys = await provider.listObjects("a/");
    expect(keys).toEqual(["a/1.txt", "a/2.txt", "a/3.txt"]);
  });

  it("getSignedUrl returns a signed URL", async () => {
    const provider = createStorageProvider({
      provider: "minio",
      bucket: "test",
      endpoint: "http://localhost:9000",
      accessKey: "test",
      secretKey: "test123",
    });
    const url = await provider.getSignedUrl("test/file.txt");
    expect(url).toContain("https://signed-url.example.com");
  });
});
