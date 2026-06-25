import type { Template, TemplateCategory } from "./types";
import { REAL_WORLD_APPS } from "./real-world-apps";
import { ARCHITECTURAL_PATTERNS } from "./architectural-patterns";
import { INDUSTRY_SPECIFIC } from "./industry-specific";

export type { Template, TemplateCategory, TemplateDifficulty } from "./types";

export const TEMPLATES: Template[] = [
  ...REAL_WORLD_APPS,
  ...ARCHITECTURAL_PATTERNS,
  ...INDUSTRY_SPECIFIC,
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}
