import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "@accrue-ai/db";

const server = new McpServer({
  name: "accrue-ai",
  version: "0.1.0",
});

server.tool(
  "list_skills",
  "List available skills from your Accrue AI library",
  {
    query: z.string().optional().describe("Search query"),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    team: z.string().optional().describe("Team slug"),
  },
  async ({ query, tags, team }) => {
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    if (team) {
      where.team = { slug: team };
    }

    const skills = await prisma.skill.findMany({
      where,
      select: { id: true, name: true, slug: true, description: true, tags: true, version: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(skills, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_skill",
  "Fetch a skill's full content by name, slug, or ID",
  {
    identifier: z.string().describe("Skill name, slug, or ID"),
  },
  async ({ identifier }) => {
    const skill = await prisma.skill.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
          { name: identifier },
        ],
      },
    });

    if (!skill) {
      return {
        content: [{ type: "text" as const, text: `Skill not found: ${identifier}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: skill.content }],
    };
  }
);

server.tool(
  "create_skill",
  "Create a new skill",
  {
    name: z.string().describe("Skill name"),
    description: z.string().describe("Skill description"),
    content: z.string().optional().describe("Initial SKILL.md content"),
  },
  async ({ name, description, content }) => {
    const { createSkill } = await import("@accrue-ai/skill-engine");
    const { slugify } = await import("@accrue-ai/shared");

    const slug = slugify(name);
    let skillContent = content;
    if (!skillContent) {
      const created = createSkill({ name, description });
      skillContent = created.content;
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        description,
        content: skillContent,
        authorId: "mcp-user",
        tags: [],
        isPublic: false,
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Skill created: ${skill.name} (${skill.id})\n\n${skill.content}`,
        },
      ],
    };
  }
);

server.tool(
  "iterate_skill",
  "Iterate on an existing skill with feedback",
  {
    identifier: z.string().describe("Skill name, slug, or ID"),
    feedback: z.string().describe("Feedback for improvement"),
  },
  async ({ identifier, feedback }) => {
    const skill = await prisma.skill.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
          { name: identifier },
        ],
      },
    });

    if (!skill) {
      return {
        content: [{ type: "text" as const, text: `Skill not found: ${identifier}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Iteration requested for skill "${skill.name}".\nFeedback: ${feedback}\n\nNote: Full iteration requires Claude API access. Use the web app or API for AI-powered iteration.`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Accrue AI MCP server running on stdio");
}

main().catch(console.error);
