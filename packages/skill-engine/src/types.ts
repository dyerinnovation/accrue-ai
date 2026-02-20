import type { ParsedSkill, SkillBundle, SkillFileEntry, SkillPackage, VersionComparison } from "@accrue-ai/shared";

export interface CreateSkillInput {
  name: string;
  description: string;
  tags?: string[];
  purpose?: string;
  instructions?: string;
  files?: SkillFileEntry[];
}

export interface CreatedSkillOutput {
  name: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  files: SkillFileEntry[];
}

export interface IterateSkillInput {
  skillId: string;
  feedback: string;
}

export interface CompareVersionsInput {
  skillId: string;
  versionA: number;
  versionB: number;
  evalPrompts: string[];
}

export interface ImportSkillResult {
  skill: {
    name: string;
    slug: string;
    description: string;
    content: string;
    version: number;
    tags: string[];
  };
  files: SkillFileEntry[];
}

export type { ParsedSkill, SkillBundle, SkillFileEntry, SkillPackage, VersionComparison };
