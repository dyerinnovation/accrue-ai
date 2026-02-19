import { z } from "zod";

export const StartWizardSchema = z.object({
  intent: z.string().min(1).max(2000).optional(),
});

export const WizardMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});
