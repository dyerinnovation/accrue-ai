# apps/web

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Next.js 15 App Router frontend with React 19, Tailwind CSS 4, and React Query. Port 3000. See [docs/web-frontend.md](../../docs/web-frontend.md) for full documentation.

## Key Files

- `src/app/layout.tsx` — Root layout (HTML, body, Providers wrapper)
- `src/app/providers.tsx` — React Query `QueryClientProvider`
- `src/app/page.tsx` — Landing page
- `src/lib/api.ts` — Fetch wrapper (auto Bearer auth from `localStorage`, `uploadFiles()`, `download()`)
- `src/app/(auth)/` — Login + Register pages (public)
- `src/app/(app)/` — Dashboard, Skills pages (authenticated)
- `src/app/globals.css` — Tailwind base styles

## Conventions

- **App Router** with route groups: `(auth)` for public, `(app)` for authenticated
- Data fetching: React Query + `src/lib/api.ts`
- Tokens stored in `localStorage` (key: `accessToken`)
- **Only `@accrue-ai/shared`** is an allowed internal dependency
- Tailwind CSS 4 via `@tailwindcss/postcss` (NOT `@tailwindcss/vite`)

## Adding a New Page

1. Create `src/app/(app)/<route>/page.tsx` (or `(auth)/` for public)
2. Use `api.get`/`api.post`/`api.put`/`api.delete` from `src/lib/api.ts`
3. Wrap data fetching in React Query hooks (`useQuery`, `useMutation`)

## Common Tasks

```bash
pnpm --filter @accrue-ai/web dev     # Dev server on :3000
pnpm --filter @accrue-ai/web build   # next build
pnpm --filter @accrue-ai/web lint    # next lint
```

## Gotchas

- Do NOT import from `@accrue-ai/db`, `auth`, `claude-client`, or `skill-engine` — they contain Node.js-only code
- `localStorage` is client-only — guarded with `typeof window !== "undefined"` (see `api.ts`)
- `NEXT_PUBLIC_API_URL` must be set at build time for Next.js to embed it
- Skill detail page has file browser, upload, and download functionality
- File uploads use `api.uploadFiles()` (multipart/form-data via FormData)
- Skill downloads use `api.download()` (returns Blob, creates object URL for download)
