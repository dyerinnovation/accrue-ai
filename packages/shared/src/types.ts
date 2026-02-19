import { z } from "zod";

// Skill-related types
export const SkillFrontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  version: z.number().int().positive().default(1),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  content: string;
  sections: {
    purpose?: string;
    whenToUse?: string;
    instructions?: string;
    examples?: string;
    references?: string;
  };
}

export interface SkillBundle {
  metadata: SkillFrontmatter;
  content: string;
  assets: Record<string, string>;
  version: number;
  exportedAt: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Wizard types
export type WizardStep =
  | "capture-intent"
  | "interview"
  | "draft"
  | "test"
  | "evaluate"
  | "iterate"
  | "publish";

export interface WizardMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface WizardState {
  step: WizardStep;
  skillName?: string;
  skillDescription?: string;
  draftContent?: string;
  testResults?: TestResult[];
  iterationCount: number;
}

export interface TestResult {
  prompt: string;
  output: string;
  passed: boolean;
  feedback?: string;
}

// Version comparison types
export interface VersionComparison {
  versionA: number;
  versionB: number;
  results: ComparisonResult[];
  winner: "A" | "B" | "tie";
  summary: string;
}

export interface ComparisonResult {
  evalPrompt: string;
  scoreA: number;
  scoreB: number;
  notes: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}
