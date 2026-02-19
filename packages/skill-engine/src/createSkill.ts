import { SKILL_TEMPLATE } from "@accrue-ai/shared";
import { slugify } from "@accrue-ai/shared";
import type { CreateSkillInput } from "./types.js";

export interface CreatedSkill {
  name: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
}

export function createSkill(input: CreateSkillInput): CreatedSkill {
  const slug = slugify(input.name);
  const tags = input.tags ?? [];

  const content = SKILL_TEMPLATE
    .replace("{{name}}", input.name)
    .replace("{{name}}", input.name)
    .replace("{{description}}", input.description)
    .replace("{{tags}}", tags.join(", "))
    .replace("{{purpose}}", input.purpose ?? "Describe the purpose of this skill.")
    .replace("{{whenToUse}}", "Describe when to trigger this skill.")
    .replace("{{instructions}}", input.instructions ?? "Add step-by-step instructions here.")
    .replace("{{examples}}", "Add input/output examples here.")
    .replace("{{references}}", "Add reference links here.");

  return {
    name: input.name,
    slug,
    description: input.description,
    content,
    tags,
  };
}
