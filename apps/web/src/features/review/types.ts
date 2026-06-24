export type Severity = "critical" | "warning" | "suggestion" | "good";
export type FindingCategory =
  | "reliability"
  | "topology"
  | "performance"
  | "best-practice"
  | "capacity"
  | "patterns";

export type Finding = {
  id: string;
  severity: Severity;
  category: FindingCategory;
  title: string;
  description: string;
  nodeIds: string[];
  edgeIds: string[];
  suggestion?: string;
  docsUrl?: string;
  /** Estimated score impact: positive = points gained, negative = points lost */
  impact?: number;
};
