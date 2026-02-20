# API Reference

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Obtain tokens via `POST /api/auth/login` or `POST /api/auth/register`.

## Response Format

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

- `success` — always present
- `data` — present on success
- `error` — present on failure
- `pagination` — present on list endpoints

## Endpoints

All routes are defined in `packages/shared/src/constants.ts` (`API_ROUTES`) and mounted in `apps/api/src/routes/`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account (`email`, `password`, `name`) |
| POST | `/api/auth/login` | No | Login (`email`, `password`) -> tokens |
| POST | `/api/auth/refresh` | No | Refresh tokens (`refreshToken`) -> new token pair |
| POST | `/api/auth/logout` | Yes | Logout (invalidate session) |

### Skills

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/skills` | Yes | List skills (supports `?query=`, `?tags=`, `?page=`, `?pageSize=`) |
| POST | `/api/skills` | Yes | Create skill (`name`, `description`, `content`) |
| GET | `/api/skills/:id` | Yes | Get skill by ID |
| PUT | `/api/skills/:id` | Yes | Update skill |
| DELETE | `/api/skills/:id` | Yes | Delete skill |
| GET | `/api/skills/:id/versions` | Yes | List skill versions |
| POST | `/api/skills/:id/publish` | Yes | Publish a skill (validates first) |
| POST | `/api/skills/:id/iterate` | Yes | AI-powered iteration (`feedback`) |
| GET | `/api/skills/:id/export` | Yes | Export as SkillBundle JSON |
| POST | `/api/skills/import` | Yes | Import from SkillBundle JSON or tar.gz archive |
| POST | `/api/skills/:id/files` | Yes | Upload file(s) to a skill (multipart/form-data) |
| GET | `/api/skills/:id/files` | Yes | List files in a skill |
| GET | `/api/skills/:id/files/*` | Yes | Download a single file by path |
| GET | `/api/skills/:id/download` | Yes | Download entire skill as tar.gz archive |

### Wizard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/wizard/start` | Yes | Start a new wizard session |
| POST | `/api/wizard/:sessionId/message` | Yes | Send message to wizard (`content`) |
| GET | `/api/wizard/:sessionId` | Yes | Get wizard session state |

### Teams

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/teams` | Yes | List user's teams |
| POST | `/api/teams` | Yes | Create team (`name`) |
| GET | `/api/teams/:id/skills` | Yes | List team skills |
| GET | `/api/teams/:id/members` | Yes | List team members |

### Evals

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/evals` | Yes | Create eval (`skillId`, `prompt`, `expected`, `assertions`) |
| POST | `/api/evals/:id/run` | Yes | Run an eval |
| GET | `/api/evals/:id/results` | Yes | Get eval results |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check -> `{ status: "ok", timestamp: "..." }` |

### File Management

#### Upload Files

```
POST /api/skills/:id/files
Content-Type: multipart/form-data
```

Upload one or more files to a skill. Files are stored in the object store under the skill's storage path and recorded in the SkillFile table. Maximum 20 files, 10MB each.

#### List Files

```
GET /api/skills/:id/files
```

Returns the file manifest for a skill: path, size, content type for each file.

#### Download Single File

```
GET /api/skills/:id/files/scripts/run.py
```

Downloads a single file from the skill's object store. The path after `/files/` is the relative file path.

#### Download Skill Package

```
GET /api/skills/:id/download
```

Downloads the entire skill as a tar.gz archive containing SKILL.md and all supporting files. The archive follows the [Agent Skills](https://agentskills.io) standard format.

#### Import from Archive

```
POST /api/skills/import
Content-Type: multipart/form-data
```

Import a skill from a tar.gz archive (field name: `archive`). Also supports legacy JSON body import.

## Pagination

List endpoints support pagination query parameters:

- `page` — page number (default: 1)
- `pageSize` — items per page (default: 20, max: 100)

## Rate Limiting

The API applies rate limiting via `express-rate-limit` middleware. Specific limits are configured in `apps/api/src/middleware/rate-limit.middleware.ts`.

## Error Codes

Common error responses:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed Zod validation |
| 401 | `UNAUTHORIZED` | Missing or invalid Bearer token |
| 403 | `FORBIDDEN` | Authenticated but not authorized |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
