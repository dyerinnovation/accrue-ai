---
name: skill-creator
description: >
  The foundational meta-skill that guides AI agents through the process of creating, 
  testing, and iterating on reusable AI skills. This skill is the bootstrap — it 
  creates all other skills through a structured, iterative assembly line process.
tags: [meta, creation, foundational, bootstrap]
version: 1
---

# Skill Creator

## Purpose
Enable any AI agent to guide a user through the complete lifecycle of creating a high-quality, reusable AI skill. This includes capturing intent, conducting a structured interview, drafting the skill, testing it against real scenarios, evaluating results, iterating based on feedback, and publishing the finished skill.

This is the foundational skill of Accrue AI — all other skills are created using this process.

## When to Use
Trigger this skill when a user:
- Says "create a skill", "new skill", "build a skill", or "make a skill"
- Wants to formalize a repeatable AI workflow
- Needs to turn a one-off prompt into a reusable, shareable instruction set
- Asks to improve or iterate on an existing skill
- Wants to convert domain expertise into an AI-executable format

## Instructions

Follow these steps in order. Each step must be completed before moving to the next. Maintain conversation context throughout.

### Step 1: Capture Intent
Ask the user a single, focused question:
> "What should this skill enable an AI agent to do?"

Listen for:
- The target task or capability
- The expected output format
- Any specific tools or contexts involved

If the answer is vague, ask one follow-up:
> "Can you give me a specific example of when you'd use this skill?"

Record the intent as a one-sentence summary.

### Step 2: Interview
Ask 3-5 clarifying questions to understand edge cases and constraints. Focus on:

1. **Scope**: "What should this skill NOT do? Any boundaries?"
2. **Format**: "What format should the output be in? (code, markdown, structured data, etc.)"
3. **Context**: "What context or information does the agent need to have available?"
4. **Quality criteria**: "How will you know if the output is good? What makes a result 'correct'?"
5. **Edge cases**: "Are there tricky cases or exceptions the skill should handle?"

Do NOT ask all 5 — pick the 3 most relevant based on the intent. Keep the interview conversational.

### Step 3: Draft
Generate a complete SKILL.md file following this exact format:

```markdown
---
name: <kebab-case-name>
description: >
  <Clear description of what this skill does and when to trigger it>
tags: [<relevant, tags>]
version: 1
---

# <Skill Name>

## Purpose
<What this skill enables an AI agent to do>

## When to Use
<Specific trigger patterns and contexts>

## Instructions
<Numbered, step-by-step instructions for the AI agent>

## Examples
<2-3 input/output examples showing expected behavior>

## References
<Any supporting files, links, or resources>
```

Ensure the Instructions section is:
- Written as imperative commands to the AI agent
- Numbered and sequential
- Specific enough to be followed without additional context
- Between 200-2000 words

### Step 4: Test
Create 2-3 test prompts that simulate real usage of the skill. For each test prompt:

1. Present the prompt to the user
2. Mentally execute the skill against the prompt
3. Generate the expected output
4. Present both the prompt and output to the user for review

Format each test as:
```
**Test N: <brief description>**
Prompt: <the test input>
Expected: <what the skill should produce>
Result: <actual output from following the skill>
```

### Step 5: Evaluate
After presenting test results, ask the user:
> "On a scale of 1-5, how well did the skill perform? What specifically needs improvement?"

Categorize feedback into:
- **Critical**: Must fix before publishing (incorrect behavior, missing steps)
- **Important**: Should fix (unclear instructions, incomplete coverage)
- **Nice-to-have**: Could improve (style, additional examples)

### Step 6: Iterate
Based on evaluation feedback:

1. Address all Critical issues first
2. Address Important issues
3. Apply Nice-to-have improvements if they don't add complexity
4. Increment the version number
5. Generate a brief changelog entry

Re-run the test prompts against the improved version. Compare results:
- If pass rate improved → continue to publish or iterate again
- If pass rate decreased → revert the problematic changes and try a different approach
- If pass rate plateaued after 3 iterations → present to user for manual decision

**Stopping criteria:**
- User explicitly says they're satisfied
- All test prompts produce acceptable results
- 5 iterations reached (present current best version)

### Step 7: Publish
When the skill is ready:

1. Present the final SKILL.md for user approval
2. Confirm metadata (name, description, tags)
3. Ask if the skill should be public or team-only
4. Generate a summary of the skill for the library listing

Output the complete, final SKILL.md content ready for storage.

## Examples

### Example 1: Creating a Code Review Skill

**User**: "Create a skill that helps review Python code"

**Agent (Step 1)**: "What should this skill enable an AI agent to do?"

**User**: "It should review Python code for bugs, style issues, and suggest improvements"

**Agent (Step 2)**: 
- "What should this skill NOT review? (e.g., should it skip performance optimization?)"
- "Should it follow a specific style guide like PEP 8?"
- "How should it present findings — inline comments, summary list, or both?"

**Agent (Step 3)**: *Generates SKILL.md with structured review process*

**Agent (Step 4)**: 
```
Test 1: Simple function review
Prompt: Review this function — def add(a, b): return a + b
Expected: Identifies missing type hints, docstring
Result: ✓ Correctly identifies missing type hints and docstring
```

### Example 2: Creating a Documentation Skill

**User**: "Make a skill for writing API docs from TypeScript code"

**Agent (Step 1)**: Intent captured — generate API documentation from TypeScript source files

**Agent (Step 2)**: 
- "Should it generate OpenAPI/Swagger format or plain markdown?"
- "Should it document internal/private methods or only public API?"
- "What level of detail — just signatures or full descriptions with examples?"

*Continues through remaining steps...*

### Example 3: Iteration in Action

**Version 1 Test Results**: 2/3 tests pass
**Feedback**: "The instructions don't handle edge cases with async functions"
**Version 2**: Added async-specific handling steps
**Version 2 Test Results**: 3/3 tests pass
**Decision**: Publish version 2

## References
- Accrue AI Skill Format Specification (this document defines the format)
- All skills created by this skill-creator should follow the SKILL.md format above
- For programmatic skill management, see the Accrue AI API documentation
