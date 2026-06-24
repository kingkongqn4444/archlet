import type { NodeType } from "@archlet/shared";

/**
 * Derives a capacity (req/s) for a node based on its type, variant, and config.
 * Never throws — returns 1000 as graceful default for unknown combos.
 */
export function getCapacity(
  type: NodeType,
  variant: string,
  config: Record<string, unknown>
): number {
  const n = (key: string, fallback = 0): number => {
    const v = config[key];
    return typeof v === "number" ? v : fallback;
  };

  try {
    switch (type) {
      case "user":
        // User nodes are sources, not capacity-limited
        return Infinity;

      case "api":
        switch (variant) {
          case "rest":       return n("instances", 2) * 200;
          case "graphql":    return n("instances", 2) * 120;
          case "grpc":       return n("instances", 2) * 500;
          case "websocket":  return n("maxConnections", 10000) / 60;
          case "api-gateway": return n("rateLimit", 5000);
          default:           return 1000;
        }

      case "database":
        switch (variant) {
          case "postgres":
          case "mysql":
            return n("connectionPool", 100) * 20;
          case "mongodb": {
            const pool = n("connectionPool", 100);
            return n("shards", 1) * pool * 25;
          }
          case "dynamodb":
            return config["billingMode"] === "provisioned"
              ? n("rcu", 5) + n("wcu", 5)
              : 40000;
          case "cassandra":
            return n("nodes", 3) * 1000;
          case "sqlite":
            return 200;
          default:
            return 1000;
        }

      case "cache":
        switch (variant) {
          case "redis":      return n("memoryGb", 1) * 50000;
          case "memcached":  return n("memoryMb", 512) * 30;
          case "keydb":      return n("memoryGb", 1) * 80000;
          case "valkey":     return n("memoryGb", 1) * 50000;
          default:           return 1000;
        }

      case "queue":
        switch (variant) {
          case "rabbitmq":      return n("queues", 5) * 5000;
          case "kafka":         return n("partitions", 12) * 10000;
          case "sqs":           return config["fifo"] === true ? 300 : 3000;
          case "redis-streams": return 8000;
          case "nats":          return n("replicas", 3) * 50000;
          default:              return 1000;
        }

      case "storage":
        switch (variant) {
          case "s3":
          case "r2":
          case "gcs":
          case "azure-blob":
            return 5500;
          case "local-disk":
            return 200;
          default:
            return 1000;
        }

      case "cdn":
        return 100000;

      case "load_balancer": {
        const instances = config["instances"];
        return typeof instances === "number" ? instances * 10000 : 20000;
      }

      case "worker":
        switch (variant) {
          case "nodejs":
          case "python":
          case "go":
          case "rust":
            return n("instances", 2) * 80;
          case "aws-lambda":
            return n("concurrency", 100);
          case "cloudflare-workers":
            return 100000;
          default:
            return 1000;
        }

      case "external":
        return n("rateLimit", 1000);

      default:
        return 1000;
    }
  } catch {
    return 1000;
  }
}
