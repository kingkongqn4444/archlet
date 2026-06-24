import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding } from "../types";
import { getCapacity } from "@/features/simulate/capacity";
import type { NodeType } from "@archlet/shared";

type SimMetrics = {
  nodeMetrics: Record<string, { arrivalRate: number; util: number }>;
  edgeMetrics: Record<string, number>;
};

export function performanceRules(
  nodes: RFNode[],
  edges: RFEdge[],
  sim: SimMetrics | null
): Finding[] {
  const findings: Finding[] = [];

  if (!sim) return findings;

  const hasTraffic = Object.values(sim.edgeMetrics).some((v) => v > 0);
  if (!hasTraffic) return findings;

  // P1 + P2: Node utilisation checks
  for (const node of nodes) {
    const metric = sim.nodeMetrics[node.id];
    if (!metric) continue;
    const { util } = metric;

    if (util > 0.8) {
      findings.push({
        id: `P1-bottleneck-${node.id}`,
        severity: "critical",
        category: "performance",
        title: `${String(node.data.label ?? node.type)} is overloaded (${Math.round(util * 100)}% utilisation)`,
        description:
          "This node is handling more than 80% of its capacity. Under sustained load it will become a bottleneck causing latency spikes and timeouts.",
        nodeIds: [node.id],
        edgeIds: [],
        suggestion:
          "Scale horizontally (more instances/replicas) or add a cache/queue to absorb traffic.",
      });
    } else if (util > 0.5) {
      findings.push({
        id: `P2-hotspot-${node.id}`,
        severity: "warning",
        category: "performance",
        title: `${String(node.data.label ?? node.type)} approaching capacity (${Math.round(util * 100)}% utilisation)`,
        description:
          "Utilisation above 50% leaves little headroom for traffic spikes. Plan capacity expansion before it becomes critical.",
        nodeIds: [node.id],
        edgeIds: [],
        suggestion:
          "Monitor this node closely and prepare a scaling plan before utilisation exceeds 80%.",
      });
    }
  }

  // P3: Over-provisioned (< 5% util with traffic present)
  for (const node of nodes) {
    if (node.type === "user") continue;
    const metric = sim.nodeMetrics[node.id];
    if (!metric) continue;
    if (metric.util < 0.05 && metric.arrivalRate > 0) {
      findings.push({
        id: `P3-over-provisioned-${node.id}`,
        severity: "suggestion",
        category: "performance",
        title: `${String(node.data.label ?? node.type)} is heavily over-provisioned (${Math.round(metric.util * 100)}% utilisation)`,
        description:
          "This node is using less than 5% of its capacity under current traffic. Resources may be over-allocated, increasing cost.",
        nodeIds: [node.id],
        edgeIds: [],
        suggestion:
          "Reduce instance count or downsize resources to match actual traffic patterns.",
      });
    }
  }

  // P4: Edge overflow — rps > node capacity × 1.2
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const edge of edges) {
    const rps = sim.edgeMetrics[edge.id];
    if (!rps) continue;
    const target = byId.get(edge.target);
    if (!target) continue;
    const type = target.type as NodeType;
    const variant = (target.data.variant as string) ?? "";
    const config = (target.data.config as Record<string, unknown>) ?? {};
    const cap = getCapacity(type, variant, config);
    if (isFinite(cap) && rps > cap * 1.2) {
      findings.push({
        id: `P4-edge-overflow-${edge.id}`,
        severity: "critical",
        category: "performance",
        title: `Traffic on edge exceeds ${String(target.data.label ?? target.type)} capacity by 20%+`,
        description: `The edge is carrying ${Math.round(rps)} req/s but the target node capacity is ${Math.round(cap)} req/s. Excess requests will be dropped or queued indefinitely.`,
        nodeIds: [edge.target],
        edgeIds: [edge.id],
        suggestion:
          "Scale up the target node or introduce a queue/rate-limiter to absorb burst traffic.",
      });
    }
  }

  return findings;
}
