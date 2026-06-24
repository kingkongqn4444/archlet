import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding, Severity } from "./types";
import { reliabilityRules } from "./rules/reliability-rules";
import { topologyRules } from "./rules/topology-rules";
import { performanceRules } from "./rules/performance-rules";
import { bestPracticeRules } from "./rules/best-practice-rules";
import { capacityRules } from "./rules/capacity-rules";
import { patternRules } from "./rules/pattern-rules";

type SimMetrics = {
  nodeMetrics: Record<string, { arrivalRate: number; util: number }>;
  edgeMetrics: Record<string, number>;
};

// Default impact weights per severity (used when rule doesn't set explicit impact)
const DEFAULT_IMPACT: Record<Severity, number> = {
  critical: -20,
  warning: -8,
  suggestion: -3,
  good: 5,
};

// Sort order: critical first, good last; within same severity sort by |impact| desc
const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  suggestion: 2,
  good: 3,
};

function tagImpact(finding: Finding): Finding {
  if (finding.impact !== undefined) return finding;
  return { ...finding, impact: DEFAULT_IMPACT[finding.severity] };
}

export function runRules(
  diagram: { nodes: RFNode[]; edges: RFEdge[] },
  simMetrics: SimMetrics | null
): Finding[] {
  const { nodes, edges } = diagram;
  const raw: Finding[] = [
    ...reliabilityRules(nodes, edges),
    ...topologyRules(nodes, edges),
    ...performanceRules(nodes, edges, simMetrics),
    ...bestPracticeRules(nodes, edges),
    ...capacityRules(nodes, edges),
    ...patternRules(nodes, edges),
  ];

  // Tag all findings with default impact if not set by rule
  const findings = raw.map(tagImpact);

  return findings.sort((a, b) => {
    const sd = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sd !== 0) return sd;
    // Within same severity: sort by |impact| descending (highest impact first)
    // For good findings: sort ascending (lowest positive impact last)
    const aImpact = Math.abs(a.impact ?? 0);
    const bImpact = Math.abs(b.impact ?? 0);
    return bImpact - aImpact;
  });
}

export function calculateScore(findings: Finding[]): {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
} {
  let score = 100;
  let goodBonus = 0;

  for (const f of findings) {
    if (f.severity === "critical") score -= 20;
    else if (f.severity === "warning") score -= 8;
    else if (f.severity === "suggestion") score -= 3;
    else if (f.severity === "good") goodBonus += 5;
  }

  // Good findings can recover up to 10 points (cap bonus)
  score += Math.min(goodBonus, 10);
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
