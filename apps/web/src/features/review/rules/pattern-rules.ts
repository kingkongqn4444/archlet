import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding } from "../types";

function num(obj: Record<string, unknown>, key: string, fallback = 0): number {
  const v = obj[key];
  return typeof v === "number" ? v : fallback;
}

export function patternRules(nodes: RFNode[], edges: RFEdge[]): Finding[] {
  const findings: Finding[] = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const apiNodes = nodes.filter((n) => n.type === "api");
  const cacheNodes = nodes.filter((n) => n.type === "cache");
  const dbNodes = nodes.filter((n) => n.type === "database");
  const queueNodes = nodes.filter((n) => n.type === "queue");
  const workerNodes = nodes.filter((n) => n.type === "worker");
  const cdnNodes = nodes.filter((n) => n.type === "cdn");
  const userNodes = nodes.filter((n) => n.type === "user");
  const storageNodes = nodes.filter((n) => n.type === "storage");
  const externalNodes = nodes.filter((n) => n.type === "external");

  // GD1: Cache-aside detected — API → Cache → DB triangle
  if (cacheNodes.length > 0 && apiNodes.length > 0 && dbNodes.length > 0) {
    for (const cache of cacheNodes) {
      const hasApiToCache = edges.some(
        (e) => e.target === cache.id && byId.get(e.source)?.type === "api"
      );
      const hasCacheToDb = edges.some(
        (e) => e.source === cache.id && byId.get(e.target)?.type === "database"
      );
      if (hasApiToCache && hasCacheToDb) {
        const affectedApi = edges
          .filter((e) => e.target === cache.id && byId.get(e.source)?.type === "api")
          .map((e) => e.source);
        const affectedDb = edges
          .filter((e) => e.source === cache.id && byId.get(e.target)?.type === "database")
          .map((e) => e.target);
        findings.push({
          id: "GD1-cache-aside",
          severity: "good",
          category: "patterns",
          title: "Cache-aside pattern detected",
          description:
            "API → Cache → Database triangle is correctly wired. Cache-aside reduces database load and improves read latency significantly.",
          nodeIds: [...affectedApi, cache.id, ...affectedDb],
          edgeIds: [],
          impact: 5,
        });
        break;
      }
    }
  }

  // GD2: Microservices pattern — ≥3 distinct API nodes with separate DB connections
  if (apiNodes.length >= 3) {
    const apisWithOwnDb = apiNodes.filter((api) => {
      const connectedDbIds = edges
        .filter((e) => e.source === api.id && byId.get(e.target)?.type === "database")
        .map((e) => e.target);
      return connectedDbIds.length > 0;
    });
    if (apisWithOwnDb.length >= 3) {
      findings.push({
        id: "GD2-microservices-pattern",
        severity: "good",
        category: "patterns",
        title: "Microservices pattern detected",
        description: `${apisWithOwnDb.length} API services each own their database — database-per-service isolation avoids tight coupling and schema lock-in.`,
        nodeIds: apisWithOwnDb.map((n) => n.id),
        edgeIds: [],
        impact: 5,
      });
    }
  }

  // GD3: Async via queue — Queue between API and Worker
  if (queueNodes.length > 0 && workerNodes.length > 0 && apiNodes.length > 0) {
    for (const queue of queueNodes) {
      const hasApiToQueue = edges.some(
        (e) => e.target === queue.id && byId.get(e.source)?.type === "api"
      );
      const hasQueueToWorker = edges.some(
        (e) => e.source === queue.id && byId.get(e.target)?.type === "worker"
      );
      if (hasApiToQueue && hasQueueToWorker) {
        findings.push({
          id: "GD3-async-queue",
          severity: "good",
          category: "patterns",
          title: "Async processing via queue detected",
          description:
            "API publishes to a queue consumed by workers — decoupled async processing prevents back-pressure from reaching users and enables independent scaling.",
          nodeIds: [queue.id],
          edgeIds: [],
          impact: 5,
        });
        break;
      }
    }
  }

  // GD4: Read replicas — DB with replicas ≥ 2
  for (const db of dbNodes) {
    const config = (db.data.config as Record<string, unknown>) ?? {};
    const variant = (db.data.variant as string) ?? "";
    if (variant === "mongodb") {
      const replicaSet = num(config, "replicaSet", 3);
      if (replicaSet >= 2) {
        findings.push({
          id: `GD4-read-replicas-${db.id}`,
          severity: "good",
          category: "patterns",
          title: `${String(db.data.label ?? "MongoDB")} has ${replicaSet}-node replica set`,
          description:
            "MongoDB replica set provides automatic failover and read distribution — reads can be spread across secondaries to reduce primary load.",
          nodeIds: [db.id],
          edgeIds: [],
          impact: 5,
        });
      }
    } else if (variant === "postgres" || variant === "mysql") {
      const replicas = num(config, "replicas", 1);
      if (replicas >= 2) {
        findings.push({
          id: `GD4-read-replicas-${db.id}`,
          severity: "good",
          category: "patterns",
          title: `${String(db.data.label ?? variant)} has ${replicas} read replicas`,
          description:
            `${replicas} replicas enable read distribution and automatic failover — adding a standby cuts RTO from hours to seconds.`,
          nodeIds: [db.id],
          edgeIds: [],
          impact: 5,
        });
      }
    }
  }

  // GD5: CDN for static — CDN node connected from User
  if (cdnNodes.length > 0 && userNodes.length > 0) {
    const cdnConnectedFromUser = cdnNodes.some((cdn) =>
      edges.some(
        (e) => e.target === cdn.id && byId.get(e.source)?.type === "user"
      )
    );
    if (cdnConnectedFromUser) {
      findings.push({
        id: "GD5-cdn-for-static",
        severity: "good",
        category: "patterns",
        title: "CDN in front of user traffic",
        description:
          "Users route through a CDN, offloading static assets and cacheable responses. This reduces origin load and improves global latency.",
        nodeIds: cdnNodes.map((n) => n.id),
        edgeIds: [],
        impact: 5,
      });
    }
  }

  // GD6: Rate limiting present — api-gateway variant with rateLimit > 0
  const gatewayNodes = apiNodes.filter(
    (n) => (n.data.variant as string) === "api-gateway"
  );
  for (const gw of gatewayNodes) {
    const config = (gw.data.config as Record<string, unknown>) ?? {};
    const rateLimit = num(config, "rateLimit", 0);
    if (rateLimit > 0) {
      findings.push({
        id: `GD6-rate-limiting-${gw.id}`,
        severity: "good",
        category: "patterns",
        title: `Rate limiting active on ${String(gw.data.label ?? "API Gateway")} (${rateLimit} req/s)`,
        description:
          "API Gateway enforces rate limiting — protects downstream services from traffic bursts, abuse, and denial-of-service scenarios.",
        nodeIds: [gw.id],
        edgeIds: [],
        impact: 5,
      });
      break;
    }
  }

  // GD7: Multi-region storage — 2+ storage nodes in different regions
  if (storageNodes.length >= 2) {
    const regions = new Set(
      storageNodes
        .map((n) => {
          const cfg = (n.data.config as Record<string, unknown>) ?? {};
          return typeof cfg["region"] === "string" ? cfg["region"] : null;
        })
        .filter(Boolean)
    );
    if (regions.size >= 2) {
      findings.push({
        id: "GD7-multi-region-storage",
        severity: "good",
        category: "patterns",
        title: `Multi-region storage across ${regions.size} regions`,
        description:
          `Storage spans ${[...regions].join(", ")} — geo-redundancy reduces data-loss risk and serves users from nearby regions with lower latency.`,
        nodeIds: storageNodes.map((n) => n.id),
        edgeIds: [],
        impact: 5,
      });
    }
  }

  // GD8: Observability present — external/analytics node connected
  const analyticsNodes = externalNodes.filter(
    (n) => (n.data.variant as string) === "analytics"
  );
  const hasObservability = analyticsNodes.some((n) =>
    edges.some((e) => e.source === n.id || e.target === n.id)
  );
  if (hasObservability) {
    findings.push({
      id: "GD8-observability-present",
      severity: "good",
      category: "patterns",
      title: "Observability / analytics connected",
      description:
        "An analytics or monitoring service is integrated — you can detect incidents, track SLOs, and debug performance issues in production.",
      nodeIds: analyticsNodes.map((n) => n.id),
      edgeIds: [],
      impact: 5,
    });
  }

  return findings;
}
