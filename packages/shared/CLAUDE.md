# packages/shared

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Leaf package with zero internal dependencies. Exports types, Zod schemas, constants, utilities, and env validation used across the entire monorepo.

## Key Files

- `src/types.ts` — Zod schemas + TypeScript types (`SkillFrontmatter`, `ApiResponse`, `PaginatedResponse`, `WizardState`, `SkillBundle`, `VersionComparison`, `AuthTokens`, `TokenPayload`)
- `src/constants.ts` — `SKILL_STATUS`, `TEAM_ROLES`, `WIZARD_STEPS`, `SKILL_TEMPLATE`, `API_ROUTES`, pagination limits, `API_KEY_PREFIX`
- `src/utils.ts` — `slugify`, `generateApiKey`, `truncate`, `isValidSlug`, `parseSkillSections`, `formatDate`
- `src/env.ts` — `ServerEnvSchema` (Zod), `validateEnv()`
- `src/index.ts` — Barrel re-export of all modules

## Conventions

- All types that cross package boundaries must live here
- Zod schemas for runtime validation, inferred TypeScript types for compile-time
- `SKILL_TEMPLATE` uses `{{placeholder}}` substitution (double curly braces, NOT template literals)
- `API_ROUTES` defines all route paths as a single source of truth

## Common Tasks

```bash
pnpm --filter @accrue-ai/shared build   # Compile to dist/
pnpm --filter @accrue-ai/shared test    # Run vitest
```

## Gotchas

- This is the root of the dependency graph. Changes here affect EVERYTHING. Build and test broadly after modifications.
- `env.ts` `ServerEnvSchema` is for shared reference; `apps/api` has its own `getEnv()` in `src/config/env.ts`
- `slugify` strips non-word characters — test edge cases when modifying
- `DEFAULT_PAGE_SIZE` is 20, `MAX_PAGE_SIZE` is 100, `MAX_SKILL_CONTENT_LENGTH` is 100,000
