import type { Template } from "./types";

const microservicesSkeleton: Template = {
  id: "microservices-skeleton",
  name: "Microservices Skeleton",
  description: "Canonical microservices layout: API gateway + service mesh + per-service DB.",
  category: "architectural",
  difficulty: "medium",
  tags: ["microservices", "service-mesh", "api-gateway"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 10000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "API Gateway", variant: "api-gateway", config: { provider: "aws", rateLimit: 20000, auth: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "User Service", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n4", type: "api", position: { x: 480, y: 200 }, data: { label: "Order Service", variant: "rest", config: { instances: 6, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n5", type: "api", position: { x: 480, y: 340 }, data: { label: "Inventory Service", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n6", type: "database", position: { x: 720, y: 60 }, data: { label: "User DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 100, connectionPool: 100, region: "us-east-1" } } },
      { id: "n7", type: "database", position: { x: 720, y: 200 }, data: { label: "Order DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 200, connectionPool: 100, region: "us-east-1" } } },
      { id: "n8", type: "database", position: { x: 720, y: 340 }, data: { label: "Inventory DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 100, connectionPool: 100, region: "us-east-1" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "/users" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "/orders" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "/inventory" } },
      { id: "e5", source: "n3", target: "n6" },
      { id: "e6", source: "n4", target: "n7" },
      { id: "e7", source: "n5", target: "n8" },
      { id: "e8", source: "n4", target: "n5", data: { label: "check stock" } },
    ],
  },
};

const eventSourcingCqrs: Template = {
  id: "event-sourcing-cqrs",
  name: "Event Sourcing + CQRS",
  description: "Write side appends events; read side projects them into denormalized views.",
  category: "architectural",
  difficulty: "hard",
  tags: ["event-store", "projection", "cqrs", "event-driven"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 50000, reqPerSec: 5000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 100 }, data: { label: "Command API", variant: "rest", config: { instances: 5, cpu: 2, memoryMb: 1024, rateLimit: 10000 } } },
      { id: "n3", type: "api", position: { x: 240, y: 300 }, data: { label: "Query API", variant: "rest", config: { instances: 10, cpu: 2, memoryMb: 1024, rateLimit: 20000 } } },
      { id: "n4", type: "database", position: { x: 480, y: 100 }, data: { label: "Event Store", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 100, region: "us-east-1" } } },
      { id: "n5", type: "queue", position: { x: 720, y: 100 }, data: { label: "Event Bus", variant: "kafka", config: { partitions: 24, retentionHours: 720, replicationFactor: 3 } } },
      { id: "n6", type: "worker", position: { x: 960, y: 100 }, data: { label: "Projection Worker", variant: "go", config: { instances: 4, cpu: 2, memoryMb: 512 } } },
      { id: "n7", type: "database", position: { x: 960, y: 300 }, data: { label: "Read Model (denorm)", variant: "mongodb", config: { version: "7.0", shards: 2, replicaSet: 3, storageGb: 300 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "command" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "query" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "append" } },
      { id: "e4", source: "n4", target: "n5", data: { label: "publish" } },
      { id: "e5", source: "n5", target: "n6" },
      { id: "e6", source: "n6", target: "n7", data: { label: "project" } },
      { id: "e7", source: "n3", target: "n7", data: { label: "read" } },
    ],
  },
};

const sagaOrchestration: Template = {
  id: "saga-orchestration",
  name: "Saga Orchestration",
  description: "Distributed transaction via orchestrator + compensating actions on failure.",
  category: "architectural",
  difficulty: "hard",
  tags: ["distributed-tx", "compensation", "event-driven"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 10000, reqPerSec: 1000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "Saga Orchestrator", variant: "rest", config: { instances: 3, cpu: 2, memoryMb: 1024, rateLimit: 2000 } } },
      { id: "n3", type: "worker", position: { x: 480, y: 60 }, data: { label: "Order Service", variant: "nodejs", config: { instances: 2, cpu: 1, memoryMb: 512, runtime: "22" } } },
      { id: "n4", type: "worker", position: { x: 480, y: 160 }, data: { label: "Payment Service", variant: "nodejs", config: { instances: 2, cpu: 1, memoryMb: 512, runtime: "22" } } },
      { id: "n5", type: "worker", position: { x: 480, y: 260 }, data: { label: "Inventory Service", variant: "nodejs", config: { instances: 2, cpu: 1, memoryMb: 512, runtime: "22" } } },
      { id: "n6", type: "worker", position: { x: 480, y: 360 }, data: { label: "Shipping Service", variant: "nodejs", config: { instances: 2, cpu: 1, memoryMb: 512, runtime: "22" } } },
      { id: "n7", type: "queue", position: { x: 720, y: 200 }, data: { label: "Saga Events", variant: "kafka", config: { partitions: 12, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n8", type: "database", position: { x: 960, y: 200 }, data: { label: "Saga State", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 50, connectionPool: 50, region: "us-east-1" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "begin" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "create-order" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "charge" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "reserve" } },
      { id: "e5", source: "n2", target: "n6", data: { label: "ship" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "event" } },
      { id: "e7", source: "n4", target: "n7", data: { label: "event" } },
      { id: "e8", source: "n5", target: "n7", data: { label: "event" } },
      { id: "e9", source: "n6", target: "n7", data: { label: "event" } },
      { id: "e10", source: "n7", target: "n2", data: { label: "compensate?" } },
      { id: "e11", source: "n2", target: "n8", data: { label: "persist" } },
    ],
  },
};

const stranglerFig: Template = {
  id: "strangler-fig",
  name: "Strangler Fig Migration",
  description: "Gradually replace legacy monolith by routing % traffic through proxy to new services.",
  category: "architectural",
  difficulty: "medium",
  tags: ["refactor", "legacy", "proxy", "migration"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 5000, region: "us-east-1" } } },
      { id: "n2", type: "load_balancer", position: { x: 240, y: 150 }, data: { label: "Strangler Proxy", variant: "nginx", config: { algorithm: "round-robin", sslTermination: true, healthCheckPath: "/health" } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "Legacy Monolith", variant: "rest", config: { instances: 6, cpu: 4, memoryMb: 4096, rateLimit: 10000 } } },
      { id: "n4", type: "api", position: { x: 480, y: 240 }, data: { label: "New User Service", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 8000 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "Legacy DB", variant: "mysql", config: { version: "5.7", replicas: 1, storageGb: 800, connectionPool: 200 } } },
      { id: "n6", type: "database", position: { x: 720, y: 240 }, data: { label: "New DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 200, connectionPool: 100, region: "us-east-1" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "90% routes" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "10% /users/*" } },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n4", target: "n6" },
      { id: "e6", source: "n5", target: "n6", data: { label: "dual-write CDC" } },
    ],
  },
};

const backendForFrontend: Template = {
  id: "backend-for-frontend",
  name: "Backend-for-Frontend (BFF)",
  description: "Per-channel backend aggregator: mobile BFF + web BFF tailor responses for client.",
  category: "architectural",
  difficulty: "easy",
  tags: ["mobile", "web", "gateway", "aggregation"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 60 }, data: { label: "Web Client", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 5000, region: "us-east-1" } } },
      { id: "n2", type: "user", position: { x: 0, y: 260 }, data: { label: "Mobile Client", variant: "mobile-app", config: { concurrentUsers: 500000, reqPerSec: 20000, platforms: "both" } } },
      { id: "n3", type: "api", position: { x: 240, y: 60 }, data: { label: "Web BFF", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 8000 } } },
      { id: "n4", type: "api", position: { x: 240, y: 260 }, data: { label: "Mobile BFF", variant: "graphql", config: { instances: 6, cpu: 2, memoryMb: 1024, maxDepth: 5 } } },
      { id: "n5", type: "api", position: { x: 480, y: 60 }, data: { label: "User Service", variant: "rest", config: { instances: 3, cpu: 1, memoryMb: 512, rateLimit: 5000 } } },
      { id: "n6", type: "api", position: { x: 480, y: 160 }, data: { label: "Catalog Service", variant: "rest", config: { instances: 3, cpu: 1, memoryMb: 512, rateLimit: 5000 } } },
      { id: "n7", type: "api", position: { x: 480, y: 260 }, data: { label: "Order Service", variant: "rest", config: { instances: 3, cpu: 1, memoryMb: 512, rateLimit: 5000 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3" },
      { id: "e2", source: "n2", target: "n4" },
      { id: "e3", source: "n3", target: "n5" },
      { id: "e4", source: "n3", target: "n6" },
      { id: "e5", source: "n3", target: "n7" },
      { id: "e6", source: "n4", target: "n5" },
      { id: "e7", source: "n4", target: "n6" },
      { id: "e8", source: "n4", target: "n7" },
    ],
  },
};

const sidecarPattern: Template = {
  id: "sidecar-pattern",
  name: "Sidecar Pattern",
  description: "Each service paired with sidecar proxy for observability, TLS, retry, circuit breaking.",
  category: "architectural",
  difficulty: "medium",
  tags: ["service-mesh", "observability", "sidecar", "envoy"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 10000, reqPerSec: 1000, region: "us-east-1" } } },
      { id: "n2", type: "load_balancer", position: { x: 240, y: 150 }, data: { label: "Envoy Ingress", variant: "envoy", config: { clusters: 3 } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "Service A", variant: "rest", config: { instances: 3, cpu: 2, memoryMb: 1024, rateLimit: 3000 } } },
      { id: "n4", type: "load_balancer", position: { x: 480, y: 160 }, data: { label: "Sidecar (Envoy)", variant: "envoy", config: { clusters: 1 } } },
      { id: "n5", type: "api", position: { x: 480, y: 260 }, data: { label: "Service B", variant: "rest", config: { instances: 3, cpu: 2, memoryMb: 1024, rateLimit: 3000 } } },
      { id: "n6", type: "load_balancer", position: { x: 480, y: 360 }, data: { label: "Sidecar (Envoy)", variant: "envoy", config: { clusters: 1 } } },
      { id: "n7", type: "worker", position: { x: 720, y: 200 }, data: { label: "Telemetry Collector", variant: "go", config: { instances: 2, cpu: 1, memoryMb: 256 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n4", data: { label: "to A" } },
      { id: "e3", source: "n2", target: "n6", data: { label: "to B" } },
      { id: "e4", source: "n4", target: "n3" },
      { id: "e5", source: "n6", target: "n5" },
      { id: "e6", source: "n4", target: "n7", data: { label: "metrics" } },
      { id: "e7", source: "n6", target: "n7", data: { label: "metrics" } },
    ],
  },
};

const circuitBreakerBulkhead: Template = {
  id: "circuit-breaker-bulkhead",
  name: "Circuit Breaker + Bulkhead",
  description: "Fault isolation: per-dependency thread pool + circuit breaker on failure threshold.",
  category: "architectural",
  difficulty: "medium",
  tags: ["resilience", "fault-tolerance", "circuit-breaker"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 50000, reqPerSec: 5000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "App Service (Hystrix-style)", variant: "rest", config: { instances: 6, cpu: 2, memoryMb: 1024, rateLimit: 10000 } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "Pool A (Catalog)", variant: "rest", config: { instances: 3, cpu: 1, memoryMb: 512, rateLimit: 5000 } } },
      { id: "n4", type: "api", position: { x: 480, y: 200 }, data: { label: "Pool B (Recommend)", variant: "rest", config: { instances: 3, cpu: 1, memoryMb: 512, rateLimit: 5000 } } },
      { id: "n5", type: "external", position: { x: 480, y: 340 }, data: { label: "Pool C (3rd party)", variant: "custom-third-party", config: { baseUrl: "https://flaky.example.com", slaMs: 2000, rateLimit: 100 } } },
      { id: "n6", type: "cache", position: { x: 720, y: 340 }, data: { label: "Fallback Cache", variant: "redis", config: { memoryGb: 4, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 1 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "thread pool A" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "thread pool B" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "circuit + pool C" } },
      { id: "e5", source: "n2", target: "n6", data: { label: "fallback on open" } },
    ],
  },
};

const pubsubMaterializedView: Template = {
  id: "pubsub-materialized-view",
  name: "Pub-Sub + Materialized Views",
  description: "Source of truth + denormalized materialized views per query pattern via event bus.",
  category: "architectural",
  difficulty: "medium",
  tags: ["event-driven", "read-models", "materialized-view"],
  diagram: {
    nodes: [
      { id: "n1", type: "api", position: { x: 0, y: 200 }, data: { label: "Write API", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n2", type: "database", position: { x: 240, y: 200 }, data: { label: "Source DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 200, connectionPool: 100, region: "us-east-1" } } },
      { id: "n3", type: "queue", position: { x: 480, y: 200 }, data: { label: "Event Bus", variant: "kafka", config: { partitions: 24, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n4", type: "worker", position: { x: 720, y: 60 }, data: { label: "View Builder A", variant: "go", config: { instances: 2, cpu: 1, memoryMb: 256 } } },
      { id: "n5", type: "worker", position: { x: 720, y: 200 }, data: { label: "View Builder B", variant: "go", config: { instances: 2, cpu: 1, memoryMb: 256 } } },
      { id: "n6", type: "worker", position: { x: 720, y: 340 }, data: { label: "Search Indexer", variant: "go", config: { instances: 2, cpu: 1, memoryMb: 256 } } },
      { id: "n7", type: "cache", position: { x: 960, y: 60 }, data: { label: "View A (Redis)", variant: "redis", config: { memoryGb: 8, evictionPolicy: "allkeys-lru", persistence: "rdb", replicas: 1 } } },
      { id: "n8", type: "database", position: { x: 960, y: 200 }, data: { label: "View B (Mongo)", variant: "mongodb", config: { version: "7.0", shards: 1, replicaSet: 3, storageGb: 100 } } },
      { id: "n9", type: "database", position: { x: 960, y: 340 }, data: { label: "Search Index", variant: "cassandra", config: { nodes: 3, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "write" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "CDC" } },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n3", target: "n6" },
      { id: "e6", source: "n4", target: "n7" },
      { id: "e7", source: "n5", target: "n8" },
      { id: "e8", source: "n6", target: "n9" },
    ],
  },
};

const apiGatewayMesh: Template = {
  id: "api-gateway-mesh",
  name: "API Gateway + Service Mesh",
  description: "External traffic via API gateway; internal east-west via service mesh.",
  category: "architectural",
  difficulty: "medium",
  tags: ["routing", "observability", "service-mesh", "istio"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "External Client", variant: "web-browser", config: { concurrentUsers: 200000, reqPerSec: 20000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "API Gateway (north-south)", variant: "api-gateway", config: { provider: "aws", rateLimit: 50000, auth: true } } },
      { id: "n3", type: "load_balancer", position: { x: 480, y: 200 }, data: { label: "Service Mesh (east-west)", variant: "envoy", config: { clusters: 10 } } },
      { id: "n4", type: "api", position: { x: 720, y: 60 }, data: { label: "Service A", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n5", type: "api", position: { x: 720, y: 200 }, data: { label: "Service B", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n6", type: "api", position: { x: 720, y: 340 }, data: { label: "Service C", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n3", target: "n6" },
      { id: "e6", source: "n4", target: "n5", data: { label: "internal" } },
      { id: "e7", source: "n5", target: "n6", data: { label: "internal" } },
    ],
  },
};

const hexagonalArchitecture: Template = {
  id: "hexagonal-architecture",
  name: "Hexagonal Architecture",
  description: "Domain core surrounded by ports + adapters (DB, queue, external API).",
  category: "architectural",
  difficulty: "easy",
  tags: ["ports-adapters", "clean-arch", "ddd"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "HTTP Adapter", variant: "rest", config: { instances: 3, cpu: 1, memoryMb: 512, rateLimit: 3000 } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "Domain Core (use cases)", variant: "rest", config: { instances: 5, cpu: 4, memoryMb: 2048, rateLimit: 8000 } } },
      { id: "n3", type: "database", position: { x: 480, y: 60 }, data: { label: "Repository Adapter (Postgres)", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 100, connectionPool: 100, region: "us-east-1" } } },
      { id: "n4", type: "queue", position: { x: 480, y: 200 }, data: { label: "Event Publisher Adapter", variant: "kafka", config: { partitions: 6, retentionHours: 72, replicationFactor: 3 } } },
      { id: "n5", type: "external", position: { x: 480, y: 340 }, data: { label: "External API Adapter", variant: "custom-third-party", config: { baseUrl: "https://3rd.example.com", slaMs: 500, rateLimit: 500 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "command" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "port: Repository" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "port: Events" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "port: ExternalApi" } },
    ],
  },
};

export const ARCHITECTURAL_PATTERNS: Template[] = [
  microservicesSkeleton,
  eventSourcingCqrs,
  sagaOrchestration,
  stranglerFig,
  backendForFrontend,
  sidecarPattern,
  circuitBreakerBulkhead,
  pubsubMaterializedView,
  apiGatewayMesh,
  hexagonalArchitecture,
];
