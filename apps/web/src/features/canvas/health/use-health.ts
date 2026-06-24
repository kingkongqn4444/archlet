import { useSimStore } from "@/features/simulate/sim-store";
import { useReviewStore } from "@/features/review/review-store";

export type HealthLevel = "critical" | "warning" | "healthy" | "idle";

export function useNodeHealth(nodeId: string): HealthLevel {
  const isRunning = useSimStore((s) => s.isRunning);
  const isDead = useSimStore((s) => s.deadNodes.has(nodeId));
  const metric = useSimStore((s) => s.nodeMetrics[nodeId]);
  const findings = useReviewStore((s) => s.findings);

  if (isDead) return "critical";

  if (isRunning) {
    if (!metric) return "idle";
    if (metric.util > 0.8) return "critical";
    if (metric.util > 0.5) return "warning";
    if (metric.arrivalRate > 0) return "healthy";
    return "idle";
  }

  // Sim idle — derive from review findings
  const matching = findings.filter((f) => f.nodeIds.includes(nodeId));
  if (matching.some((f) => f.severity === "critical")) return "critical";
  if (matching.some((f) => f.severity === "warning")) return "warning";
  return "idle";
}

export function useEdgeHealth(
  edgeId: string,
  _sourceId: string,
  targetId: string
): HealthLevel {
  const isRunning = useSimStore((s) => s.isRunning);
  const isTargetDead = useSimStore((s) => s.deadNodes.has(targetId));
  const targetMetric = useSimStore((s) => s.nodeMetrics[targetId]);
  const findings = useReviewStore((s) => s.findings);

  if (isTargetDead) return "critical";

  if (isRunning) {
    if (!targetMetric) return "idle";
    if (targetMetric.util > 0.8) return "critical";
    if (targetMetric.util > 0.5) return "warning";
    if (targetMetric.arrivalRate > 0) return "healthy";
    return "idle";
  }

  // Sim idle — check review findings by edgeId first, then by targetId
  const edgeFindings = findings.filter((f) => f.edgeIds.includes(edgeId));
  if (edgeFindings.some((f) => f.severity === "critical")) return "critical";
  if (edgeFindings.some((f) => f.severity === "warning")) return "warning";

  const nodeFindings = findings.filter((f) => f.nodeIds.includes(targetId));
  if (nodeFindings.some((f) => f.severity === "critical")) return "critical";
  if (nodeFindings.some((f) => f.severity === "warning")) return "warning";

  return "idle";
}
