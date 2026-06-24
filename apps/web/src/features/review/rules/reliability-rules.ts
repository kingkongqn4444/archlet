import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { Finding } from "../types";

function num(obj: Record<string, unknown>, key: string, fallback = 0): number {
  const v = obj[key];
  return typeof v === "number" ? v : fallback;
}

export function reliabilityRules(nodes: RFNode[], _edges: RFEdge[]): Finding[] {
  const findings: Finding[] = [];

  for (const node of nodes) {
    const config = (node.data.config as Record<string, unknown>) ?? {};
    const variant = (node.data.variant as string) ?? "";

    // R1: SPOF stateful — database/cache with no replicas
    if (node.type === "database") {
      const isMongo = variant === "mongodb";
      if (isMongo) {
        const shards = num(config, "shards", 1);
        if (shards < 2) {
          findings.push({
            id: "R1-db-no-replicas",
            severity: "critical",
            category: "reliability",
            title: "MongoDB single shard — SPOF",
            description:
              "A single MongoDB shard is a single point of failure. If this node goes down, all dependent services lose data access.",
            nodeIds: [node.id],
            edgeIds: [],
            suggestion:
              "Increase shards to ≥2 and ensure replicaSet ≥3 for HA.",
          });
        }
      } else if (variant === "postgres" || variant === "mysql") {
        const replicas = num(config, "replicas", 1);
        if (replicas < 2) {
          findings.push({
            id: "R1-db-no-replicas",
            severity: "critical",
            category: "reliability",
            title: `${variant === "postgres" ? "PostgreSQL" : "MySQL"} has < 2 replicas — SPOF`,
            description:
              "Databases with fewer than 2 replicas have no standby. A single failure causes downtime and potential data loss.",
            nodeIds: [node.id],
            edgeIds: [],
            suggestion:
              "Add at least one read replica and enable automatic failover.",
          });
        }
      }
    }

    if (node.type === "cache" && variant === "redis") {
      const replicas = num(config, "replicas", 1);
      if (replicas < 2) {
        findings.push({
          id: "R1-cache-no-replicas",
          severity: "critical",
          category: "reliability",
          title: "Redis has < 2 replicas — SPOF",
          description:
            "A standalone Redis instance is a single point of failure. Failure evicts all cached data and can cascade to downstream services.",
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            "Use Redis Sentinel or Cluster with ≥2 replicas for high availability.",
        });
      }
    }

    // R2: Single API instance — no HA
    if (node.type === "api" && (variant === "rest" || variant === "graphql" || variant === "grpc")) {
      const instances = num(config, "instances", 2);
      if (instances < 2) {
        findings.push({
          id: "R2-api-single-instance",
          severity: "warning",
          category: "reliability",
          title: "API has only 1 instance — no horizontal redundancy",
          description:
            "Running a single API instance means a deployment or crash causes 100% downtime. There is no load distribution.",
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            "Run ≥2 instances behind a load balancer for zero-downtime deploys.",
        });
      }
    }

    // R3: Redis no persistence
    if (node.type === "cache" && variant === "redis") {
      const persistence = config["persistence"];
      if (persistence === "none") {
        findings.push({
          id: "R3-cache-no-persistence",
          severity: "suggestion",
          category: "reliability",
          title: "Redis persistence disabled — data lost on restart",
          description:
            "With persistence set to 'none', a Redis restart wipes all cached data. This can cause a cache stampede and overload downstream databases.",
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            "Enable RDB snapshots or AOF logging unless this is purely ephemeral session cache.",
        });
      }
    }

    // R4: Database without backup mention in description
    if (node.type === "database") {
      const desc = String(node.data.description ?? "").toLowerCase();
      if (!desc.includes("backup")) {
        findings.push({
          id: "R4-db-no-backup",
          severity: "suggestion",
          category: "reliability",
          title: "No backup strategy mentioned for database",
          description:
            "Databases without documented backup procedures risk permanent data loss. Backups are a fundamental reliability requirement.",
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            'Add "backup" to the node description (e.g., "daily backup, 30d retention") to document your backup strategy.',
        });
      }
    }
  }

  return findings;
}
