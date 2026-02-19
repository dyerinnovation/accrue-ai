# skills/

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Directory containing bundled skill definitions. Each skill is a subdirectory with `SKILL.md` (the skill definition) and `README.md` (human documentation). See [docs/skill-format.md](../docs/skill-format.md) for the full format specification.

## Structure

```
skills/<skill-name>/
  SKILL.md    Skill definition (YAML frontmatter + markdown sections)
  README.md   Human-readable documentation about the skill
```

## Current Skills

| Skill | Description |
|-------|-------------|
| `skill-creator/` | Foundational meta-skill. Guides AI agents through creating new skills via a 7-step process: capture intent, interview, draft, test, evaluate, iterate, publish. |

## Adding a New Skill

1. Create `skills/<kebab-case-name>/` directory
2. Write `SKILL.md` following the format spec:
   - Required frontmatter: `name` (string), `description` (string)
   - Optional frontmatter: `tags` (string[]), `version` (int, default 1)
   - Required sections: `## Purpose`, `## Instructions`
   - Recommended sections: `## When to Use`, `## Examples`, `## References`
3. Write `README.md` with overview, usage examples, and version history
4. Skills can be loaded via MCP (`get_skill`), API (`GET /api/skills`), or direct file read

## SKILL.md Quick Reference

```markdown
---
name: My Skill
description: >
  What this skill does
tags: [tag1, tag2]
version: 1
---

## Purpose
Why this skill exists.

## Instructions
Step-by-step guidance.
```
