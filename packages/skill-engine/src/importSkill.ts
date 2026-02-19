import { SkillFrontmatterSchema, type SkillBundle } from "@accrue-ai/shared";
import { slugify } from "@accrue-ai/shared";
import type { ImportSkillResult } from "./types.js";

export function importSkill(bundleJson: string): ImportSkillResult {
  const raw = JSON.parse(bundleJson) as SkillBundle;

  // Validate metadata
  const metadata = SkillFrontmatterSchema.parse(raw.metadata);

  if (!raw.content || typeof raw.content !== "string") {
    throw new Error("Invalid skill bundle: missing content");
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
    assets: raw.assets ?? {},
  };
}
