import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding } from "../types";

function num(obj: Record<string, unknown>, key: string, fallback = 0): number {
  const v = obj[key];
  return typeof v === "number" ? v : fallback;
}

export function bestPracticeRules(nodes: RFNode[], edges: RFEdge[]): Finding[] {
  const findings: Finding[] = [];

  // B1: No observability — zero external/analytics nodes with outgoing edges
  const analyticsNodes = nodes.filter(
    (n) => n.type === "external" && (n.data.variant as string) === "analytics"
  );
  const hasObservability = analyticsNodes.some((n) =>
    edges.some((e) => e.source === n.id || e.target === n.id)
  );
  if (!hasObservability) {
    findings.push({
      id: "B1-no-observability",
      severity: "suggestion",
      category: "best-practice",
      title: "No observability / analytics node in design",
      description:
        "Production systems require metrics, logging, and tracing. Without an observability service you cannot detect incidents or debug performance issues.",
      nodeIds: [],
      edgeIds: [],
      suggestion:
        'Add an External node with variant "Analytics" (e.g., Datadog, Grafana, CloudWatch) and connect your services to it.',
    });
  }

  // B2: No rate limiting on high-traffic API gateway
  const gatewayNodes = nodes.filter(
    (n) => n.type === "api" && (n.data.variant as string) === "api-gateway"
  );
  for (const gw of gatewayNodes) {
    const config = (gw.data.config as Record<string, unknown>) ?? {};
    const rateLimit = num(config, "rateLimit", 5000);

    // Sum incoming user req/s
    const incomingUserRps = edges
      .filter((e) => e.target === gw.id)
      .reduce((sum, e) => {
        const src = nodes.find((n) => n.id === e.source);
        if (src?.type !== "user") return sum;
        const srcConfig = (src.data.config as Record<string, unknown>) ?? {};
        return sum + num(srcConfig, "reqPerSec", 100);
      }, 0);

    if (incomingUserRps > 1000 && rateLimit < 1000) {
      findings.push({
        id: "B2-no-rate-limit-gateway",
        severity: "warning",
        category: "best-practice",
        title: "High-traffic API Gateway missing adequate rate limiting",
        description: `The gateway receives ~${Math.round(incomingUserRps)} req/s from users but rate limit is set to ${rateLimit}. Without proper rate limiting, a traffic spike or abuse will overwhelm downstream services.`,
        nodeIds: [gw.id],
        edgeIds: [],
        suggestion:
          "Set rateLimit ≥ expected peak traffic and add burst handling (token bucket / leaky bucket).",
      });
    }
  }

  // B3: Worker nodes with no upstream queue
  const workerNodes = nodes.filter((n) => n.type === "worker");
  if (workerNodes.length > 0) {
    const queueIds = new Set(
      nodes.filter((n) => n.type === "queue").map((n) => n.id)
    );
    const workersWithNoQueue = workerNodes.filter((w) => {
      // Check if any upstream node (directly connected) is a queue
      const upstreamIds = edges
        .filter((e) => e.target === w.id)
        .map((e) => e.source);
      return !upstreamIds.some((id) => queueIds.has(id));
    });
    for (const worker of workersWithNoQueue) {
      findings.push({
        id: `B3-worker-no-queue-${worker.id}`,
        severity: "warning",
        category: "best-practice",
        title: `Worker "${String(worker.data.label ?? "Worker")}" has no upstream queue — synchronous coupling`,
        description:
          "Workers without a queue are tightly coupled to producers. Slow consumers will back-pressure all the way to the user and cause timeouts under load.",
        nodeIds: [worker.id],
        edgeIds: [],
        suggestion:
          "Add a Queue (Kafka, RabbitMQ, SQS) upstream of each worker to decouple production from consumption.",
      });
    }
  }

  // B4: No CDN for high user traffic (sum reqPerSec > 1000 and no cdn node)
  const cdnNodes = nodes.filter((n) => n.type === "cdn");
  const totalUserRps = nodes
    .filter((n) => n.type === "user")
    .reduce((sum, n) => {
      const config = (n.data.config as Record<string, unknown>) ?? {};
      return sum + num(config, "reqPerSec", 100);
    }, 0);

  if (totalUserRps > 1000 && cdnNodes.length === 0) {
    const userIds = nodes.filter((n) => n.type === "user").map((n) => n.id);
    findings.push({
      id: "B4-no-cdn-high-traffic",
      severity: "suggestion",
      category: "best-practice",
      title: "High user traffic with no CDN",
      description: `Total user traffic is ~${Math.round(totalUserRps)} req/s but there is no CDN. Static assets and cacheable responses will hit your origin servers on every request.`,
      nodeIds: userIds,
      edgeIds: [],
      suggestion:
        "Add a CDN (Cloudflare, CloudFront, Fastly) to offload static content and reduce origin load by 60-90%.",
    });
  }

  return findings;
}
