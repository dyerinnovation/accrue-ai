import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create system user
  const systemUser = await prisma.user.upsert({
    where: { email: "system@accrue.ai" },
    update: {},
    create: {
      email: "system@accrue.ai",
      name: "Accrue AI System",
      passwordHash: "SYSTEM_USER_NO_LOGIN",
    },
  });

  // Read the skill-creator SKILL.md
  let skillContent = "# Skill Creator\n\nThe foundational skill for creating other skills.";
  try {
    skillContent = readFileSync(
      join(__dirname, "../../../skills/skill-creator/SKILL.md"),
      "utf-8"
    );
  } catch {
    console.warn("skills/skill-creator/SKILL.md not found, using default content");
  }

  // Seed the skill-creator skill
  const skillCreator = await prisma.skill.upsert({
    where: {
      slug_teamId: { slug: "skill-creator", teamId: systemUser.id },
    },
    update: {
      content: skillContent,
    },
    create: {
      name: "Skill Creator",
      slug: "skill-creator",
      description:
        "The meta skill that helps create and iteratively improve other skills. This is the foundational product of Accrue AI.",
      content: skillContent,
      version: 1,
      status: "PUBLISHED",
      authorId: systemUser.id,
      tags: ["meta", "creation", "foundational"],
      isPublic: true,
      metadata: {
        category: "meta",
        triggerPatterns: [
          "create a skill",
          "new skill",
          "build a skill",
          "make a skill",
        ],
      },
    },
  });

  // Create initial version
  await prisma.skillVersion.upsert({
    where: { id: "seed-skill-creator-v1" },
    update: {},
    create: {
      id: "seed-skill-creator-v1",
      skillId: skillCreator.id,
      version: 1,
      content: skillContent,
      changelog: "Initial version of the skill-creator skill",
    },
  });

  // Create eval test cases
  const evalCases = [
    {
      prompt: "Create a skill that helps write unit tests for TypeScript code",
      expected:
        "A skill with clear instructions for generating TypeScript unit tests with proper assertions and mocking",
      assertions: [
        "contains a Purpose section",
        "contains an Instructions section",
        "mentions TypeScript",
        "mentions testing patterns",
      ],
    },
    {
      prompt: "Create a skill for code review",
      expected:
        "A skill that guides AI through systematic code review with quality checks",
      assertions: [
        "contains a Purpose section",
        "contains step-by-step instructions",
        "mentions code quality criteria",
      ],
    },
    {
      prompt: "Create a skill for writing API documentation",
      expected:
        "A skill for generating comprehensive API docs from code",
      assertions: [
        "contains a Purpose section",
        "contains examples",
        "mentions API endpoints or schemas",
      ],
    },
  ];

  for (const evalCase of evalCases) {
    await prisma.skillEval.create({
      data: {
        skillId: skillCreator.id,
        prompt: evalCase.prompt,
        expected: evalCase.expected,
        assertions: evalCase.assertions,
      },
    });
  }

  console.log("Seed completed successfully");
  console.log(`  - System user: ${systemUser.id}`);
  console.log(`  - Skill Creator: ${skillCreator.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
