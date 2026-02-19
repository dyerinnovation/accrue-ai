import Anthropic from "@anthropic-ai/sdk";
import type { ClaudeClientConfig, ClaudeMessage, ClaudeResponse, StreamCallback } from "./types.js";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_MAX_TOKENS = 4096;

export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: ClaudeClientConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model ?? DEFAULT_MODEL;
    this.maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  async chat(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt ?? "",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");

    return {
      content: textContent?.text ?? "",
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      stopReason: response.stop_reason,
    };
  }

  async chatStream(
    messages: ClaudeMessage[],
    systemPrompt: string | undefined,
    onChunk: StreamCallback
  ): Promise<ClaudeResponse> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt ?? "",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    let fullContent = "";

    stream.on("text", (text) => {
      fullContent += text;
      onChunk(text);
    });

    const finalMessage = await stream.finalMessage();

    return {
      content: fullContent,
      model: finalMessage.model,
      usage: {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
      },
      stopReason: finalMessage.stop_reason,
    };
  }

  getModel(): string {
    return this.model;
  }
}
