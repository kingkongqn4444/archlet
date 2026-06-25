import type { DiagramNode, DiagramEdge } from "../diagram";

export type TemplateCategory =
  | "social"
  | "messaging"
  | "streaming"
  | "marketplace"
  | "infra"
  | "fintech"
  // new categories (Phase 1 enum extension):
  | "architectural"
  | "healthcare"
  | "gaming"
  | "iot"
  | "edtech"
  | "logistics"
  | "ai";

export type TemplateDifficulty = "easy" | "medium" | "hard";

export type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
};
