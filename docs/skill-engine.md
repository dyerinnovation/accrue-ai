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

### `packageSkill(storage: StorageProvider, storagePath: string): Promise<Buffer>`

Exports a skill as a tar.gz archive from the object store. Lists all files under `storagePath`, reads each one, and packs them into a gzipped tar archive. The archive structure matches the [Agent Skills](https://agentskills.io) standard used by Claude Code.

**Returns:** `Buffer` containing the tar.gz archive.

### `packageSkillJson(content: string): SkillPackage`

Legacy JSON export. Parses SKILL.md content and returns a `SkillPackage` object with metadata, files map, version, and export timestamp.

### `importSkill(archive: Buffer, storage: StorageProvider, targetPath: string): Promise<ImportSkillResult>`

Imports a skill from a tar.gz archive. Extracts the archive, writes each file to the object store under `targetPath`, and returns the parsed metadata and file manifest.

**Returns:** `{ metadata, content, files: SkillFileEntry[], version, changelog? }`

### `importSkillJson(bundle: SkillPackage): ImportSkillResult`

Legacy JSON import. Reconstructs a skill from a `SkillPackage` object.

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
| `@accrue-ai/storage` | Object store access for package/import operations |
| `gray-matter` | YAML frontmatter parsing |
| `tar-stream` | tar.gz archive creation and extraction |
| `zod` | Input validation |
