import { createSkill, validateSkill, iterateSkill as iterateSkillEngine, packageSkill, importSkill as importSkillFn } from "@accrue-ai/skill-engine";
import { ClaudeClient } from "@accrue-ai/claude-client";
import { slugify } from "@accrue-ai/shared";
import { skillRepository } from "../repositories/skill.repository.js";
import type { SkillQueryParams } from "../repositories/skill.repository.js";
import { getEnv } from "../config/env.js";

function getClaudeClient(): ClaudeClient {
  const env = getEnv();
  return new ClaudeClient({ apiKey: env.ANTHROPIC_API_KEY, model: env.CLAUDE_MODEL });
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

  async create(input: { name: string; description: string; content?: string; tags?: string[]; teamId?: string; isPublic?: boolean }, authorId: string) {
    const slug = slugify(input.name);

    let content = input.content;
    if (!content) {
      const created = createSkill({ name: input.name, description: input.description, tags: input.tags });
      content = created.content;
    }

    const skill = await skillRepository.create({
      name: input.name,
      slug,
      description: input.description,
      content,
      authorId,
      teamId: input.teamId,
      tags: input.tags,
      isPublic: input.isPublic,
    });

    await skillRepository.createVersion({ skillId: skill.id, version: 1, content, changelog: "Initial version" });
    return skill;
  },

  async update(id: string, data: Partial<{ name: string; description: string; content: string; tags: string[]; isPublic: boolean }>, userId: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");

    const updateData: Record<string, unknown> = { ...data };
    if (data.name) updateData.slug = slugify(data.name);

    return skillRepository.update(id, updateData);
  },

  async delete(id: string, userId: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== userId) throw new Error("Not authorized");
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
    await skillRepository.update(id, { content: result.content, version: newVersion });
    await skillRepository.createVersion({ skillId: id, version: newVersion, content: result.content, changelog: result.changelog });

    return { ...skill, content: result.content, version: newVersion, changelog: result.changelog };
  },

  async exportSkill(id: string) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw new Error("Skill not found");
    return packageSkill(skill.content);
  },

  async importSkill(bundle: string, authorId: string, teamId?: string) {
    const imported = importSkillFn(bundle);
    return skillRepository.create({
      ...imported.skill,
      authorId,
      teamId,
    });
  },
};
