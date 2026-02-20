import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "@accrue-ai/db";
import { createStorageProvider, type StorageProvider } from "@accrue-ai/storage";
import { createSkill } from "@accrue-ai/skill-engine";
import { slugify } from "@accrue-ai/shared";

// Initialize storage provider from environment
function getStorage(): StorageProvider {
  return createStorageProvider({
    provider: (process.env.STORAGE_PROVIDER as "minio" | "s3") ?? "minio",
    bucket: process.env.STORAGE_BUCKET ?? "accrue-skills",
    endpoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESS_KEY ?? process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.MINIO_SECRET_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
  });
}

function buildStoragePath(teamId: string | undefined, slug: string, version: number): string {
  const teamPrefix = teamId ?? "_personal";
  return `skills/${teamPrefix}/${slug}/v${version}/`;
}

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
      select: { id: true, name: true, slug: true, description: true, tags: true, version: true, storagePath: true },
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
  "Fetch a skill's full SKILL.md content by name, slug, or ID. Reads from the object store if available, falls back to database.",
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

    // Try reading SKILL.md from object store
    if (skill.storagePath) {
      try {
        const storage = getStorage();
        const buf = await storage.getObject(`${skill.storagePath}SKILL.md`);
        return {
          content: [{ type: "text" as const, text: buf.toString("utf-8") }],
        };
      } catch {
        // Fall back to DB content
      }
    }

    return {
      content: [{ type: "text" as const, text: skill.content }],
    };
  }
);

server.tool(
  "create_skill",
  "Create a new skill with SKILL.md and optional supporting files. Files are written to the object store.",
  {
    name: z.string().describe("Skill name"),
    description: z.string().describe("Skill description"),
    content: z.string().optional().describe("Initial SKILL.md content"),
    tags: z.array(z.string()).optional().describe("Tags for the skill"),
  },
  async ({ name, description, content, tags }) => {
    const slug = slugify(name);
    const created = createSkill({ name, description, tags });
    const skillContent = content ?? created.content;

    // Write to object store
    const storagePath = buildStoragePath(undefined, slug, 1);
    const storage = getStorage();
    await storage.putObject(`${storagePath}SKILL.md`, Buffer.from(skillContent), "text/markdown");

    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        description,
        content: skillContent,
        storagePath,
        authorId: "mcp-user",
        tags: tags ?? [],
        isPublic: false,
      },
    });

    // Create version and file records
    const version = await prisma.skillVersion.create({
      data: {
        skillId: skill.id,
        version: 1,
        content: skillContent,
        storagePath,
        changelog: "Initial version",
      },
    });

    await prisma.skillFile.create({
      data: {
        skillId: skill.id,
        skillVersionId: version.id,
        path: "SKILL.md",
        storageKey: `${storagePath}SKILL.md`,
        size: Buffer.byteLength(skillContent),
        contentType: "text/markdown",
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Skill created: ${skill.name} (${skill.id})\nStorage: ${storagePath}\n\n${skill.content}`,
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

server.tool(
  "list_skill_files",
  "List all files in a skill's package (SKILL.md, scripts, templates, etc.)",
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
      include: { files: true },
    });

    if (!skill) {
      return {
        content: [{ type: "text" as const, text: `Skill not found: ${identifier}` }],
        isError: true,
      };
    }

    // If we have file records in DB, use those
    if (skill.files.length > 0) {
      const fileList = skill.files.map((f) => ({
        path: f.path,
        size: f.size,
        contentType: f.contentType,
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify(fileList, null, 2) }],
      };
    }

    // Otherwise, list from object store directly
    if (skill.storagePath) {
      try {
        const storage = getStorage();
        const keys = await storage.listObjects(skill.storagePath);
        const files = keys.map((key) => ({
          path: key.slice(skill.storagePath!.length),
          storageKey: key,
        }));
        return {
          content: [{ type: "text" as const, text: JSON.stringify(files, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error listing files: ${err instanceof Error ? err.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }

    return {
      content: [{ type: "text" as const, text: "This skill has no files in the object store (content only in database)." }],
    };
  }
);

server.tool(
  "get_skill_file",
  "Fetch a specific file from a skill's package (e.g., scripts/run.py, templates/output.md)",
  {
    identifier: z.string().describe("Skill name, slug, or ID"),
    path: z.string().describe("File path within the skill (e.g., 'scripts/run.py', 'SKILL.md')"),
  },
  async ({ identifier, path }) => {
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

    if (!skill.storagePath) {
      // If no storage path, only SKILL.md is available from content column
      if (path === "SKILL.md") {
        return {
          content: [{ type: "text" as const, text: skill.content }],
        };
      }
      return {
        content: [{ type: "text" as const, text: `File not found: ${path} (skill has no object store path)` }],
        isError: true,
      };
    }

    try {
      const storage = getStorage();
      const storageKey = `${skill.storagePath}${path}`;
      const exists = await storage.objectExists(storageKey);
      if (!exists) {
        return {
          content: [{ type: "text" as const, text: `File not found: ${path}` }],
          isError: true,
        };
      }

      const buf = await storage.getObject(storageKey);

      // Return text files as text, binary files as base64
      const textExtensions = ["md", "txt", "py", "js", "ts", "sh", "json", "yaml", "yml", "html", "css", "xml"];
      const ext = path.split(".").pop()?.toLowerCase() ?? "";
      if (textExtensions.includes(ext)) {
        return {
          content: [{ type: "text" as const, text: buf.toString("utf-8") }],
        };
      }

      return {
        content: [{ type: "text" as const, text: `Binary file (${buf.length} bytes). Use the API download endpoint to retrieve this file.` }],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: `Error reading file: ${err instanceof Error ? err.message : "Unknown error"}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Accrue AI MCP server running on stdio");
}

main().catch(console.error);
