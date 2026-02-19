import type { ClaudeClient } from "@accrue-ai/claude-client";
import type { IterateSkillInput } from "./types.js";

const ITERATION_SYSTEM_PROMPT = `You are a skill improvement specialist for Accrue AI. Your job is to improve AI agent skills based on user feedback.

Given:
1. The current skill content (in SKILL.md format with YAML frontmatter)
2. User feedback about what to improve

You must:
- Preserve the SKILL.md format (YAML frontmatter + markdown sections)
- Address all feedback points
- Maintain or improve clarity and specificity
- Keep the skill focused on its stated purpose
- Increment the version number in frontmatter

Return ONLY the improved skill content in SKILL.md format, nothing else.`;

export async function iterateSkill(
  currentContent: string,
  input: IterateSkillInput,
  claudeClient: ClaudeClient
): Promise<{ content: string; changelog: string }> {
  const response = await claudeClient.chat(
    [
      {
        role: "user",
        content: `Here is the current skill:\n\n${currentContent}\n\n---\n\nFeedback to address:\n${input.feedback}\n\nPlease return the improved skill content.`,
      },
    ],
    ITERATION_SYSTEM_PROMPT
  );

  const changelogResponse = await claudeClient.chat(
    [
      {
        role: "user",
        content: `Summarize the changes made between these two versions in 1-2 sentences:\n\nOLD:\n${currentContent}\n\nNEW:\n${response.content}`,
      },
    ],
    "You are a technical changelog writer. Provide a concise summary of changes."
  );

  return {
    content: response.content,
    changelog: changelogResponse.content,
  };
}
