export type LineItem = { label: string; monthly: number };
export type CostEstimate = { monthly: number; lineItems: LineItem[] };

function sum(items: LineItem[]): CostEstimate {
  return { monthly: items.reduce((t, i) => t + i.monthly, 0), lineItems: items };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function estimateCost(type: string, variant: string, config: Record<string, any>): CostEstimate {
  const c = config ?? {};

  // ── database ────────────────────────────────────────────────────────────
  if (type === "database") {
    if (variant === "postgres" || variant === "mysql") {
      const base = 50;
      const storage = (Number(c.storageGb) || 20) * 0.115;
      const replicas = Number(c.replicas) || 1;
      const replicaCost = base * 0.2 * Math.max(0, replicas - 1);
      return sum([
        { label: "RDS instance (db.t3.medium)", monthly: base },
        { label: `Storage (${c.storageGb ?? 20} GB)`, monthly: storage },
        ...(replicaCost > 0 ? [{ label: `Read replicas (${replicas - 1}x)`, monthly: replicaCost }] : []),
      ]);
    }
    if (variant === "mongodb") {
      const shards = Number(c.shards) || 1;
      const storage = (Number(c.storageGb) || 10) * 0.1;
      return sum([
        { label: `MongoDB Atlas M30 (${shards} shard${shards > 1 ? "s" : ""})`, monthly: 200 * shards },
        { label: `Storage (${c.storageGb ?? 10} GB)`, monthly: storage },
      ]);
    }
    if (variant === "dynamodb") {
      const rcu = Number(c.rcu) || 100;
      const wcu = Number(c.wcu) || 100;
      if (c.billingMode === "ondemand") {
        return sum([
          { label: "DynamoDB on-demand reads (est. 1M/mo)", monthly: 1.25 },
          { label: "DynamoDB on-demand writes (est. 1M/mo)", monthly: 1.25 },
        ]);
      }
      return sum([
        { label: `Provisioned RCU (${rcu})`, monthly: rcu * 0.00065 * 720 },
        { label: `Provisioned WCU (${wcu})`, monthly: wcu * 0.00125 * 720 },
      ]);
    }
    if (variant === "cassandra") {
      const nodes = Number(c.nodes) || 3;
      const storage = (Number(c.storageGb) || 100) * 0.45;
      return sum([
        { label: `Keyspaces nodes (${nodes})`, monthly: nodes * 30 },
        { label: `Storage (${c.storageGb ?? 100} GB)`, monthly: storage },
      ]);
    }
    if (variant === "sqlite") {
      return sum([{ label: "SQLite (local file)", monthly: 0 }]);
    }
    // fallback generic DB
    return sum([{ label: "Database instance", monthly: 50 }]);
  }

  // ── cache ────────────────────────────────────────────────────────────────
  if (type === "cache") {
    if (variant === "redis" || variant === "valkey") {
      const replicas = Math.max(1, Number(c.replicas) || 1);
      return sum([
        { label: `ElastiCache cache.r6g.large (${replicas}x)`, monthly: 110 * replicas },
      ]);
    }
    if (variant === "memcached") {
      return sum([{ label: "ElastiCache m6g.large", monthly: 90 }]);
    }
    if (variant === "keydb") {
      const instances = Math.max(1, Number(c.instances) || 1);
      return sum([{ label: `EC2 r6i.large (${instances}x)`, monthly: 90 * instances }]);
    }
    return sum([{ label: "Cache instance", monthly: 110 }]);
  }

  // ── queue ────────────────────────────────────────────────────────────────
  if (type === "queue") {
    if (variant === "rabbitmq") {
      return sum([{ label: "Amazon MQ mq.t3.micro", monthly: 25 }]);
    }
    if (variant === "kafka") {
      const brokers = 3;
      return sum([
        { label: `MSK kafka.m7g.large (${brokers} brokers)`, monthly: 160 * brokers },
      ]);
    }
    if (variant === "sqs") {
      return sum([{ label: "SQS (est. 10M requests/mo)", monthly: 4 }]);
    }
    if (variant === "redis-streams") {
      return sum([{ label: "ElastiCache for Redis Streams", monthly: 110 }]);
    }
    if (variant === "nats") {
      const replicas = Math.max(1, Number(c.replicas) || 1);
      return sum([{ label: `EC2 t3.medium NATS (${replicas}x)`, monthly: 30 * replicas }]);
    }
    return sum([{ label: "Queue service", monthly: 25 }]);
  }

  // ── storage ──────────────────────────────────────────────────────────────
  if (type === "storage") {
    if (variant === "s3") {
      return sum([
        { label: "S3 storage (100 GB)", monthly: 100 * 0.023 },
        { label: "S3 requests (10M)", monthly: 10 * 0.4 },
      ]);
    }
    if (variant === "r2") {
      return sum([
        { label: "R2 storage (100 GB)", monthly: 100 * 0.015 },
        { label: "R2 egress (free)", monthly: 0 },
      ]);
    }
    if (variant === "gcs" || variant === "azure-blob") {
      return sum([
        { label: `${variant === "gcs" ? "GCS" : "Azure Blob"} storage (100 GB)`, monthly: 100 * 0.023 },
        { label: "Requests (10M)", monthly: 4 },
      ]);
    }
    if (variant === "local-disk") {
      return sum([{ label: "EBS gp3 (100 GB)", monthly: 10 }]);
    }
    return sum([{ label: "Object storage", monthly: 5 }]);
  }

  // ── cdn ──────────────────────────────────────────────────────────────────
  if (type === "cdn") {
    if (variant === "cloudflare") {
      return sum([{ label: "Cloudflare Pro plan", monthly: 20 }]);
    }
    if (variant === "cloudfront") {
      return sum([
        { label: "CloudFront transfer (1 TB)", monthly: 1024 * 0.085 },
        { label: "CloudFront requests (10M)", monthly: 75 },
      ]);
    }
    if (variant === "fastly") {
      return sum([{ label: "Fastly base plan", monthly: 50 }]);
    }
    if (variant === "akamai") {
      return sum([{ label: "Akamai (contact sales — est.)", monthly: 500 }]);
    }
    return sum([{ label: "CDN service", monthly: 20 }]);
  }

  // ── load balancer ─────────────────────────────────────────────────────────
  if (type === "load_balancer") {
    if (variant === "aws-alb") {
      return sum([
        { label: "ALB base", monthly: 22 },
        { label: "LCU-hours (est.)", monthly: 0.008 * 720 },
      ]);
    }
    if (variant === "cloudflare-lb") {
      return sum([
        { label: "Cloudflare LB base", monthly: 5 },
        { label: "Requests (2M)", monthly: 1 },
      ]);
    }
    if (variant === "nginx" || variant === "haproxy" || variant === "envoy") {
      const instances = Math.max(1, Number(c.instances) || 1);
      return sum([
        { label: `EC2 t3.medium ${variant} (${instances}x)`, monthly: 30 * instances },
      ]);
    }
    return sum([{ label: "Load balancer", monthly: 22 }]);
  }

  // ── worker ────────────────────────────────────────────────────────────────
  if (type === "worker") {
    if (variant === "aws-lambda") {
      const memGb = (Number(c.memoryMb) || 512) / 1024;
      const durationSec = Number(c.timeoutSec) || 1;
      const invocations = 1_000_000;
      const gbSeconds = memGb * durationSec * invocations;
      return sum([
        { label: "Lambda compute (1M invocations)", monthly: gbSeconds * 0.0000166667 },
        { label: "Lambda requests", monthly: 0.2 },
      ]);
    }
    if (variant === "cloudflare-workers") {
      return sum([{ label: "Cloudflare Workers Paid", monthly: 5 }]);
    }
    // nodejs, python, go, rust, etc.
    const instances = Math.max(1, Number(c.instances) || 1);
    return sum([
      { label: `EC2 t3.medium ${variant ?? "worker"} (${instances}x)`, monthly: 30 * instances },
    ]);
  }

  // ── api ───────────────────────────────────────────────────────────────────
  if (type === "api") {
    if (variant === "api-gateway") {
      return sum([
        { label: "API Gateway REST (5M requests)", monthly: 17.5 },
        { label: "API Gateway HTTP (5M requests)", monthly: 5 },
      ]);
    }
    const instances = Math.max(1, Number(c.instances) || 1);
    return sum([
      { label: `EC2 t3.medium ${variant ?? "api"} (${instances}x)`, monthly: 30 * instances },
    ]);
  }

  // ── user (clients — free) ─────────────────────────────────────────────────
  if (type === "user") {
    return sum([{ label: "Client (no server cost)", monthly: 0 }]);
  }

  // ── external ──────────────────────────────────────────────────────────────
  if (type === "external") {
    if (variant === "payment-api") {
      return sum([{ label: "Payment processing (Stripe est.)", monthly: 200 }]);
    }
    if (variant === "email-service") {
      return sum([{ label: "Email service (est. 50k/mo)", monthly: 20 }]);
    }
    if (variant === "ai-provider") {
      return sum([{ label: "AI provider (BYOK — variable)", monthly: 0 }]);
    }
    if (variant === "oauth-provider") {
      return sum([{ label: "OAuth provider (free tier)", monthly: 0 }]);
    }
    if (variant === "analytics") {
      return sum([{ label: "Analytics (free tier)", monthly: 0 }]);
    }
    return sum([{ label: "External service (est.)", monthly: 0 }]);
  }

  return sum([{ label: `${type}/${variant}`, monthly: 0 }]);
}
