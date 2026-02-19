# packages/

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Five shared internal packages consumed by the apps. All compile through `dist/` via `tsc`.

## Package Dependency Order (build order)

1. **@accrue-ai/shared** — no internal deps (leaf node)
2. **@accrue-ai/db** — depends on shared
3. **@accrue-ai/auth** — depends on db, shared
4. **@accrue-ai/claude-client** — depends on shared
5. **@accrue-ai/skill-engine** — depends on db, shared, claude-client

## Conventions

- Each package: `src/index.ts` barrel export, `src/__tests__/` for tests
- `main: ./dist/index.js`, `types: ./dist/index.d.ts`
- TypeScript config extends `../../tsconfig.base.json`
- All use vitest for testing
- Import with `.js` extensions (Node16 module resolution)
- All packages at version `0.1.0`, referenced as `workspace:*`

## Adding a New Package

1. `mkdir packages/<name>`
2. Add `package.json` with `name: "@accrue-ai/<name>"`, scripts for `build` and `test`
3. Add `tsconfig.json` extending `../../tsconfig.base.json`
4. Create `src/index.ts` as barrel export
5. Auto-detected by `pnpm-workspace.yaml` (`"packages/*"` glob)

## Common Tasks

```bash
pnpm --filter @accrue-ai/<name> build   # Build specific package
pnpm --filter @accrue-ai/<name> test    # Test specific package
pnpm build                              # Build all (Turborepo handles order)
```
