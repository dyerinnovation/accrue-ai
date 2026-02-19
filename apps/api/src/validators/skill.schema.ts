import { z } from "zod";

export const CreateSkillSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  content: z.string().optional(),
  tags: z.array(z.string()).default([]),
  teamId: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const UpdateSkillSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const IterateSkillSchema = z.object({
  feedback: z.string().min(1).max(5000),
});

export const ImportSkillSchema = z.object({
  bundle: z.string().min(1),
  teamId: z.string().optional(),
});

export const SkillQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "TESTING", "PUBLISHED", "ARCHIVED"]).optional(),
  teamId: z.string().optional(),
});
