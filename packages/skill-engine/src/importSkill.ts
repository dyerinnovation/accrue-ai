import { SkillFrontmatterSchema, type SkillBundle, type SkillFileEntry } from "@accrue-ai/shared";
import type { StorageProvider } from "@accrue-ai/storage";
import { slugify } from "@accrue-ai/shared";
import { parseSkill } from "./parseSkill.js";
import type { ImportSkillResult } from "./types.js";
import * as tarStream from "tar-stream";
import { createGunzip } from "zlib";

/**
 * Import a skill from a tar.gz archive into the object store.
 * Extracts the archive, writes files to storage, and returns metadata + file manifest.
 */
export async function importSkill(
  archive: Buffer,
  storage: StorageProvider,
  targetPath: string
): Promise<ImportSkillResult> {
  const files = await extractTarGz(archive);

  const skillMd = files.find((f) => f.path === "SKILL.md");
  if (!skillMd) {
    throw new Error("Archive must contain a SKILL.md file");
  }

  const content = typeof skillMd.content === "string"
    ? skillMd.content
    : skillMd.content.toString("utf-8");
  const parsed = parseSkill(content);
  const metadata = SkillFrontmatterSchema.parse(parsed.frontmatter);

  // Write all files to the object store
  for (const file of files) {
    const storageKey = `${targetPath}${file.path}`;
    const data = typeof file.content === "string"
      ? Buffer.from(file.content)
      : file.content;
    await storage.putObject(storageKey, data, file.contentType);
  }

  return {
    skill: {
      name: metadata.name,
      slug: slugify(metadata.name),
      description: metadata.description,
      content,
      version: metadata.version,
      tags: metadata.tags,
    },
    files,
  };
}

/**
 * Legacy: Import a skill from JSON (SkillBundle format).
 * Kept for backward compatibility.
 */
export function importSkillJson(bundleJson: string): ImportSkillResult {
  const raw = JSON.parse(bundleJson) as SkillBundle;

  const metadata = SkillFrontmatterSchema.parse(raw.metadata);

  if (!raw.content || typeof raw.content !== "string") {
    throw new Error("Invalid skill bundle: missing content");
  }

  const files: SkillFileEntry[] = [
    { path: "SKILL.md", content: raw.content, contentType: "text/markdown" },
  ];

  // Convert legacy assets to file entries
  if (raw.assets) {
    for (const [path, content] of Object.entries(raw.assets)) {
      files.push({ path, content });
    }
  }

  return {
    skill: {
      name: metadata.name,
      slug: slugify(metadata.name),
      description: metadata.description,
      content: raw.content,
      version: metadata.version,
      tags: metadata.tags,
    },
    files,
  };
}

function extractTarGz(archive: Buffer): Promise<SkillFileEntry[]> {
  return new Promise((resolve, reject) => {
    const extract = tarStream.extract();
    const gunzip = createGunzip();
    const files: SkillFileEntry[] = [];

    extract.on("entry", (header, stream, next) => {
      if (header.type === "file") {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          const data = Buffer.concat(chunks);
          const contentType = guessContentType(header.name);
          files.push({
            path: header.name,
            content: contentType.startsWith("text/") ? data.toString("utf-8") : data,
            contentType,
          });
          next();
        });
        stream.on("error", reject);
      } else {
        stream.resume();
        next();
      }
    });

    extract.on("finish", () => resolve(files));
    extract.on("error", reject);
    gunzip.on("error", reject);

    gunzip.pipe(extract);
    gunzip.end(archive);
  });
}

function guessContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    md: "text/markdown",
    txt: "text/plain",
    py: "text/x-python",
    js: "text/javascript",
    ts: "text/typescript",
    sh: "text/x-shellscript",
    json: "application/json",
    yaml: "text/yaml",
    yml: "text/yaml",
    html: "text/html",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
  };
  return contentTypes[ext ?? ""] ?? "application/octet-stream";
}
