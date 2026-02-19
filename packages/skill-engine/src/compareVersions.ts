import type { VersionComparison, ComparisonResult } from "@accrue-ai/shared";
import type { ClaudeClient } from "@accrue-ai/claude-client";

const COMPARISON_SYSTEM_PROMPT = `You are an AI skill evaluator. Given a test prompt and two versions of a skill, score each version on a scale of 0-10.

Criteria:
- Clarity of instructions (0-10)
- Completeness of coverage (0-10)  
- Practical usefulness (0-10)

Return a JSON object with this exact format:
{"scoreA": <number>, "scoreB": <number>, "notes": "<brief explanation>"}`;

export async function compareVersions(
  contentA: string,
  contentB: string,
  evalPrompts: string[],
  claudeClient: ClaudeClient
): Promise<VersionComparison> {
  const results: ComparisonResult[] = [];

  for (const prompt of evalPrompts) {
    const response = await claudeClient.chat(
      [
        {
          role: "user",
          content: `Test prompt: "${prompt}"\n\nVersion A:\n${contentA}\n\n---\n\nVersion B:\n${contentB}\n\nScore both versions.`,
        },
      ],
      COMPARISON_SYSTEM_PROMPT
    );

    try {
      const parsed = JSON.parse(response.content) as {
        scoreA: number;
        scoreB: number;
        notes: string;
      };
      results.push({
        evalPrompt: prompt,
        scoreA: parsed.scoreA,
        scoreB: parsed.scoreB,
        notes: parsed.notes,
      });
    } catch {
      results.push({
        evalPrompt: prompt,
        scoreA: 5,
        scoreB: 5,
        notes: "Failed to parse comparison result",
      });
    }
  }

  const totalA = results.reduce((sum, r) => sum + r.scoreA, 0);
  const totalB = results.reduce((sum, r) => sum + r.scoreB, 0);

  let winner: "A" | "B" | "tie";
  if (totalA > totalB) winner = "A";
  else if (totalB > totalA) winner = "B";
  else winner = "tie";

  return {
    versionA: 0,
    versionB: 0,
    results,
    winner,
    summary: `Version ${winner === "tie" ? "tie" : winner} wins with scores A=${totalA} B=${totalB}`,
  };
}
