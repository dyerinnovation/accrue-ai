# Skill Creator

The foundational meta-skill for Accrue AI.

## Overview

This is the first and most important skill in the Accrue AI platform. It guides AI agents through the complete process of creating, testing, and iterating on reusable AI skills.

## Usage

### Via MCP Server
```
Tool: get_skill
Input: { "identifier": "skill-creator" }
```

### Via API
```
GET /api/skills?slug=skill-creator
```

### Direct Usage
Any Claude-compatible AI agent can read the SKILL.md file directly and follow its instructions to create new skills.

## Files

- `SKILL.md` — The complete skill definition
- `README.md` — This file

## Iteration History

- **v1** — Initial version with 7-step creation workflow
