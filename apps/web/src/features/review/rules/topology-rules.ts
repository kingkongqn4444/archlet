import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding } from "../types";

export function topologyRules(nodes: RFNode[], edges: RFEdge[]): Finding[] {
  const findings: Finding[] = [];

  const byId = new Map(nodes.map((n) => [n.id, n]));

  // T1: User → DB direct (skip API layer)
  for (const edge of edges) {
    const src = byId.get(edge.source);
    const tgt = byId.get(edge.target);
    if (src?.type === "user" && tgt?.type === "database") {
      findings.push({
        id: "T1-user-to-db-direct",
        severity: "critical",
        category: "topology",
        title: "User connects directly to database — no API layer",
        description:
          "Clients should never talk directly to a database. This exposes credentials, bypasses business logic, and makes the DB a public attack surface.",
        nodeIds: [edge.source, edge.target],
        edgeIds: [edge.id],
        suggestion:
          "Insert an API layer (REST, GraphQL, or gRPC) between the user and the database.",
      });
    }
  }

  // T2: Multiple API nodes sharing a User source, but no load balancer between them
  const userNodes = nodes.filter((n) => n.type === "user");
  const lbNodes = nodes.filter((n) => n.type === "load_balancer");

  for (const userNode of userNodes) {
    const apiTargets = edges
      .filter((e) => e.source === userNode.id)
      .map((e) => byId.get(e.target))
      .filter((n) => n?.type === "api");

    if (apiTargets.length >= 2 && lbNodes.length === 0) {
      findings.push({
        id: "T2-multi-api-no-lb",
        severity: "warning",
        category: "topology",
        title: "Multiple APIs serving the same user — no load balancer",
        description:
          "Users pointing to multiple API nodes directly means clients must implement their own routing. A load balancer centralises traffic distribution and health checks.",
        nodeIds: [userNode.id, ...apiTargets.map((n) => n!.id)],
        edgeIds: [],
        suggestion:
          "Add a load balancer node between the User and the API instances.",
      });
    }
  }

  // T3: Edge from database → user (wrong direction)
  for (const edge of edges) {
    const src = byId.get(edge.source);
    const tgt = byId.get(edge.target);
    if (src?.type === "database" && tgt?.type === "user") {
      findings.push({
        id: "T3-db-to-user-wrong-direction",
        severity: "critical",
        category: "topology",
        title: "Database points to User — invalid data flow direction",
        description:
          "Databases do not push data to users. This edge implies a reversed data-flow that is architecturally incorrect.",
        nodeIds: [edge.source, edge.target],
        edgeIds: [edge.id],
        suggestion:
          "Reverse the edge so User → API → Database, or remove it if unintended.",
      });
    }
  }

  // T4: Cache exists but not on any api → cache → database path
  const cacheNodes = nodes.filter((n) => n.type === "cache");
  if (cacheNodes.length > 0) {
    for (const cacheNode of cacheNodes) {
      const hasApiIncoming = edges.some(
        (e) => e.target === cacheNode.id && byId.get(e.source)?.type === "api"
      );
      const hasDbOutgoing = edges.some(
        (e) =>
          e.source === cacheNode.id &&
          byId.get(e.target)?.type === "database"
      );
      if (!hasApiIncoming || !hasDbOutgoing) {
        findings.push({
          id: "T4-broken-cache-pattern",
          severity: "suggestion",
          category: "topology",
          title: "Cache not wired in cache-aside pattern",
          description:
            "Cache exists but is not connected in the standard API → Cache → Database path. The cache may not be reducing database load effectively.",
          nodeIds: [cacheNode.id],
          edgeIds: [],
          suggestion:
            "Connect: API → Cache (read/write) and Cache → Database (on miss) to implement cache-aside.",
        });
      }
    }
  }

  return findings;
}
