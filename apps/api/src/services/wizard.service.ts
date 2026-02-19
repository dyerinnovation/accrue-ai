import { ClaudeClient } from "@accrue-ai/claude-client";
import { prisma } from "@accrue-ai/db";
import { getEnv } from "../config/env.js";

const WIZARD_SYSTEM_PROMPT = `You are the Accrue AI Skill Creator wizard. Guide the user through creating a new AI skill.

You follow a structured process:
1. Capture Intent - Ask what the skill should enable
2. Interview - Ask 3 clarifying questions about scope, format, and quality criteria
3. Draft - Generate a SKILL.md file with frontmatter and sections
4. Test - Create 2-3 test prompts and expected outputs
5. Evaluate - Ask user to rate results
6. Iterate - Improve based on feedback
7. Publish - Finalize the skill

Be conversational but focused. Keep responses concise. Always indicate which step you're on.
Start by asking the user what skill they want to create.`;

export const wizardService = {
  async start(userId: string, intent?: string) {
    const session = await prisma.wizardSession.create({
      data: {
        userId,
        step: "capture-intent",
        state: { iterationCount: 0 },
        messages: intent
          ? [
              { role: "user", content: intent, timestamp: new Date().toISOString() },
            ]
          : [],
      },
    });

    if (intent) {
      const env = getEnv();
      const claude = new ClaudeClient({ apiKey: env.ANTHROPIC_API_KEY, model: env.CLAUDE_MODEL });
      const response = await claude.chat(
        [{ role: "user", content: intent }],
        WIZARD_SYSTEM_PROMPT
      );

      await prisma.wizardSession.update({
        where: { id: session.id },
        data: {
          messages: [
            { role: "user", content: intent, timestamp: new Date().toISOString() },
            { role: "assistant", content: response.content, timestamp: new Date().toISOString() },
          ],
        },
      });

      return { sessionId: session.id, step: session.step, message: response.content };
    }

    return { sessionId: session.id, step: session.step, message: "What skill would you like to create? Tell me what it should enable an AI agent to do." };
  },

  async sendMessage(sessionId: string, userId: string, message: string) {
    const session = await prisma.wizardSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error("Session not found");
    if (session.userId !== userId) throw new Error("Not authorized");

    const messages = session.messages as Array<{ role: string; content: string; timestamp: string }>;
    messages.push({ role: "user", content: message, timestamp: new Date().toISOString() });

    const env = getEnv();
    const claude = new ClaudeClient({ apiKey: env.ANTHROPIC_API_KEY, model: env.CLAUDE_MODEL });

    const claudeMessages = messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const response = await claude.chat(claudeMessages, WIZARD_SYSTEM_PROMPT);

    messages.push({ role: "assistant", content: response.content, timestamp: new Date().toISOString() });

    await prisma.wizardSession.update({
      where: { id: sessionId },
      data: { messages },
    });

    return { sessionId, step: session.step, message: response.content };
  },

  async getSession(sessionId: string, userId: string) {
    const session = await prisma.wizardSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error("Session not found");
    if (session.userId !== userId) throw new Error("Not authorized");
    return { sessionId: session.id, step: session.step, messages: session.messages, state: session.state };
  },
};
