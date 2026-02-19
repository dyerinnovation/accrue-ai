# Authentication

## Overview

Accrue AI uses a custom JWT implementation (HS256) for API authentication, with bcryptjs for password hashing and Better Auth for session management.

## Token Types

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access token | 15m (default, configurable via `JWT_EXPIRY`) | API request authentication |
| Refresh token | 7d (default, configurable via `REFRESH_TOKEN_EXPIRY`) | Obtaining new access tokens |

Both tokens carry: `userId`, `email`, `type` ("access" or "refresh"), `iat`, `exp`, `jti` (random 8-byte hex).

## JWT Implementation

Located in `packages/auth/src/jwt.ts`. This is a **custom HS256 implementation** using Node.js `crypto` module — not the `jsonwebtoken` library.

**Key functions:**
- `generateTokens(payload, config)` — creates access + refresh token pair
- `verifyAccessToken(token, secret)` — verifies and returns `{ userId, email }`
- `verifyRefreshToken(token, secret)` — verifies and returns `{ userId, email }`

**Expiry format:** number + unit — `15m`, `7d`, `3600s`, `24h`

## Password Hashing

Located in `packages/auth/src/password.ts`. Uses bcryptjs with default salt rounds.

- `hashPassword(password)` — returns bcrypt hash
- `verifyPassword(password, hash)` — returns boolean

## Auth Middleware

Located in `apps/api/src/middleware/auth.middleware.ts`:

1. Extracts `Bearer <token>` from `Authorization` header
2. Calls `verifyAccessToken(token, jwtSecret)`
3. Attaches `userId` and `userEmail` to `AuthenticatedRequest`
4. Returns 401 if token is missing, expired, or invalid

## Auth Flow

```
Register:  POST /api/auth/register  ->  hash password, create user, return tokens
Login:     POST /api/auth/login     ->  verify password, return tokens
Refresh:   POST /api/auth/refresh   ->  verify refresh token, return new token pair
Logout:    POST /api/auth/logout    ->  invalidate session
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | HMAC-SHA256 signing secret (min 16 characters) |
| `JWT_EXPIRY` | No | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | No | `7d` | Refresh token lifetime |
| `BETTER_AUTH_SECRET` | Yes | — | Better Auth session secret (min 16 characters) |
