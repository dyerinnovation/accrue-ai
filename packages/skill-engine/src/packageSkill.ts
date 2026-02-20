import type { SkillBundle, SkillPackage } from "@accrue-ai/shared";
import type { StorageProvider } from "@accrue-ai/storage";
import { parseSkill } from "./parseSkill.js";
import * as tarStream from "tar-stream";
import { createGzip } from "zlib";

/**
 * Package a skill from the object store into a tar.gz archive.
 * Reads all files under the storage path and creates a downloadable archive.
 */
export async function packageSkill(
  storage: StorageProvider,
  storagePath: string
): Promise<{ archive: Buffer; metadata: SkillPackage }> {
  const keys = await storage.listObjects(storagePath);

  if (keys.length === 0) {
    throw new Error(`No files found at storage path: ${storagePath}`);
  }

  // Read all files from storage
  const files: Record<string, Buffer> = {};
  for (const key of keys) {
    const relativePath = key.slice(storagePath.length);
    if (relativePath) {
      files[relativePath] = await storage.getObject(key);
    }
  }

  // Parse SKILL.md for metadata
  const skillMdBuf = files["SKILL.md"];
  if (!skillMdBuf) {
    throw new Error(`SKILL.md not found in storage path: ${storagePath}`);
  }

  const parsed = parseSkill(skillMdBuf.toString("utf-8"));

  const metadata: SkillPackage = {
    metadata: parsed.frontmatter,
    files: Object.fromEntries(
      Object.entries(files).map(([path, buf]) => [path, buf])
    ),
    version: parsed.frontmatter.version,
    exportedAt: new Date().toISOString(),
  };

  const archive = await createTarGz(files);

  return { archive, metadata };
}

/**
 * Legacy: Package a skill as JSON (SkillBundle format).
 * Kept for backward compatibility with existing imports/exports.
 */
export function packageSkillJson(
  content: string,
  assets?: Record<string, string>
): string {
  const parsed = parseSkill(content);

  const bundle: SkillBundle = {
    metadata: parsed.frontmatter,
    content,
    assets: assets ?? {},
    version: parsed.frontmatter.version,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(bundle, null, 2);
}

async function createTarGz(files: Record<string, Buffer>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pack = tarStream.pack();
    const gzip = createGzip();
    const chunks: Buffer[] = [];

    gzip.on("data", (chunk: Buffer) => chunks.push(chunk));
    gzip.on("end", () => resolve(Buffer.concat(chunks)));
    gzip.on("error", reject);

    pack.pipe(gzip);

    for (const [path, data] of Object.entries(files)) {
      pack.entry({ name: path, size: data.length }, data);
    }

    pack.finalize();
  });
}
