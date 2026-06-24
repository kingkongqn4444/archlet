import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding, Severity } from "./types";
import { reliabilityRules } from "./rules/reliability-rules";
import { topologyRules } from "./rules/topology-rules";
import { performanceRules } from "./rules/performance-rules";
import { bestPracticeRules } from "./rules/best-practice-rules";
import { capacityRules } from "./rules/capacity-rules";

type SimMetrics = {
  nodeMetrics: Record<string, { arrivalRate: number; util: number }>;
  edgeMetrics: Record<string, number>;
};

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  suggestion: 2,
  good: 3,
};

export function runRules(
  diagram: { nodes: RFNode[]; edges: RFEdge[] },
  simMetrics: SimMetrics | null
): Finding[] {
  const { nodes, edges } = diagram;
  const findings: Finding[] = [
    ...reliabilityRules(nodes, edges),
    ...topologyRules(nodes, edges),
    ...performanceRules(nodes, edges, simMetrics),
    ...bestPracticeRules(nodes, edges),
    ...capacityRules(nodes, edges),
  ];

  return findings.sort((a, b) => {
    const sd = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sd !== 0) return sd;
    return a.id.localeCompare(b.id);
  });
}

export function calculateScore(findings: Finding[]): {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
} {
  let score = 100;
  for (const f of findings) {
    if (f.severity === "critical") score -= 20;
    else if (f.severity === "warning") score -= 8;
    else if (f.severity === "suggestion") score -= 3;
  }
  score = Math.max(0, Math.min(100, score));
  const grade =
    score >= 90
      ? "A"
      : score >= 75
      ? "B"
      : score >= 60
      ? "C"
      : score >= 40
      ? "D"
      : "F";
  return { score, grade };
}
