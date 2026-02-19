import { z } from "zod";

export const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  BETTER_AUTH_SECRET: z.string().min(16),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-20250514"),
  API_PORT: z.coerce.number().default(3001),
  API_URL: z.string().url().default("http://localhost:3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  MCP_SERVER_PORT: z.coerce.number().default(3002),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function validateEnv(): ServerEnv {
  const result = ServerEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}
