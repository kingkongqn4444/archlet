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
    const nodeLabel = String(node.data.label ?? node.type);

    // R1: SPOF stateful — database/cache with no replicas
    if (node.type === "database") {
      if (variant === "mongodb") {
        const shards = num(config, "shards", 1);
        if (shards < 2) {
          findings.push({
            id: "R1-db-no-replicas",
            severity: "critical",
            category: "reliability",
            title: `${nodeLabel} has 1 shard — single point of failure`,
            description:
              `MongoDB "${nodeLabel}" runs on a single shard with no redundancy. If this node goes down, all dependent services lose data access immediately.`,
            nodeIds: [node.id],
            edgeIds: [],
            suggestion:
              "Increase shards to ≥2 and ensure replicaSet ≥3 for automatic failover and HA.",
            impact: -20,
          });
        }
      } else if (variant === "postgres" || variant === "mysql") {
        const replicas = num(config, "replicas", 1);
        const dbName = variant === "postgres" ? "PostgreSQL" : "MySQL";
        if (replicas < 2) {
          findings.push({
            id: "R1-db-no-replicas",
            severity: "critical",
            category: "reliability",
            title: `${nodeLabel} has ${replicas} replica — single point of failure`,
            description:
              `${dbName} "${nodeLabel}" has only ${replicas} replica. A single hardware or software failure causes full downtime with no automatic failover. Bumping to 2+ adds a hot standby that takes over in seconds.`,
            nodeIds: [node.id],
            edgeIds: [],
            suggestion:
              "Set replicas ≥ 2 and enable automatic failover (e.g. Patroni for PostgreSQL, MHA for MySQL).",
            impact: -20,
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
          title: `${nodeLabel} has ${replicas} replica — cache is a SPOF`,
          description:
            `Redis "${nodeLabel}" runs without adequate replicas. A crash evicts all ${replicas === 0 ? "cached" : `~${replicas}x cached`} data and the resulting cache stampede can overwhelm downstream databases.`,
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            "Use Redis Sentinel (≥2 replicas) or Redis Cluster for automatic failover and HA.",
          impact: -20,
        });
      }
    }

    // R2: Single API instance — no HA
    if (node.type === "api" && ["rest", "graphql", "grpc"].includes(variant)) {
      const instances = num(config, "instances", 2);
      if (instances < 2) {
        findings.push({
          id: "R2-api-single-instance",
          severity: "warning",
          category: "reliability",
          title: `${nodeLabel} runs ${instances} instance — no horizontal redundancy`,
          description:
            `A single ${nodeLabel} instance means any deployment or crash causes 100% downtime with no load distribution. Even a rolling restart requires at least 2 instances.`,
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            "Run ≥2 instances behind a load balancer to enable zero-downtime deploys and survive instance failures.",
          impact: -8,
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
          title: `${nodeLabel} persistence disabled — full data loss on restart`,
          description:
            `Redis "${nodeLabel}" has persistence set to "none". Any restart or crash wipes all cached data, likely causing a cache stampede that overloads downstream databases until the cache warms back up.`,
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            "Enable RDB snapshots (fast recovery) or AOF logging (minimal data loss) unless this cache is purely ephemeral.",
          impact: -3,
        });
      }
    }

    // R4: Database without backup mention
    if (node.type === "database") {
      const desc = String(node.data.description ?? "").toLowerCase();
      if (!desc.includes("backup")) {
        findings.push({
          id: "R4-db-no-backup",
          severity: "suggestion",
          category: "reliability",
          title: `No backup strategy documented for ${nodeLabel}`,
          description:
            `"${nodeLabel}" has no backup strategy in its description. Without documented backups, a data-corruption or accidental-deletion event can cause permanent data loss.`,
          nodeIds: [node.id],
          edgeIds: [],
          suggestion:
            'Add "backup" to the node description (e.g. "daily snapshots, 30-day retention, tested monthly") to document your recovery strategy.',
          impact: -3,
        });
      }
    }
  }

  return findings;
}
