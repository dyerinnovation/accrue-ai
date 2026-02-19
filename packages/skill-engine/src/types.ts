import type { ParsedSkill, SkillBundle, VersionComparison } from "@accrue-ai/shared";

export interface CreateSkillInput {
  name: string;
  description: string;
  tags?: string[];
  purpose?: string;
  instructions?: string;
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
  assets: Record<string, string>;
}

export type { ParsedSkill, SkillBundle, VersionComparison };
