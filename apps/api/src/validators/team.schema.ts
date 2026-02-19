import { z } from "zod";

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(100),
});

export const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});
