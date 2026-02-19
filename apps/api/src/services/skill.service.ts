import {
  createSkill,
  validateSkill,
  iterateSkill as iterateSkillEngine,
  packageSkill,
  packageSkillJson,
  importSkill,
  importSkillJson,
} from "@accrue-ai/skill-engine";
import type { SkillFileEntry } from "@accrue-ai/shared";
import { ClaudeClient } from "@accrue-ai/claude-client";
import { slugify } from "@accrue-ai/shared";
import { skillRepository } from "../repositories/skill.repository.js";
import type { SkillQueryParams } from "../repositories/skill.repository.js";
import { getEnv } from "../config/env.js";
import { getStorage } from "../config/storage.js";

function getClaudeClient(): ClaudeClient {
  const env = getEnv();
  return new ClaudeClient({ apiKey: env.ANTHROPIC_API_KEY, model: env.CLAUDE_MODEL });
}

function buildStoragePath(teamId: string | undefined, slug: string, version: number): string {
  const teamPrefix = teamId ?? "_personal";
  return `skills/${teamPrefix}/${slug}/v${version}/`;
}

async function writeFilesToStorage(
  storagePath: string,
  files: SkillFileEntry[]
): Promise<Array<{ path: string; storageKey: string; size: number; contentType: string }>> {
  const storage = getStorage();
  const manifest: Array<{ path: string; storageKey: string; size: number; contentType: string }> = [];

  for (const file of files) {
    const storageKey = `${storagePath}${file.path}`;
    const data = typeof file.content === "string" ? Buffer.from(file.content) : file.content;
    await storage.putObject(storageKey, data, file.contentType ?? "application/octet-stream");
    manifest.push({
      path: file.path,
      storageKey,
      size: data.length,
      contentType: file.contentType ?? "text/plain",
    });
  }

  return manifest;
}

export const skillService = {
  async list(params: SkillQueryParams) {
    return skillRepository.findMany(params);
  },

  async getById(id: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    return skill;
  },

  async create(
    input: {
      name: string;
      description: string;
      content?: string;
      tags?: string[];
      teamId?: string;
      isPublic?: boolean;
      files?: SkillFileEntry[];
    },
    authorId: string
  ) {
    const created = createSkill({
      name: input.name,
      description: input.description,
      tags: input.tags,
      files: input.files,
    });
    const content = input.content ?? created.content;
    const slug = created.slug;

    // Build storage path and write files to object store
    const storagePath = buildStoragePath(input.teamId, slug, 1);
    const filesToWrite: SkillFileEntry[] = [
      { path: "SKILL.md", content, contentType: "text/markdown" },
      ...(input.files ?? []),
    ];
    const manifest = await writeFilesToStorage(storagePath, filesToWrite);

    // Create skill record in database
    const skill = await skillRepository.create({
      name: input.name,
      slug,
      description: input.description,
      content,
      storagePath,
      authorId,
      teamId: input.teamId,
      tags: input.tags,
      isPublic: input.isPublic,
    });

    // Create version record
    const version = await skillRepository.createVersion({
      skillId: skill.id,
      version: 1,
      content,
      storagePath,
      changelog: "Initial version",
    });

    // Create file manifest records
    if (manifest.length > 0) {
      await skillRepository.createFiles(
        manifest.map((f) => ({
          skillId: skill.id,
          skillVersionId: version.id,
          path: f.path,
          storageKey: f.storageKey,
          size: f.size,
          contentType: f.contentType,
        }))
      );
    }

    return skill;
  },

  async update(
    id: string,
    data: Partial<{ name: string; description: string; content: string; tags: string[]; isPublic: boolean }>,
    userId: string
  ) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");

    const updateData: Record<string, unknown> = { ...data };
    if (data.name) updateData.slug = slugify(data.name);

    // If content changed, update the SKILL.md in object store
    if (data.content && skill.storagePath) {
      const storage = getStorage();
      await storage.putObject(
        `${skill.storagePath}SKILL.md`,
        Buffer.from(data.content),
        "text/markdown"
      );
    }

    return skillRepository.update(id, updateData);
  },

  async delete(id: string, userId: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");

    // Clean up files from object store
    if (skill.storagePath) {
      const storage = getStorage();
      const basePath = skill.storagePath.replace(/v\d+\/$/, "");
      await storage.deletePrefix(basePath);
    }

    return skillRepository.delete(id);
  },

  async getVersions(skillId: string) {
    return skillRepository.getVersions(skillId);
  },

  async publish(id: string, userId: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");

    const validation = validateSkill(skill.content);
    if (!validation.valid) throw new Error(`Skill validation failed: ${validation.errors.join(", ")}`);

    return skillRepository.update(id, { status: "PUBLISHED" });
  },

  async iterate(id: string, feedback: string, userId: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");

    const claude = getClaudeClient();
    const result = await iterateSkillEngine(skill.content, { skillId: id, feedback }, claude);

    const newVersion = skill.version + 1;
    const slug = skill.slug;
    const storagePath = buildStoragePath(skill.teamId, slug, newVersion);

    // Write new version to object store
    const manifest = await writeFilesToStorage(storagePath, [
      { path: "SKILL.md", content: result.content, contentType: "text/markdown" },
    ]);

    // Update skill and create version
    await skillRepository.update(id, { content: result.content, version: newVersion, storagePath });
    const version = await skillRepository.createVersion({
      skillId: id,
      version: newVersion,
      content: result.content,
      storagePath,
      changelog: result.changelog,
    });

    // Create file records for new version
    if (manifest.length > 0) {
      await skillRepository.createFiles(
        manifest.map((f) => ({
          skillId: id,
          skillVersionId: version.id,
          path: f.path,
          storageKey: f.storageKey,
          size: f.size,
          contentType: f.contentType,
        }))
      );
    }

    return { ...skill, content: result.content, version: newVersion, changelog: result.changelog };
  },

  async exportSkill(id: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");

    // Use archive-based export if skill has a storage path
    if (skill.storagePath) {
      const storage = getStorage();
      const { archive } = await packageSkill(storage, skill.storagePath);
      return { type: "archive" as const, archive };
    }

    // Fall back to legacy JSON export
    return { type: "json" as const, bundle: packageSkillJson(skill.content) };
  },

  async importSkillFromArchive(archive: Buffer, authorId: string, teamId?: string) {
    const storage = getStorage();
    const tempSlug = `import-${Date.now()}`;
    const targetPath = buildStoragePath(teamId, tempSlug, 1);

    const result = await importSkill(archive, storage, targetPath);

    // Re-build storage path with the real slug
    const realPath = buildStoragePath(teamId, result.skill.slug, result.skill.version);
    if (realPath !== targetPath) {
      // Move files from temp path to real path
      for (const file of result.files) {
        const data = typeof file.content === "string" ? Buffer.from(file.content) : file.content;
        await storage.putObject(`${realPath}${file.path}`, data, file.contentType);
      }
      await storage.deletePrefix(targetPath);
    }

    const skill = await skillRepository.create({
      ...result.skill,
      storagePath: realPath,
      authorId,
      teamId,
    });

    const version = await skillRepository.createVersion({
      skillId: skill.id,
      version: result.skill.version,
      content: result.skill.content,
      storagePath: realPath,
      changelog: "Imported skill",
    });

    // Create file records
    const fileRecords = result.files.map((f) => ({
      skillId: skill.id,
      skillVersionId: version.id,
      path: f.path,
      storageKey: `${realPath}${f.path}`,
      size: typeof f.content === "string" ? Buffer.byteLength(f.content) : f.content.length,
      contentType: f.contentType ?? "text/plain",
    }));
    if (fileRecords.length > 0) {
      await skillRepository.createFiles(fileRecords);
    }

    return skill;
  },

  async importSkillFromJson(bundle: string, authorId: string, teamId?: string) {
    const imported = importSkillJson(bundle);

    const storagePath = buildStoragePath(teamId, imported.skill.slug, imported.skill.version);
    const manifest = await writeFilesToStorage(storagePath, imported.files);

    const skill = await skillRepository.create({
      ...imported.skill,
      storagePath,
      authorId,
      teamId,
    });

    const version = await skillRepository.createVersion({
      skillId: skill.id,
      version: imported.skill.version,
      content: imported.skill.content,
      storagePath,
      changelog: "Imported skill",
    });

    if (manifest.length > 0) {
      await skillRepository.createFiles(
        manifest.map((f) => ({
          skillId: skill.id,
          skillVersionId: version.id,
          path: f.path,
          storageKey: f.storageKey,
          size: f.size,
          contentType: f.contentType,
        }))
      );
    }

    return skill;
  },

  // File management
  async uploadFiles(skillId: string, userId: string, files: Array<{ path: string; buffer: Buffer; mimetype: string }>) {
    const skill = await skillRepository.findById(skillId);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");
    if (!skill.storagePath) throw new Error("Skill has no storage path");

    const storage = getStorage();
    const fileRecords: Array<{
      skillId: string;
      path: string;
      storageKey: string;
      size: number;
      contentType: string;
    }> = [];

    for (const file of files) {
      const storageKey = `${skill.storagePath}${file.path}`;
      await storage.putObject(storageKey, file.buffer, file.mimetype);
      fileRecords.push({
        skillId,
        path: file.path,
        storageKey,
        size: file.buffer.length,
        contentType: file.mimetype,
      });
    }

    if (fileRecords.length > 0) {
      await skillRepository.createFiles(fileRecords);
    }

    return fileRecords;
  },

  async listFiles(skillId: string) {
    return skillRepository.getFiles(skillId);
  },

  async getFile(skillId: string, filePath: string) {
    const skill = await skillRepository.findById(skillId);
    if (!skill) throw new Error("Skill not found");
    if (!skill.storagePath) throw new Error("Skill has no storage path");

    const storage = getStorage();
    const storageKey = `${skill.storagePath}${filePath}`;
    const exists = await storage.objectExists(storageKey);
    if (!exists) throw new Error("File not found");

    return storage.getObject(storageKey);
  },

  async downloadSkill(id: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");

    if (skill.storagePath) {
      const storage = getStorage();
      const { archive } = await packageSkill(storage, skill.storagePath);
      return { archive, filename: `${skill.slug}-v${skill.version}.tar.gz` };
    }

    // Fallback: create archive from content only
    throw new Error("Skill has no storage path — use export endpoint for JSON format");
  },
};
