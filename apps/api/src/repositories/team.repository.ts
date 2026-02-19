import { prisma, type TeamRole } from "@accrue-ai/db";

export const teamRepository = {
  async findById(id: string) {
    return prisma.team.findUnique({ where: { id }, include: { members: { include: { user: { select: { id: true, email: true, name: true } } } } } });
  },

  async findByUserId(userId: string) {
    return prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: { select: { id: true, email: true, name: true } } } } },
    });
  },

  async create(data: { name: string; slug: string }, ownerId: string) {
    return prisma.team.create({
      data: { ...data, members: { create: { userId: ownerId, role: "OWNER" } } },
      include: { members: true },
    });
  },

  async addMember(teamId: string, userId: string, role: TeamRole) {
    return prisma.teamMember.create({ data: { teamId, userId, role } });
  },

  async removeMember(teamId: string, userId: string) {
    return prisma.teamMember.deleteMany({ where: { teamId, userId } });
  },

  async getMemberRole(teamId: string, userId: string) {
    const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId, teamId } } });
    return member?.role ?? null;
  },
};
