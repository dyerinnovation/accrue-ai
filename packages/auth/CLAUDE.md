# packages/auth

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

JWT token generation/verification and password hashing. Custom HS256 implementation using Node.js `crypto` module. See [docs/auth.md](../../docs/auth.md) for full authentication documentation.

## Key Files

- `src/jwt.ts` — `generateTokens`, `verifyAccessToken`, `verifyRefreshToken` (custom HS256)
- `src/password.ts` — `hashPassword`, `verifyPassword` (bcryptjs)
- `src/types.ts` — `AuthConfig` interface
- `src/index.ts` — Barrel export

## Conventions

- JWT is a **custom implementation** — NOT using the `jsonwebtoken` library
- Tokens carry: `userId`, `email`, `type` (access|refresh), `iat`, `exp`, `jti`
- Expiry format: number + unit (e.g., `"15m"`, `"7d"`, `"3600s"`)
- Access tokens: short-lived (15m default)
- Refresh tokens: long-lived (7d default)
- `jti` is a random 8-byte hex for token uniqueness

## Common Tasks

```bash
pnpm --filter @accrue-ai/auth build   # Compile to dist/
pnpm --filter @accrue-ai/auth test    # Run vitest
```

## Gotchas

- Custom JWT: if switching to a library like `jose`, update both sign and verify paths
- `AuthConfig` requires `jwtSecret`, `jwtExpiry`, and `refreshTokenExpiry` (all strings)
- The `parseExpiry` function only supports `s`, `m`, `h`, `d` units — no weeks or months
