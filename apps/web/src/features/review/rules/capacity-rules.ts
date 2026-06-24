import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding } from "../types";
import { getCapacity } from "@/features/simulate/capacity";
import type { NodeType } from "@archlet/shared";

function num(obj: Record<string, unknown>, key: string, fallback = 0): number {
  const v = obj[key];
  return typeof v === "number" ? v : fallback;
}

function str(obj: Record<string, unknown>, key: string, fallback = ""): string {
  const v = obj[key];
  return typeof v === "string" ? v : fallback;
}

export function capacityRules(nodes: RFNode[], _edges: RFEdge[]): Finding[] {
  const findings: Finding[] = [];

  // C1: Aggregate user demand > total API capacity
  const userNodes = nodes.filter((n) => n.type === "user");
  const apiNodes = nodes.filter(
    (n) =>
      n.type === "api" &&
      ["rest", "graphql", "grpc"].includes((n.data.variant as string) ?? "")
  );

  if (userNodes.length > 0 && apiNodes.length > 0) {
    const totalUserRps = userNodes.reduce((sum, n) => {
      const cfg = (n.data.config as Record<string, unknown>) ?? {};
      return sum + num(cfg, "reqPerSec", 100);
    }, 0);

    const totalApiCap = apiNodes.reduce((sum, n) => {
      const type = n.type as NodeType;
      const variant = (n.data.variant as string) ?? "";
      const config = (n.data.config as Record<string, unknown>) ?? {};
      return sum + getCapacity(type, variant, config);
    }, 0);

    if (totalUserRps > totalApiCap) {
      findings.push({
        id: "C1-user-demand-exceeds-api-capacity",
        severity: "critical",
        category: "capacity",
        title: `User demand (${Math.round(totalUserRps)} req/s) exceeds total API capacity (${Math.round(totalApiCap)} req/s)`,
        description:
          "Your API tier cannot serve all incoming user traffic. Requests will be dropped or queued, causing degraded user experience.",
        nodeIds: [
          ...userNodes.map((n) => n.id),
          ...apiNodes.map((n) => n.id),
        ],
        edgeIds: [],
        suggestion:
          "Increase API instance count or add more API nodes to match user demand.",
      });
    }
  }

  // C2: DB connection pool too low vs API instances
  const dbNodes = nodes.filter(
    (n) =>
      n.type === "database" &&
      ["postgres", "mysql"].includes((n.data.variant as string) ?? "")
  );

  const totalApiInstances = apiNodes.reduce((sum, n) => {
    const cfg = (n.data.config as Record<string, unknown>) ?? {};
    return sum + num(cfg, "instances", 2);
  }, 0);

  for (const db of dbNodes) {
    const cfg = (db.data.config as Record<string, unknown>) ?? {};
    const pool = num(cfg, "connectionPool", 100);
    const minRequired = totalApiInstances * 5;
    if (totalApiInstances > 0 && pool < minRequired) {
      findings.push({
        id: `C2-db-pool-too-low-${db.id}`,
        severity: "warning",
        category: "capacity",
        title: `${String(db.data.label ?? "Database")} connection pool (${pool}) too small for ${totalApiInstances} API instances`,
        description: `With ${totalApiInstances} API instances each needing ~5 connections, you need at least ${minRequired} connections. Current pool of ${pool} will cause connection exhaustion under load.`,
        nodeIds: [db.id, ...apiNodes.map((n) => n.id)],
        edgeIds: [],
        suggestion: `Increase connectionPool to at least ${minRequired} (${totalApiInstances} instances × 5).`,
      });
    }
  }

  // C3: Cache too small — memoryGb < database storageGb * 0.05
  const cacheNodes = nodes.filter((n) => n.type === "cache");
  for (const cacheNode of cacheNodes) {
    const cacheCfg = (cacheNode.data.config as Record<string, unknown>) ?? {};
    const memGb = num(cacheCfg, "memoryGb", 1);

    for (const db of dbNodes) {
      const dbCfg = (db.data.config as Record<string, unknown>) ?? {};
      const storageGb = num(dbCfg, "storageGb", 50);
      const minCacheGb = storageGb * 0.05;

      if (memGb < minCacheGb) {
        findings.push({
          id: `C3-cache-too-small-${cacheNode.id}`,
          severity: "suggestion",
          category: "capacity",
          title: `Cache memory (${memGb}GB) is less than 5% of database storage (${storageGb}GB)`,
          description:
            "A cache smaller than 5% of the working dataset will have a very low hit rate. Most requests will miss the cache and hit the database.",
          nodeIds: [cacheNode.id, db.id],
          edgeIds: [],
          suggestion: `Increase cache memory to at least ${minCacheGb.toFixed(1)}GB to achieve a meaningful hit rate.`,
        });
      }
    }
  }

  // C4: Storage region mismatch with database
  const storageNodes = nodes.filter((n) => n.type === "storage");
  for (const storageNode of storageNodes) {
    const sCfg = (storageNode.data.config as Record<string, unknown>) ?? {};
    const storageRegion = str(sCfg, "region", "");
    if (!storageRegion) continue;

    for (const db of dbNodes) {
      const dCfg = (db.data.config as Record<string, unknown>) ?? {};
      const dbRegion = str(dCfg, "region", "");
      if (!dbRegion) continue;

      if (storageRegion !== dbRegion) {
        findings.push({
          id: `C4-region-mismatch-${storageNode.id}-${db.id}`,
          severity: "warning",
          category: "capacity",
          title: `Storage (${storageRegion}) and Database (${dbRegion}) are in different regions`,
          description:
            "Cross-region data transfer adds 50-200ms latency per request and incurs significant egress costs. Storing data close to where it is processed is a fundamental performance principle.",
          nodeIds: [storageNode.id, db.id],
          edgeIds: [],
          suggestion: `Move storage to region "${dbRegion}" to co-locate with the database and eliminate cross-region latency.`,
        });
      }
    }
  }

  return findings;
}
