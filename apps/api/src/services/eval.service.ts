import { ClaudeClient } from "@accrue-ai/claude-client";
import { evalRepository } from "../repositories/eval.repository.js";
import { skillRepository } from "../repositories/skill.repository.js";
import { getEnv } from "../config/env.js";

export const evalService = {
  async create(data: { skillId: string; prompt: string; expected?: string; assertions: string[] }) {
    return evalRepository.create(data);
  },

  async run(evalId: string) {
    const evalRecord = await evalRepository.findById(evalId);
    if (!evalRecord) throw new Error("Eval not found");

    const skill = await skillRepository.findById(evalRecord.skillId);
    if (!skill) throw new Error("Skill not found");

    const env = getEnv();
    const claude = new ClaudeClient({ apiKey: env.ANTHROPIC_API_KEY, model: env.CLAUDE_MODEL });

    const response = await claude.chat(
      [{ role: "user", content: `Using this skill:\n\n${skill.content}\n\n---\n\nExecute the following prompt:\n${evalRecord.prompt}` }],
      "You are an AI agent executing a skill. Follow the skill instructions precisely."
    );

    const assertions = evalRecord.assertions as string[];
    const results = assertions.map((assertion) => ({
      assertion,
      passed: response.content.toLowerCase().includes(assertion.toLowerCase()),
    }));

    return {
      evalId,
      skillId: skill.id,
      output: response.content,
      results,
      passRate: results.filter((r) => r.passed).length / Math.max(results.length, 1),
    };
  },

  async getResults(evalId: string) {
    const evalRecord = await evalRepository.findById(evalId);
    if (!evalRecord) throw new Error("Eval not found");
    return evalRecord;
  },
};
