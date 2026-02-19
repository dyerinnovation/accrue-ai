import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  ANTHROPIC_API_KEY: z.string(),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-20250514"),
  API_PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

let _env: Env | undefined;

export function getEnv(): Env {
  if (!_env) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
      throw new Error("Invalid environment configuration");
    }
    _env = result.data;
  }
  return _env;
}
