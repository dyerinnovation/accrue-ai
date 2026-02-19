# packages/skill-engine

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Core skill lifecycle library: parse, create, validate, iterate, compare, package, import. See [docs/skill-engine.md](../../docs/skill-engine.md) for full documentation.

## Key Files

- `src/parseSkill.ts` — Parse SKILL.md -> `ParsedSkill` (gray-matter + section extraction)
- `src/createSkill.ts` — Generate SKILL.md from `CreateSkillInput` (template substitution)
- `src/validateSkill.ts` — Validate content -> `{ valid, errors[], warnings[] }`
- `src/iterateSkill.ts` — AI-powered iteration (ClaudeClient + system prompt)
- `src/compareVersions.ts` — Compare two versions via eval prompts
- `src/packageSkill.ts` — Export skill as tar.gz archive from object store (+ legacy JSON)
- `src/importSkill.ts` — Import from tar.gz archive to object store (+ legacy JSON)
- `src/types.ts` — Input/output types for all operations
- `src/index.ts` — Barrel export of all 7 functions + types

## Conventions

- Functions are pure where possible (except `iterateSkill` which calls Claude API, and `packageSkill`/`importSkill` which use StorageProvider)
- gray-matter for YAML frontmatter parsing
- Validation: errors = must fix, warnings = should fix
- Required sections: Purpose, Instructions
- Recommended sections: When to Use, Examples

## Adding a New Skill Operation

1. Create `src/<operationName>.ts`
2. Define input/output types in `src/types.ts`
3. Export from `src/index.ts`

## Common Tasks

```bash
pnpm --filter @accrue-ai/skill-engine build   # Compile to dist/
pnpm --filter @accrue-ai/skill-engine test    # Run vitest
```

## Gotchas

- `iterateSkill` makes TWO Claude API calls (one for iteration, one for changelog)
- `parseSkill` section extraction is case-insensitive for heading matching
- `SKILL_TEMPLATE` uses `{{placeholder}}` — double curly braces, NOT template literals
- `createSkill` does string replacement on the template, not programmatic markdown generation
- `createSkill` returns `CreatedSkillOutput` with `files: SkillFileEntry[]` (SKILL.md + any supporting files)
- `packageSkill` and `importSkill` have both archive-based (StorageProvider) and legacy JSON variants
- `tar-stream` is used for archive creation/extraction — NOT the `tar` npm package
