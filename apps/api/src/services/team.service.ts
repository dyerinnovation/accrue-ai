import { slugify } from "@accrue-ai/shared";
import { teamRepository } from "../repositories/team.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export const teamService = {
  async list(userId: string) {
    return teamRepository.findByUserId(userId);
  },

  async create(name: string, userId: string) {
    const slug = slugify(name);
    return teamRepository.create({ name, slug }, userId);
  },

  async getById(id: string, userId: string) {
    const team = await teamRepository.findById(id);
    if (!team) throw new Error("Team not found");
    const role = await teamRepository.getMemberRole(id, userId);
    if (!role) throw new Error("Not a member of this team");
    return team;
  },

  async addMember(teamId: string, email: string, role: "ADMIN" | "MEMBER" | "VIEWER", requesterId: string) {
    const requesterRole = await teamRepository.getMemberRole(teamId, requesterId);
    if (!requesterRole || !["OWNER", "ADMIN"].includes(requesterRole)) {
      throw new Error("Not authorized to add members");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    return teamRepository.addMember(teamId, user.id, role);
  },
};
