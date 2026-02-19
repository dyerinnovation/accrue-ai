# Database

## Overview

Accrue AI uses PostgreSQL 16 with Prisma 6.2 as the ORM. The schema and client are defined in the `@accrue-ai/db` package.

## Schema

The Prisma schema is at `packages/db/prisma/schema.prisma`.

### Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | Registered users | `email` (unique), `passwordHash`, `name?` |
| **Team** | Organizations | `name`, `slug` (unique) |
| **TeamMember** | User-Team join table | `role` (OWNER/ADMIN/MEMBER/VIEWER), unique on `[userId, teamId]` |
| **Skill** | AI skill definitions | `name`, `slug`, `content` (SKILL.md text), `status`, `version`, `tags[]`, `isPublic` |
| **SkillVersion** | Version history | `version` (int), `content`, `changelog?`, `metrics?` (JSON) |
| **SkillEval** | Evaluation definitions | `prompt`, `expected?`, `assertions` (JSON), `files?` (JSON) |
| **ApiKey** | API access keys | `key` (unique, prefixed `ak_`), `name`, `expiresAt?` |
| **WizardSession** | Skill creation wizard state | `step`, `state` (JSON), `messages` (JSON), `draftSkill?` (JSON) |

### Enums

- **TeamRole:** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`
- **SkillStatus:** `DRAFT`, `TESTING`, `PUBLISHED`, `ARCHIVED`

### Entity Relationships

```
User ──< TeamMember >── Team
User ──< Skill >── Team (optional)
User ──< ApiKey
Skill ──< SkillVersion
Skill ──< SkillEval
```

- A Skill's `[slug, teamId]` pair is unique (allows same slug across teams)
- `teamId` is nullable — null means a personal skill
- `content` and SkillVersion `content` use `@db.Text` (not varchar)

### IDs

All models use `cuid()` for primary keys.

## Prisma Client Singleton

`packages/db/src/index.ts` exports a global singleton to prevent connection pool exhaustion during development (hot reloads):

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Commands

```bash
pnpm db:generate                          # Generate Prisma client after schema changes
pnpm db:migrate                           # Create and apply migration (dev)
pnpm --filter @accrue-ai/db migrate:deploy  # Apply migrations (production)
pnpm db:seed                              # Seed database
pnpm --filter @accrue-ai/db studio        # Open Prisma Studio UI
```

## Migrations

Migration files live in `packages/db/prisma/migrations/`. Always run `pnpm db:generate` before `pnpm db:migrate` after schema changes.
