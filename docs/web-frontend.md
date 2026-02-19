# Web Frontend

## Overview

The web frontend is a Next.js 15 application using React 19, Tailwind CSS 4, and React Query for server state management. It runs on port 3000.

## Route Structure

```
src/app/
├── layout.tsx              Root layout (HTML, body, Providers wrapper)
├── page.tsx                Landing page (/)
├── providers.tsx           React Query provider
├── globals.css             Global styles + Tailwind base
├── (auth)/                 Public route group
│   ├── login/page.tsx      Login page (/login)
│   └── register/page.tsx   Register page (/register)
└── (app)/                  Authenticated route group
    ├── dashboard/page.tsx  Dashboard (/dashboard)
    └── skills/
        ├── [id]/page.tsx        Skill detail (/skills/:id)
        └── [id]/edit/page.tsx   Skill editor (/skills/:id/edit)
```

### Route Groups

- **`(auth)`** — Public pages (login, register). No auth required.
- **`(app)`** — Protected pages. Require a valid access token in localStorage.

## Data Fetching

All API communication goes through `src/lib/api.ts`:

```typescript
const api = {
  get:    (path) => request("GET", path),
  post:   (path, body?) => request("POST", path, body),
  put:    (path, body?) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};
```

The `request()` function:
1. Reads `accessToken` from `localStorage` (guarded by `typeof window !== "undefined"`)
2. Attaches `Authorization: Bearer <token>` header
3. Sends request to `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001/api`)
4. Parses JSON response and throws on non-ok status

**React Query** (`@tanstack/react-query`) wraps all data fetching for caching, refetching, and loading/error states. The `QueryClientProvider` is set up in `src/app/providers.tsx`.

## Styling

- **Tailwind CSS 4** via `@tailwindcss/postcss` plugin
- Base styles in `src/app/globals.css`
- Utility-first approach throughout components

## Dependencies

The web app intentionally has minimal internal dependencies:

| Package | Purpose |
|---------|---------|
| `@accrue-ai/shared` | Types, constants, Zod schemas |

**No server-side packages** — `@accrue-ai/db`, `@accrue-ai/auth`, `@accrue-ai/claude-client`, and `@accrue-ai/skill-engine` must NOT be imported from the frontend. They contain Node.js-only code (Prisma, crypto, Anthropic SDK).

## Commands

```bash
pnpm --filter @accrue-ai/web dev     # Dev server on :3000
pnpm --filter @accrue-ai/web build   # next build (standalone output)
pnpm --filter @accrue-ai/web lint    # next lint
```
