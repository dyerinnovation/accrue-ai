import matter from "gray-matter";
import { SkillFrontmatterSchema, type ParsedSkill } from "@accrue-ai/shared";

export function parseSkill(rawContent: string): ParsedSkill {
  const { data, content } = matter(rawContent);

  const frontmatter = SkillFrontmatterSchema.parse(data);

  const sections = extractSections(content);

  return {
    frontmatter,
    content,
    sections,
  };
}

function extractSections(content: string): ParsedSkill["sections"] {
  const sectionMap: Record<string, keyof ParsedSkill["sections"]> = {
    purpose: "purpose",
    "when to use": "whenToUse",
    instructions: "instructions",
    examples: "examples",
    references: "references",
  };

  const result: ParsedSkill["sections"] = {};

  const sectionRegex = /^## (.+)$/gm;
  let match: RegExpExecArray | null;
  const matches: { title: string; index: number; length: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    matches.push({
      title: match[1] ?? "",
      index: match.index,
      length: match[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]!;
    const next = matches[i + 1];
    const sectionContent = next
      ? content.slice(current.index + current.length, next.index)
      : content.slice(current.index + current.length);

    const key = sectionMap[current.title.toLowerCase()];
    if (key) {
      result[key] = sectionContent.trim();
    }
  }

  return result;
}
