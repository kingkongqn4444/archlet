export type Severity = "critical" | "warning" | "suggestion" | "good";
export type FindingCategory =
  | "reliability"
  | "topology"
  | "performance"
  | "best-practice"
  | "capacity";

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
};
