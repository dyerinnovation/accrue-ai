# SKILL.md Format Specification

## Overview

Skills are defined as markdown files (SKILL.md) with YAML frontmatter. This format is the core data structure of Accrue AI — every skill in the system is stored and transmitted in this format.

## Structure

```markdown
---
name: My Skill Name
description: >
  A concise description of what this skill does
tags: [tag1, tag2, tag3]
version: 1
---

# My Skill Name

## Purpose
What this skill enables and why it exists.

## When to Use
Conditions and contexts where this skill applies.

## Instructions
Step-by-step guidance for the AI agent executing this skill.

## Examples
Concrete examples of input/output pairs.

## References
Links to related resources, documentation, or other skills.
```

## Frontmatter Schema

Validated by `SkillFrontmatterSchema` in `packages/shared/src/types.ts`:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | `string` | Yes | — | Skill name (min 1 character) |
| `description` | `string` | Yes | — | Skill description (min 1 character) |
| `tags` | `string[]` | No | `[]` | Categorization tags |
| `version` | `int` | No | `1` | Positive integer version number |

Frontmatter is parsed using [gray-matter](https://github.com/jonschlinkert/gray-matter) in `packages/skill-engine/src/parseSkill.ts`.

## Sections

### Required

- **## Purpose** — What the skill enables. Must be present for validation to pass.
- **## Instructions** — Step-by-step guidance. Must be present for validation to pass.

### Recommended

- **## When to Use** — Triggers and contexts for applying the skill
- **## Examples** — Concrete input/output demonstrations
- **## References** — Links to related material

Missing recommended sections produce warnings (not errors) during validation.

## Template

The default skill template is defined in `packages/shared/src/constants.ts` as `SKILL_TEMPLATE`. It uses `{{placeholder}}` double-curly-brace substitution (not JavaScript template literals):

```
{{name}}, {{description}}, {{tags}}, {{purpose}}, {{whenToUse}}, {{instructions}}, {{examples}}, {{references}}
```

## Validation Rules

Enforced by `validateSkill()` in `packages/skill-engine/src/validateSkill.ts`:

1. Content must not be empty
2. Frontmatter must parse successfully via gray-matter
3. `name` and `description` must be present and non-empty
4. `## Purpose` section must exist
5. `## Instructions` section must exist
6. Missing recommended sections generate warnings

## Example: skill-creator

The bundled `skills/skill-creator/SKILL.md` is the reference implementation — a meta-skill that guides AI agents through creating new skills using a 7-step workflow.
