import { type ParsedSkill } from "@accrue-ai/shared";
import { parseSkill } from "./parseSkill.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSkill(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: ParsedSkill;
  try {
    parsed = parseSkill(content);
  } catch (err) {
    return {
      valid: false,
      errors: [
        `Failed to parse skill: ${err instanceof Error ? err.message : "Unknown error"}`,
      ],
      warnings: [],
    };
  }

  // Required frontmatter checks
  if (!parsed.frontmatter.name) {
    errors.push("Skill must have a name in frontmatter");
  }

  if (!parsed.frontmatter.description) {
    errors.push("Skill must have a description in frontmatter");
  }

  // Required sections
  if (!parsed.sections.purpose) {
    errors.push("Skill must have a '## Purpose' section");
  }

  if (!parsed.sections.instructions) {
    errors.push("Skill must have an '## Instructions' section");
  }

  // Warnings for recommended sections
  if (!parsed.sections.whenToUse) {
    warnings.push("Consider adding a '## When to Use' section");
  }

  if (!parsed.sections.examples) {
    warnings.push("Consider adding an '## Examples' section");
  }

  // Content quality checks
  if (parsed.sections.instructions && parsed.sections.instructions.length < 50) {
    warnings.push("Instructions section seems too short — consider adding more detail");
  }

  if (parsed.frontmatter.tags.length === 0) {
    warnings.push("Consider adding tags for discoverability");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
