# Contributing

## Development Setup

See [Getting Started](./getting-started.md) for installation instructions.

## Code Conventions

### TypeScript

- **Strict mode** enabled (`noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`)
- **ES2022 target**, Node16 module resolution
- Import with `.js` extensions (required by Node16 module resolution)
- All packages compile to `dist/` via `tsc`

### Validation

- **Zod** for all runtime validation (environment variables, request bodies, skill frontmatter)
- Types inferred from Zod schemas where possible (`z.infer<typeof Schema>`)

### API Layer

- Routes -> Controllers -> Services -> Repositories -> Prisma
- Controllers, services, and repositories are **object literals** (not classes)
- All responses use the `{ success, data?, error?, pagination? }` envelope
- Zod schemas in `apps/api/src/validators/`

### Testing

- **Vitest** for all packages and apps
- Tests live in `__tests__/` directories co-located with source
- Run all: `pnpm test`, specific package: `pnpm --filter @accrue-ai/<name> test`

## Adding a New API Endpoint

1. Define Zod schema in `apps/api/src/validators/<domain>.schema.ts`
2. Create repository in `apps/api/src/repositories/` (if new entity)
3. Create service in `apps/api/src/services/`
4. Create controller in `apps/api/src/controllers/`
5. Create route in `apps/api/src/routes/`
6. Mount route in `apps/api/src/routes/index.ts`

## Adding a New Package

1. Create `packages/<name>/` with `package.json`:
   ```json
   {
     "name": "@accrue-ai/<name>",
     "version": "0.1.0",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": { "build": "tsc", "test": "vitest" }
   }
   ```
2. Add `tsconfig.json` extending `../../tsconfig.base.json`
3. Create `src/index.ts` as the barrel export
4. The package is auto-detected by `pnpm-workspace.yaml` (`"packages/*"` glob)

## Adding a New Skill

1. Create `skills/<kebab-case-name>/` directory
2. Write `SKILL.md` following the [skill format spec](./skill-format.md)
3. Write `README.md` with overview and usage examples
4. Frontmatter must include: `name` (required), `description` (required), `tags` (optional), `version` (optional)

## Adding a New MCP Tool

1. In `apps/mcp-server/src/index.ts`, add:
   ```typescript
   server.tool("tool_name", "Description", { /* Zod schema */ }, async (params) => {
     return { content: [{ type: "text", text: "result" }] };
   });
   ```
2. For errors, return `{ content: [...], isError: true }`
