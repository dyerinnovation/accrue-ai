export interface ClaudeClientConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
}

export type StreamCallback = (chunk: string) => void;
