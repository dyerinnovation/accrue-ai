import { prisma } from "@accrue-ai/db";

export const evalRepository = {
  async findById(id: string) {
    return prisma.skillEval.findUnique({ where: { id }, include: { skill: true } });
  },

  async findBySkillId(skillId: string) {
    return prisma.skillEval.findMany({ where: { skillId }, orderBy: { createdAt: "desc" } });
  },

  async create(data: {
    skillId: string;
    prompt: string;
    expected?: string;
    assertions: unknown[];
  }) {
    return prisma.skillEval.create({ data: { ...data, assertions: data.assertions as any } });
  },
};
