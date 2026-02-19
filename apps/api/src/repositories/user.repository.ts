import { prisma } from "@accrue-ai/db";

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: { email: string; name?: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: { name?: string; email?: string }) {
    return prisma.user.update({ where: { id }, data });
  },
};
