import { API_KEY_PREFIX } from "./constants.js";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = API_KEY_PREFIX;
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function parseSkillSections(
  content: string
): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionRegex = /^## (.+)$/gm;
  let match: RegExpExecArray | null;
  const matches: { title: string; index: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    matches.push({ title: match[1] ?? "", index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]!;
    const next = matches[i + 1];
    const sectionContent = next
      ? content.slice(current.index + current.title.length + 3, next.index)
      : content.slice(current.index + current.title.length + 3);

    const key = current.title
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");
    sections[key] = sectionContent.trim();
  }

  return sections;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0] ?? "";
}
