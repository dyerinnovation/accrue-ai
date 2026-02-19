import { z } from "zod";

export const CreateEvalSchema = z.object({
  skillId: z.string().min(1),
  prompt: z.string().min(1).max(5000),
  expected: z.string().optional(),
  assertions: z.array(z.string()).default([]),
});
