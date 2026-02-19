# packages/claude-client

> Parent context: see [../CLAUDE.md](../CLAUDE.md)

## What This Is

Thin wrapper around the Anthropic SDK (v0.37). Provides `chat()` and `chatStream()` methods for interacting with Claude.

## Key Files

- `src/client.ts` — `ClaudeClient` class (constructor, `chat`, `chatStream`, `getModel`)
- `src/types.ts` — `ClaudeClientConfig`, `ClaudeMessage`, `ClaudeResponse`, `StreamCallback`
- `src/index.ts` — Barrel export

## Conventions

- `ClaudeClient` is a **class** (exception to the object-literal pattern used elsewhere)
- Default model: `claude-sonnet-4-20250514`, default `max_tokens`: 4096
- `chat()` returns full response; `chatStream()` calls `onChunk` callback per token
- System prompt is an optional string passed as `system` to the Anthropic API

## Usage Pattern

```typescript
import { ClaudeClient } from "@accrue-ai/claude-client";

const client = new ClaudeClient({ apiKey: "sk-ant-...", model: "claude-sonnet-4-20250514" });
const response = await client.chat(
  [{ role: "user", content: "Hello" }],
  "You are a helpful assistant"
);
// response: { content, model, usage: { inputTokens, outputTokens }, stopReason }
```

## Common Tasks

```bash
pnpm --filter @accrue-ai/claude-client build   # Compile to dist/
pnpm --filter @accrue-ai/claude-client test    # Run vitest
```

## Gotchas

- SDK version 0.37 — check for breaking changes before upgrading
- `chatStream` uses `.stream()` method and the `"text"` event listener
- Only text content blocks are extracted (images/tool-use not handled)
- `system` is passed as empty string `""` if not provided (not `undefined`)
