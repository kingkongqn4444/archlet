import type { DiagramNode, DiagramEdge } from "./diagram";

export type PatternCategory =
  | "caching"
  | "resilience"
  | "data"
  | "messaging"
  | "microservices"
  | "scaling";

export type PatternDifficulty = "intro" | "common" | "advanced";

export type Pattern = {
  id: string;
  name: string;
  description: string;
  category: PatternCategory;
  difficulty: PatternDifficulty;
  tags: string[];
  whenToUse: string;
  tradeoffs: string;
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function n(
  id: string,
  type: DiagramNode["type"],
  label: string,
  x: number,
  y: number,
  variant?: string
): DiagramNode {
  return { id, type, position: { x, y }, data: { label, ...(variant ? { variant } : {}) } };
}

function e(id: string, source: string, target: string, label?: string): DiagramEdge {
  return { id, source, target, ...(label ? { data: { label } } : {}) };
}

// ---------------------------------------------------------------------------
// Pattern definitions
// ---------------------------------------------------------------------------

const cacheAside: Pattern = {
  id: "cache-aside",
  name: "Cache-Aside",
  description: "App checks cache first; on miss reads from DB and writes back to cache.",
  category: "caching",
  difficulty: "intro",
  tags: ["redis", "read-heavy", "lazy-loading"],
  whenToUse: "When reads vastly outnumber writes and stale data is acceptable for a short window.",
  tradeoffs: "First-request latency (cache miss penalty); cache invalidation complexity.",
  diagram: {
    nodes: [
      n("ca-user", "user", "Client", 0, 80),
      n("ca-api", "api", "App Service", 200, 80),
      n("ca-cache", "cache", "Redis Cache", 400, 0, "redis"),
      n("ca-db", "database", "Database", 400, 160, "postgres"),
    ],
    edges: [
      e("ca-e1", "ca-user", "ca-api", "request"),
      e("ca-e2", "ca-api", "ca-cache", "cache check"),
      e("ca-e3", "ca-api", "ca-db", "on miss"),
      e("ca-e4", "ca-db", "ca-cache", "write back"),
    ],
  },
};

const readThrough: Pattern = {
  id: "read-through",
  name: "Read-Through Cache",
  description: "Cache sits in front of DB and auto-populates on miss transparently.",
  category: "caching",
  difficulty: "intro",
  tags: ["redis", "transparent-caching"],
  whenToUse: "When you want cache management logic out of application code.",
  tradeoffs: "Cache layer must support read-through; all reads go through cache even cold ones.",
  diagram: {
    nodes: [
      n("rt-api", "api", "App Service", 0, 80),
      n("rt-cache", "cache", "Cache (read-through)", 220, 80, "redis"),
      n("rt-db", "database", "Primary DB", 440, 80, "postgres"),
    ],
    edges: [
      e("rt-e1", "rt-api", "rt-cache", "read"),
      e("rt-e2", "rt-cache", "rt-db", "auto-load on miss"),
    ],
  },
};

const writeThrough: Pattern = {
  id: "write-through",
  name: "Write-Through Cache",
  description: "Every write goes to cache AND DB synchronously — cache always consistent.",
  category: "caching",
  difficulty: "common",
  tags: ["redis", "write-consistency"],
  whenToUse: "When read-after-write consistency is critical and write latency is acceptable.",
  tradeoffs: "Higher write latency; writes wasted for data never re-read.",
  diagram: {
    nodes: [
      n("wt-api", "api", "App Service", 0, 80),
      n("wt-cache", "cache", "Redis Cache", 220, 0, "redis"),
      n("wt-db", "database", "Primary DB", 440, 80, "postgres"),
    ],
    edges: [
      e("wt-e1", "wt-api", "wt-cache", "write"),
      e("wt-e2", "wt-cache", "wt-db", "sync write"),
      e("wt-e3", "wt-api", "wt-db", "write"),
    ],
  },
};

const circuitBreaker: Pattern = {
  id: "circuit-breaker",
  name: "Circuit Breaker",
  description: "Wraps calls to external service; opens circuit on repeated failures to stop cascade.",
  category: "resilience",
  difficulty: "common",
  tags: ["fault-tolerance", "hystrix", "resilience4j"],
  whenToUse: "When calling unreliable external services that can cascade failures inward.",
  tradeoffs: "Adds latency per call; fallback logic must be implemented by the app.",
  diagram: {
    nodes: [
      n("cb-api", "api", "API Service", 0, 80),
      n("cb-cb", "api", "Circuit Breaker", 200, 80),
      n("cb-ext", "external", "External Service", 400, 0),
      n("cb-fb", "cache", "Fallback Cache", 400, 160, "redis"),
    ],
    edges: [
      e("cb-e1", "cb-api", "cb-cb", "call"),
      e("cb-e2", "cb-cb", "cb-ext", "closed"),
      e("cb-e3", "cb-cb", "cb-fb", "open → fallback"),
    ],
  },
};

const bulkhead: Pattern = {
  id: "bulkhead",
  name: "Bulkhead",
  description: "Isolates worker pools per service to prevent one slow consumer from exhausting shared resources.",
  category: "resilience",
  difficulty: "common",
  tags: ["isolation", "fault-tolerance"],
  whenToUse: "When multiple services share infrastructure and you need blast-radius containment.",
  tradeoffs: "Higher resource overhead; operational complexity of managing pool sizes.",
  diagram: {
    nodes: [
      n("bh-lb", "load_balancer", "Load Balancer", 0, 100),
      n("bh-pool1", "worker", "Worker Pool A", 200, 0),
      n("bh-pool2", "worker", "Worker Pool B", 200, 100),
      n("bh-pool3", "worker", "Worker Pool C", 200, 200),
      n("bh-db", "database", "Database", 400, 100, "postgres"),
    ],
    edges: [
      e("bh-e1", "bh-lb", "bh-pool1"),
      e("bh-e2", "bh-lb", "bh-pool2"),
      e("bh-e3", "bh-lb", "bh-pool3"),
      e("bh-e4", "bh-pool1", "bh-db"),
      e("bh-e5", "bh-pool2", "bh-db"),
      e("bh-e6", "bh-pool3", "bh-db"),
    ],
  },
};

const rateLimiter: Pattern = {
  id: "rate-limiter",
  name: "Rate Limiter",
  description: "API Gateway enforces request rate limits using a Redis token-bucket counter.",
  category: "resilience",
  difficulty: "intro",
  tags: ["throttling", "api-gateway", "redis"],
  whenToUse: "When you need to protect backend services from traffic spikes or abusive clients.",
  tradeoffs: "Legitimate traffic may be rejected during bursts; requires distributed state for multi-instance.",
  diagram: {
    nodes: [
      n("rl-user", "user", "Client", 0, 80),
      n("rl-gw", "api", "API Gateway", 200, 80, "api-gateway"),
      n("rl-redis", "cache", "Redis Token Bucket", 400, 0, "redis"),
      n("rl-svc", "api", "Backend Service", 400, 160),
    ],
    edges: [
      e("rl-e1", "rl-user", "rl-gw", "request"),
      e("rl-e2", "rl-gw", "rl-redis", "check quota"),
      e("rl-e3", "rl-gw", "rl-svc", "allowed"),
    ],
  },
};

const sharding: Pattern = {
  id: "sharding",
  name: "Database Sharding",
  description: "Routes writes/reads to one of N DB shards based on a shard key.",
  category: "data",
  difficulty: "advanced",
  tags: ["horizontal-scaling", "partition", "hash-sharding"],
  whenToUse: "When a single DB can't handle data volume or write throughput at scale.",
  tradeoffs: "Cross-shard queries are expensive; resharding is operationally painful.",
  diagram: {
    nodes: [
      n("sh-api", "api", "App Service", 0, 120),
      n("sh-router", "load_balancer", "Shard Router", 200, 120),
      n("sh-db1", "database", "Shard 0", 400, 0, "postgres"),
      n("sh-db2", "database", "Shard 1", 400, 120, "postgres"),
      n("sh-db3", "database", "Shard 2", 400, 240, "postgres"),
    ],
    edges: [
      e("sh-e1", "sh-api", "sh-router", "write/read"),
      e("sh-e2", "sh-router", "sh-db1", "key % 3 == 0"),
      e("sh-e3", "sh-router", "sh-db2", "key % 3 == 1"),
      e("sh-e4", "sh-router", "sh-db3", "key % 3 == 2"),
    ],
  },
};

const readReplica: Pattern = {
  id: "read-replica",
  name: "Read Replica",
  description: "Primary handles writes; read replicas absorb heavy read traffic.",
  category: "data",
  difficulty: "intro",
  tags: ["replication", "read-heavy", "postgres"],
  whenToUse: "When reads vastly outnumber writes and you need simple horizontal read scaling.",
  tradeoffs: "Replication lag means eventual consistency; replicas add operational overhead.",
  diagram: {
    nodes: [
      n("rr-api", "api", "App Service", 0, 120),
      n("rr-primary", "database", "Primary DB", 240, 60, "postgres"),
      n("rr-replica1", "database", "Read Replica 1", 240, 180, "postgres"),
      n("rr-replica2", "database", "Read Replica 2", 240, 300, "postgres"),
    ],
    edges: [
      e("rr-e1", "rr-api", "rr-primary", "writes"),
      e("rr-e2", "rr-api", "rr-replica1", "reads"),
      e("rr-e3", "rr-api", "rr-replica2", "reads"),
      e("rr-e4", "rr-primary", "rr-replica1", "replicate"),
      e("rr-e5", "rr-primary", "rr-replica2", "replicate"),
    ],
  },
};

const cqrs: Pattern = {
  id: "cqrs",
  name: "CQRS",
  description: "Separates command (write) and query (read) paths with dedicated models.",
  category: "data",
  difficulty: "advanced",
  tags: ["event-driven", "read-model", "write-model"],
  whenToUse: "When read and write workloads have very different scaling or modelling needs.",
  tradeoffs: "Eventual consistency between write and read models; higher code complexity.",
  diagram: {
    nodes: [
      n("cq-cmd", "api", "Command API", 0, 0),
      n("cq-wdb", "database", "Write DB", 200, 0, "postgres"),
      n("cq-stream", "queue", "Event Stream", 400, 0),
      n("cq-qapi", "api", "Query API", 0, 200),
      n("cq-rdb", "database", "Read DB", 200, 200, "postgres"),
    ],
    edges: [
      e("cq-e1", "cq-cmd", "cq-wdb", "write"),
      e("cq-e2", "cq-wdb", "cq-stream", "event"),
      e("cq-e3", "cq-stream", "cq-rdb", "project"),
      e("cq-e4", "cq-qapi", "cq-rdb", "read"),
    ],
  },
};

const eventSourcing: Pattern = {
  id: "event-sourcing",
  name: "Event Sourcing",
  description: "State changes are stored as an immutable event log; read models are projections.",
  category: "data",
  difficulty: "advanced",
  tags: ["kafka", "audit-log", "time-travel"],
  whenToUse: "When full audit history, temporal queries, or event replay is required.",
  tradeoffs: "Query complexity; event schema evolution; eventual consistency of projections.",
  diagram: {
    nodes: [
      n("es-api", "api", "API", 0, 100),
      n("es-store", "queue", "Event Store (Kafka)", 200, 100),
      n("es-worker", "worker", "Projection Worker", 400, 100),
      n("es-rdb", "database", "Read Model DB", 600, 100, "postgres"),
    ],
    edges: [
      e("es-e1", "es-api", "es-store", "append event"),
      e("es-e2", "es-store", "es-worker", "consume"),
      e("es-e3", "es-worker", "es-rdb", "project"),
    ],
  },
};

const pubSub: Pattern = {
  id: "pub-sub",
  name: "Pub/Sub",
  description: "Publisher emits messages to a topic; multiple subscribers consume independently.",
  category: "messaging",
  difficulty: "common",
  tags: ["kafka", "sns", "fanout"],
  whenToUse: "When one producer needs to fan out events to multiple independent consumers.",
  tradeoffs: "Message ordering guarantees vary; at-least-once delivery requires idempotency.",
  diagram: {
    nodes: [
      n("ps-pub", "api", "Publisher API", 0, 120),
      n("ps-topic", "queue", "Topic (Kafka/SNS)", 200, 120),
      n("ps-sub1", "worker", "Subscriber A", 400, 0),
      n("ps-sub2", "worker", "Subscriber B", 400, 120),
      n("ps-sub3", "worker", "Subscriber C", 400, 240),
    ],
    edges: [
      e("ps-e1", "ps-pub", "ps-topic", "publish"),
      e("ps-e2", "ps-topic", "ps-sub1"),
      e("ps-e3", "ps-topic", "ps-sub2"),
      e("ps-e4", "ps-topic", "ps-sub3"),
    ],
  },
};

const outbox: Pattern = {
  id: "outbox",
  name: "Transactional Outbox",
  description: "Writes DB record and outbox event atomically; CDC worker relays to Kafka.",
  category: "messaging",
  difficulty: "advanced",
  tags: ["cdc", "exactly-once", "kafka", "debezium"],
  whenToUse: "When you need guaranteed at-least-once event publishing without dual-write risk.",
  tradeoffs: "Polling/CDC adds infra complexity; eventual delivery, not synchronous.",
  diagram: {
    nodes: [
      n("ob-api", "api", "API Service", 0, 100),
      n("ob-db", "database", "DB + Outbox", 200, 60, "postgres"),
      n("ob-cdc", "worker", "CDC Worker", 400, 60),
      n("ob-kafka", "queue", "Kafka", 600, 60),
      n("ob-consumer", "worker", "Consumer", 800, 60),
    ],
    edges: [
      e("ob-e1", "ob-api", "ob-db", "atomic write"),
      e("ob-e2", "ob-db", "ob-cdc", "poll outbox"),
      e("ob-e3", "ob-cdc", "ob-kafka", "publish"),
      e("ob-e4", "ob-kafka", "ob-consumer"),
    ],
  },
};

const bff: Pattern = {
  id: "bff",
  name: "Backend for Frontend (BFF)",
  description: "Dedicated API gateway per client type (mobile, web) to tailor responses.",
  category: "microservices",
  difficulty: "common",
  tags: ["api-gateway", "mobile", "web", "graphql"],
  whenToUse: "When mobile and web clients have very different data/format requirements.",
  tradeoffs: "Duplication between BFFs; extra services to maintain.",
  diagram: {
    nodes: [
      n("bff-mob", "user", "Mobile User", 0, 0),
      n("bff-web", "user", "Web User", 0, 160),
      n("bff-mbff", "api", "Mobile BFF", 200, 0, "api-gateway"),
      n("bff-wbff", "api", "Web BFF", 200, 160, "api-gateway"),
      n("bff-svc", "api", "Shared Services", 400, 80),
    ],
    edges: [
      e("bff-e1", "bff-mob", "bff-mbff"),
      e("bff-e2", "bff-web", "bff-wbff"),
      e("bff-e3", "bff-mbff", "bff-svc"),
      e("bff-e4", "bff-wbff", "bff-svc"),
    ],
  },
};

const sidecar: Pattern = {
  id: "sidecar",
  name: "Sidecar Proxy",
  description: "Each app container gets a co-deployed proxy sidecar handling observability and mTLS.",
  category: "microservices",
  difficulty: "advanced",
  tags: ["envoy", "linkerd", "service-mesh", "istio"],
  whenToUse: "When adding cross-cutting concerns (auth, tracing, retries) without modifying app code.",
  tradeoffs: "Resource overhead per pod; mesh complexity; debugging harder.",
  diagram: {
    nodes: [
      n("sc-app", "api", "App Container", 0, 80),
      n("sc-proxy", "load_balancer", "Sidecar Proxy (Envoy)", 200, 80),
      n("sc-mesh", "external", "Service Mesh Control Plane", 400, 80),
    ],
    edges: [
      e("sc-e1", "sc-app", "sc-proxy", "all traffic"),
      e("sc-e2", "sc-proxy", "sc-mesh", "xDS config"),
    ],
  },
};

const saga: Pattern = {
  id: "saga",
  name: "Saga Pattern",
  description: "Long-running distributed transaction with compensating actions on failure.",
  category: "microservices",
  difficulty: "advanced",
  tags: ["distributed-transactions", "choreography", "compensation"],
  whenToUse: "When a business transaction spans multiple microservices with no shared DB.",
  tradeoffs: "Complex compensation logic; eventual consistency; harder to debug.",
  diagram: {
    nodes: [
      n("sg-api", "api", "Order API", 0, 100),
      n("sg-s1", "worker", "Payment Service", 200, 0),
      n("sg-s2", "worker", "Inventory Service", 200, 100),
      n("sg-s3", "worker", "Shipping Service", 200, 200),
      n("sg-comp", "queue", "Compensation Bus", 400, 100),
    ],
    edges: [
      e("sg-e1", "sg-api", "sg-s1", "step 1"),
      e("sg-e2", "sg-s1", "sg-s2", "step 2"),
      e("sg-e3", "sg-s2", "sg-s3", "step 3"),
      e("sg-e4", "sg-s1", "sg-comp", "rollback"),
      e("sg-e5", "sg-s2", "sg-comp", "rollback"),
    ],
  },
};

export const PATTERNS_CATALOG: Pattern[] = [
  cacheAside,
  readThrough,
  writeThrough,
  circuitBreaker,
  bulkhead,
  rateLimiter,
  sharding,
  readReplica,
  cqrs,
  eventSourcing,
  pubSub,
  outbox,
  bff,
  sidecar,
  saga,
];
