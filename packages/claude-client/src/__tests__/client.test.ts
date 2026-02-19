import { describe, it, expect, vi } from "vitest";
import { ClaudeClient } from "../client.js";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "text", text: "Hello from Claude" }],
          model: "claude-sonnet-4-20250514",
          usage: { input_tokens: 10, output_tokens: 5 },
          stop_reason: "end_turn",
        }),
        stream: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          finalMessage: vi.fn().mockResolvedValue({
            model: "claude-sonnet-4-20250514",
            usage: { input_tokens: 10, output_tokens: 5 },
            stop_reason: "end_turn",
          }),
        }),
      },
    })),
  };
});

describe("ClaudeClient", () => {
  const config = {
    apiKey: "sk-ant-test-key",
    model: "claude-sonnet-4-20250514",
  };

  it("creates a client with config", () => {
    const client = new ClaudeClient(config);
    expect(client.getModel()).toBe("claude-sonnet-4-20250514");
  });

  it("sends messages and returns response", async () => {
    const client = new ClaudeClient(config);
    const response = await client.chat([
      { role: "user", content: "Hello" },
    ]);

    expect(response.content).toBe("Hello from Claude");
    expect(response.model).toBe("claude-sonnet-4-20250514");
    expect(response.usage.inputTokens).toBe(10);
    expect(response.usage.outputTokens).toBe(5);
  });

  it("uses default model when not specified", () => {
    const client = new ClaudeClient({ apiKey: "sk-ant-test-key" });
    expect(client.getModel()).toBe("claude-sonnet-4-20250514");
  });
});
