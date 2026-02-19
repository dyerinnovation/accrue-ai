import { describe, it, expect, vi } from "vitest";
import { packageSkill, packageSkillJson } from "../packageSkill.js";
import { importSkill, importSkillJson } from "../importSkill.js";
import type { StorageProvider } from "@accrue-ai/storage";

const SAMPLE_SKILL = `---
name: packaged-skill
description: A skill to package
tags: [test]
version: 2
---

# Packaged Skill

## Purpose
Testing packaging.

## Instructions
Package this skill.
`;

describe("packageSkillJson (legacy)", () => {
  it("creates a valid JSON bundle", () => {
    const bundle = packageSkillJson(SAMPLE_SKILL);
    const parsed = JSON.parse(bundle);

    expect(parsed.metadata.name).toBe("packaged-skill");
    expect(parsed.metadata.version).toBe(2);
    expect(parsed.content).toBe(SAMPLE_SKILL);
    expect(parsed.exportedAt).toBeTruthy();
  });

  it("includes assets when provided", () => {
    const bundle = packageSkillJson(SAMPLE_SKILL, { "ref.md": "# Reference" });
    const parsed = JSON.parse(bundle);

    expect(parsed.assets["ref.md"]).toBe("# Reference");
  });
});

describe("importSkillJson (legacy)", () => {
  it("imports a valid bundle", () => {
    const bundle = packageSkillJson(SAMPLE_SKILL);
    const result = importSkillJson(bundle);

    expect(result.skill.name).toBe("packaged-skill");
    expect(result.skill.slug).toBe("packaged-skill");
    expect(result.skill.version).toBe(2);
    expect(result.skill.content).toBe(SAMPLE_SKILL);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.path).toBe("SKILL.md");
  });

  it("converts legacy assets to file entries", () => {
    const bundle = packageSkillJson(SAMPLE_SKILL, { "scripts/run.py": "print('hello')" });
    const result = importSkillJson(bundle);

    expect(result.files).toHaveLength(2);
    expect(result.files[1]!.path).toBe("scripts/run.py");
    expect(result.files[1]!.content).toBe("print('hello')");
  });

  it("throws on invalid bundle", () => {
    expect(() => importSkillJson("not json")).toThrow();
  });
});

describe("packageSkill (archive)", () => {
  function createMockStorage(files: Record<string, Buffer>): StorageProvider {
    return {
      listObjects: vi.fn(async (prefix: string) =>
        Object.keys(files).map((k) => `${prefix}${k}`)
      ),
      getObject: vi.fn(async (key: string) => {
        const relativePath = key.replace(/^.*?\/v1\//, "");
        const data = files[relativePath];
        if (!data) throw new Error(`Not found: ${key}`);
        return data;
      }),
      putObject: vi.fn(async () => {}),
      getObjectStream: vi.fn(),
      deleteObject: vi.fn(),
      deletePrefix: vi.fn(),
      getSignedUrl: vi.fn(),
      objectExists: vi.fn(),
    };
  }

  it("creates a tar.gz archive from storage", async () => {
    const storage = createMockStorage({
      "SKILL.md": Buffer.from(SAMPLE_SKILL),
      "scripts/run.py": Buffer.from("print('hello')"),
    });

    const { archive, metadata } = await packageSkill(storage, "skills/test/v1/");

    expect(archive).toBeInstanceOf(Buffer);
    expect(archive.length).toBeGreaterThan(0);
    expect(metadata.metadata.name).toBe("packaged-skill");
    expect(metadata.version).toBe(2);
    expect(metadata.exportedAt).toBeTruthy();
  });

  it("throws when no files found", async () => {
    const storage = createMockStorage({});
    // Override listObjects to return empty
    (storage.listObjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await expect(packageSkill(storage, "skills/empty/v1/")).rejects.toThrow(
      "No files found"
    );
  });

  it("throws when SKILL.md is missing", async () => {
    const storage = createMockStorage({
      "scripts/run.py": Buffer.from("print('hello')"),
    });

    await expect(packageSkill(storage, "skills/test/v1/")).rejects.toThrow(
      "SKILL.md not found"
    );
  });
});

describe("importSkill (archive) + packageSkill roundtrip", () => {
  it("can roundtrip through archive", async () => {
    const files = {
      "SKILL.md": Buffer.from(SAMPLE_SKILL),
      "scripts/run.py": Buffer.from("print('hello')"),
    };

    const mockStorage: StorageProvider = {
      listObjects: vi.fn(async (prefix: string) =>
        Object.keys(files).map((k) => `${prefix}${k}`)
      ),
      getObject: vi.fn(async (key: string) => {
        const relativePath = key.replace(/^.*?\/v1\//, "");
        const data = files[relativePath as keyof typeof files];
        if (!data) throw new Error(`Not found: ${key}`);
        return data;
      }),
      putObject: vi.fn(async () => {}),
      getObjectStream: vi.fn(),
      deleteObject: vi.fn(),
      deletePrefix: vi.fn(),
      getSignedUrl: vi.fn(),
      objectExists: vi.fn(),
    };

    // Package into archive
    const { archive } = await packageSkill(mockStorage, "skills/test/v1/");

    // Import from archive into a new storage location
    const importStorage: StorageProvider = {
      ...mockStorage,
      putObject: vi.fn(async () => {}),
    };

    const result = await importSkill(archive, importStorage, "skills/imported/v1/");

    expect(result.skill.name).toBe("packaged-skill");
    expect(result.skill.version).toBe(2);
    expect(result.files).toHaveLength(2);

    const skillMd = result.files.find((f) => f.path === "SKILL.md");
    expect(skillMd).toBeTruthy();
    expect(skillMd!.content).toContain("packaged-skill");

    const script = result.files.find((f) => f.path === "scripts/run.py");
    expect(script).toBeTruthy();
    expect(script!.content).toBe("print('hello')");

    // Verify storage writes happened
    expect(importStorage.putObject).toHaveBeenCalledTimes(2);
  });
});
