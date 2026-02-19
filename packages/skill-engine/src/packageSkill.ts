import type { SkillBundle } from "@accrue-ai/shared";
import { parseSkill } from "./parseSkill.js";

export function packageSkill(
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
