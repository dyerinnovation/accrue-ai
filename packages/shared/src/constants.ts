export const SKILL_STATUS = {
  DRAFT: "DRAFT",
  TESTING: "TESTING",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export const TEAM_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;

export const WIZARD_STEPS: readonly string[] = [
  "capture-intent",
  "interview",
  "draft",
  "test",
  "evaluate",
  "iterate",
  "publish",
];

export const SKILL_TEMPLATE = `---
name: {{name}}
description: >
  {{description}}
tags: [{{tags}}]
version: 1
---

# {{name}}

## Purpose
{{purpose}}

## When to Use
{{whenToUse}}

## Instructions
{{instructions}}

## Examples
{{examples}}

## References
{{references}}
`;

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
  },
  SKILLS: {
    LIST: "/api/skills",
    CREATE: "/api/skills",
    GET: "/api/skills/:id",
    UPDATE: "/api/skills/:id",
    DELETE: "/api/skills/:id",
    VERSIONS: "/api/skills/:id/versions",
    PUBLISH: "/api/skills/:id/publish",
    ITERATE: "/api/skills/:id/iterate",
    EXPORT: "/api/skills/:id/export",
    IMPORT: "/api/skills/import",
  },
  WIZARD: {
    START: "/api/wizard/start",
    MESSAGE: "/api/wizard/:sessionId/message",
    GET: "/api/wizard/:sessionId",
  },
  TEAMS: {
    LIST: "/api/teams",
    CREATE: "/api/teams",
    SKILLS: "/api/teams/:id/skills",
    MEMBERS: "/api/teams/:id/members",
  },
  EVALS: {
    CREATE: "/api/evals",
    RUN: "/api/evals/:id/run",
    RESULTS: "/api/evals/:id/results",
  },
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_SKILL_CONTENT_LENGTH = 100_000;
export const API_KEY_PREFIX = "ak_";
