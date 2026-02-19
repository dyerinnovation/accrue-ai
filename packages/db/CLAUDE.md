# packages/db

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Prisma 6.2 ORM layer. Exports PrismaClient singleton and all generated model types. See [docs/database.md](../../docs/database.md) for full schema documentation.

## Key Files

- `prisma/schema.prisma` — Data model (User, Team, TeamMember, Skill, SkillVersion, SkillFile, SkillEval, ApiKey, WizardSession)
- `prisma/seed.ts` — Database seeder
- `prisma/migrations/` — Migration history
- `src/index.ts` — PrismaClient singleton (global caching in dev) + type re-exports

## Schema Quick Reference

- **User** — `email` (unique), `passwordHash`, has many Skills, ApiKeys, TeamMembers
- **Team** — `slug` (unique), has many Skills, TeamMembers
- **Skill** — `[slug, teamId]` unique, `content` (@db.Text cached), `storagePath?`, `status` enum, `tags[]`
- **SkillVersion** — `version` (int), `content` (@db.Text cached), `storagePath?`, `changelog?`
- **SkillFile** — `[skillId, skillVersionId, path]` unique, `storageKey`, `size`, `contentType`
- **SkillEval** — `prompt`, `assertions` (JSON)
- **Enums** — `TeamRole` (OWNER/ADMIN/MEMBER/VIEWER), `SkillStatus` (DRAFT/TESTING/PUBLISHED/ARCHIVED)
- **IDs** — `cuid()` everywhere

## Common Tasks

```bash
pnpm db:generate     # Generate Prisma client after schema changes (MUST run first)
pnpm db:migrate      # Create + apply migration (dev)
pnpm db:seed         # Seed database
pnpm --filter @accrue-ai/db studio   # Open Prisma Studio UI
```

## Conventions

- After ANY `schema.prisma` change: run `pnpm db:generate`, then `pnpm db:migrate`
- Global PrismaClient singleton pattern prevents connection pool exhaustion in dev hot reloads
- All model types re-exported from `src/index.ts` for consumer convenience

## Gotchas

- `content` fields use `@db.Text` — cached copy of SKILL.md for quick reads/search (actual files in object store)
- `storagePath` points to object store directory (e.g., `skills/{team}/{slug}/v{version}/`)
- `[slug, teamId]` unique constraint: null `teamId` means personal skill
- `[skillId, skillVersionId, path]` unique constraint on SkillFile
- `WizardSession.state` and `.messages` are `Json` type — serialized/deserialized manually
- Always run `pnpm db:generate` before `pnpm db:migrate` — Prisma needs the client generated to create migrations
