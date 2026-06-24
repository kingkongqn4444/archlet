import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimStore } from "@/features/simulate/sim-store";
import { useReviewStore } from "@/features/review/review-store";

export function buildSystemContext(): string {
  const diagram = useDiagramStore.getState();
  const sim = useSimStore.getState();
  const review = useReviewStore.getState();

  const nodesSummary = diagram.nodes
    .map((n) => {
      const variant = n.data.variant ? `/${n.data.variant}` : "";
      const config = n.data.config
        ? " " + Object.entries(n.data.config)
            .slice(0, 3)
            .map(([k, v]) => `${k}=${String(v)}`)
            .join(", ")
        : "";
      return `- ${String(n.data.label)} (${n.type}${variant}${config})`;
    })
    .join("\n");

  const edgesSummary = diagram.edges
    .map((e) => {
      const src = diagram.nodes.find((n) => n.id === e.source)?.data.label ?? e.source;
      const tgt = diagram.nodes.find((n) => n.id === e.target)?.data.label ?? e.target;
      const lbl = e.data?.label ? ` [${e.data.label}]` : "";
      return `- ${String(src)} → ${String(tgt)}${lbl}`;
    })
    .join("\n");

  const hasSimMetrics =
    Object.keys(sim.edgeMetrics).length > 0 ||
    Object.keys(sim.nodeMetrics).length > 0;

  let simSection = "";
  if (hasSimMetrics) {
    const edgeLines = Object.entries(sim.edgeMetrics)
      .slice(0, 5)
      .map(([id, rps]) => {
        const edge = diagram.edges.find((e) => e.id === id);
        const label = edge
          ? `${String(diagram.nodes.find((n) => n.id === edge.source)?.data.label ?? edge.source)} → ${String(diagram.nodes.find((n) => n.id === edge.target)?.data.label ?? edge.target)}`
          : id;
        return `  - ${label}: ${rps.toFixed(0)} req/s`;
      })
      .join("\n");

    const nodeLines = Object.entries(sim.nodeMetrics)
      .slice(0, 5)
      .map(([id, m]) => {
        const label = diagram.nodes.find((n) => n.id === id)?.data.label ?? id;
        return `  - ${String(label)}: util ${(m.util * 100).toFixed(0)}%`;
      })
      .join("\n");

    simSection = `\nSIM METRICS:\n${edgeLines}\n${nodeLines}`;
  }

  const criticalFindings = review.findings
    .filter((f) => f.severity === "critical" || f.severity === "warning")
    .slice(0, 3);

  let reviewSection = "";
  if (criticalFindings.length > 0) {
    const lines = criticalFindings
      .map((f) => `  - [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`)
      .join("\n");
    reviewSection = `\nRECENT REVIEW FINDINGS:\n${lines}`;
  }

  return `You are a senior system design interviewer reviewing this architecture.

CURRENT DIAGRAM:
Nodes:
${nodesSummary || "  (none)"}
Edges:
${edgesSummary || "  (none)"}
${simSection}${reviewSection}

Answer concisely (under 200 words unless deep dive requested). Suggest concrete changes (which variant, which config field).`;
}
