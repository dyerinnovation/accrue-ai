# Skill Engine

## Overview

`@accrue-ai/skill-engine` is the core library for all skill lifecycle operations. It provides seven functions covering the full create-validate-iterate-publish-export pipeline.

## Functions

### `createSkill(input: CreateSkillInput): { content: string }`

Generates a new SKILL.md from a template. Substitutes `{{placeholder}}` values in the `SKILL_TEMPLATE` constant from `@accrue-ai/shared`.

**Input:** `{ name, description, tags?, purpose?, whenToUse?, instructions?, examples?, references? }`

### `parseSkill(content: string): ParsedSkill`

Parses a SKILL.md string into structured data using [gray-matter](https://github.com/jonschlinkert/gray-matter) for YAML frontmatter extraction, then extracts markdown sections by heading.

**Returns:** `{ frontmatter: { name, description, tags, version }, content, sections: { purpose?, whenToUse?, instructions?, examples?, references? } }`

### `validateSkill(content: string): { valid: boolean, errors: string[], warnings: string[] }`

Validates SKILL.md content against the spec:
- **Errors** (must fix): empty content, invalid frontmatter, missing name/description, missing required sections (Purpose, Instructions)
- **Warnings** (should fix): missing recommended sections (When to Use, Examples)

### `iterateSkill(content: string, input: IterateSkillInput, claudeClient: ClaudeClient): Promise<{ content: string, changelog: string }>`

AI-powered skill improvement. Sends the current skill content and feedback to Claude with a system prompt requesting targeted improvements. Makes two API calls:
1. Generate improved skill content
2. Generate a changelog summarizing changes

**Input:** `{ feedback, context? }`

### `compareVersions(input: CompareVersionsInput): VersionComparison`

Compares two skill versions by running eval prompts against both and scoring results.

**Returns:** `{ versionA, versionB, results: [{ evalPrompt, scoreA, scoreB, notes }], winner: "A" | "B" | "tie", summary }`

### `packageSkill(content: string): SkillBundle`

Exports a skill as a portable JSON bundle containing metadata, content, assets, version, and export timestamp.

### `importSkill(bundle: SkillBundle): ImportSkillResult`

Imports a skill from a SkillBundle, validating the content and reconstructing the skill.

## Skill Lifecycle State Machine

```
DRAFT  ──>  TESTING  ──>  PUBLISHED  ──>  ARCHIVED
```

- Skills start as `DRAFT` after creation
- Move to `TESTING` when evals are configured
- Move to `PUBLISHED` after passing validation
- Can be `ARCHIVED` when retired

## Dependencies

| Package | Used For |
|---------|----------|
| `@accrue-ai/shared` | Types, `SkillFrontmatterSchema`, `SKILL_TEMPLATE`, constants |
| `@accrue-ai/db` | Prisma for skill/version persistence |
| `@accrue-ai/claude-client` | AI iteration via Claude API |
| `gray-matter` | YAML frontmatter parsing |
| `zod` | Input validation |
