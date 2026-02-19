import { prisma, type SkillStatus } from "@accrue-ai/db";

export interface SkillQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  tags?: string;
  status?: SkillStatus;
  teamId?: string;
  authorId?: string;
}

export const skillRepository = {
  async findById(id: string) {
    return prisma.skill.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true, name: true } }, team: true },
    });
  },

  async findMany(params: SkillQueryParams) {
    const { page, pageSize, search, tags, status, teamId, authorId } = params;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tags) where.tags = { hasSome: tags.split(",") };
    if (status) where.status = status;
    if (teamId) where.teamId = teamId;
    if (authorId) where.authorId = authorId;

    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        include: { author: { select: { id: true, email: true, name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.skill.count({ where }),
    ]);

    return { skills, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async create(data: {
    name: string;
    slug: string;
    description: string;
    content: string;
    authorId: string;
    teamId?: string;
    tags?: string[];
    isPublic?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.skill.create({ data });
  },

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    content: string;
    status: SkillStatus;
    tags: string[];
    isPublic: boolean;
    version: number;
    metadata: Record<string, unknown>;
  }>) {
    return prisma.skill.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.skill.delete({ where: { id } });
  },

  async getVersions(skillId: string) {
    return prisma.skillVersion.findMany({
      where: { skillId },
      orderBy: { version: "desc" },
    });
  },

  async createVersion(data: {
    skillId: string;
    version: number;
    content: string;
    changelog?: string;
    metrics?: Record<string, unknown>;
  }) {
    return prisma.skillVersion.create({ data });
  },
};
