import type { Template } from "./types";

const urlShortener: Template = {
  id: "url-shortener",
  name: "URL Shortener",
  description: "Scalable URL shortening service with cache layer for fast redirects.",
  category: "infra",
  difficulty: "easy",
  tags: ["caching", "read-heavy", "scale-10M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 100 }, data: { label: "Web Client", variant: "web-browser", config: { concurrentUsers: 50000, reqPerSec: 5000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 100 }, data: { label: "API Gateway", variant: "api-gateway", config: { provider: "aws", rateLimit: 10000, auth: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 100 }, data: { label: "URL Service", variant: "rest", config: { instances: 3, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n4", type: "cache", position: { x: 720, y: 0 }, data: { label: "Redis Cache", variant: "redis", config: { memoryGb: 4, evictionPolicy: "allkeys-lru", persistence: "rdb", replicas: 2 } } },
      { id: "n5", type: "database", position: { x: 720, y: 200 }, data: { label: "PostgreSQL", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 100, connectionPool: 200, region: "us-east-1" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "HTTPS" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "route" } },
      { id: "e3", source: "n3", target: "n4", data: { label: "cache lookup" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "persist" } },
    ],
  },
};

const twitterTimeline: Template = {
  id: "twitter-timeline",
  name: "Twitter Timeline",
  description: "Fan-out-on-write social feed with Kafka-driven notification pipeline.",
  category: "social",
  difficulty: "hard",
  tags: ["scale-100M", "fan-out", "real-time", "global"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 160 }, data: { label: "User", variant: "mobile-app", config: { concurrentUsers: 10000000, reqPerSec: 100000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "load_balancer", position: { x: 240, y: 260 }, data: { label: "Load Balancer", variant: "aws-alb", config: { region: "us-east-1", targetGroups: 3 } } },
      { id: "n4", type: "api", position: { x: 480, y: 160 }, data: { label: "Feed API", variant: "rest", config: { instances: 10, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n5", type: "cache", position: { x: 720, y: 60 }, data: { label: "Feed Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n6", type: "database", position: { x: 720, y: 260 }, data: { label: "PostgreSQL", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 300, region: "us-east-1" } } },
      { id: "n7", type: "queue", position: { x: 960, y: 160 }, data: { label: "Kafka", variant: "kafka", config: { partitions: 48, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 1200, y: 60 }, data: { label: "Fanout Worker", variant: "go", config: { instances: 6, cpu: 2, memoryMb: 512 } } },
      { id: "n9", type: "worker", position: { x: 1200, y: 260 }, data: { label: "Notification Worker", variant: "nodejs", config: { instances: 4, cpu: 1, memoryMb: 512, runtime: "22" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "static" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "API calls" } },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", data: { label: "cache read" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "write" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "publish" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n7", target: "n9" },
    ],
  },
};

const instagramFeed: Template = {
  id: "instagram-feed",
  name: "Instagram Feed",
  description: "Photo feed with CDN image delivery, object storage, and async processing workers.",
  category: "social",
  difficulty: "hard",
  tags: ["scale-100M", "media", "global", "object-storage"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 140 }, data: { label: "Mobile User", variant: "mobile-app", config: { concurrentUsers: 5000000, reqPerSec: 50000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Cloudfront CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "api", position: { x: 240, y: 220 }, data: { label: "Mobile API", variant: "rest", config: { instances: 8, cpu: 4, memoryMb: 2048, rateLimit: 20000 } } },
      { id: "n4", type: "storage", position: { x: 480, y: 60 }, data: { label: "S3 (Images)", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n5", type: "database", position: { x: 480, y: 220 }, data: { label: "PostgreSQL", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 1000, connectionPool: 200, region: "us-east-1" } } },
      { id: "n6", type: "cache", position: { x: 720, y: 140 }, data: { label: "Redis Cache", variant: "redis", config: { memoryGb: 16, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 2 } } },
      { id: "n7", type: "queue", position: { x: 960, y: 140 }, data: { label: "Kafka", variant: "kafka", config: { partitions: 24, retentionHours: 72, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 1200, y: 140 }, data: { label: "Media Worker", variant: "python", config: { instances: 4, cpu: 4, memoryMb: 2048, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "images" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "API" } },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n4", data: { label: "upload" } },
      { id: "e5", source: "n3", target: "n5", data: { label: "metadata" } },
      { id: "e6", source: "n3", target: "n6", data: { label: "cache" } },
      { id: "e7", source: "n3", target: "n7", data: { label: "events" } },
      { id: "e8", source: "n7", target: "n8" },
    ],
  },
};

const uberDispatch: Template = {
  id: "uber-dispatch",
  name: "Uber Dispatch",
  description: "Real-time ride matching with geo-aware dispatch and Kafka event streaming.",
  category: "marketplace",
  difficulty: "hard",
  tags: ["real-time", "geo", "scale-50M", "event-driven"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 60 }, data: { label: "Rider App", variant: "mobile-app", config: { concurrentUsers: 1000000, reqPerSec: 10000, platforms: "both" } } },
      { id: "n2", type: "user", position: { x: 0, y: 220 }, data: { label: "Driver App", variant: "mobile-app", config: { concurrentUsers: 500000, reqPerSec: 5000, platforms: "both" } } },
      { id: "n3", type: "load_balancer", position: { x: 240, y: 140 }, data: { label: "Load Balancer", variant: "aws-alb", config: { region: "us-east-1", targetGroups: 2 } } },
      { id: "n4", type: "api", position: { x: 480, y: 140 }, data: { label: "Match API", variant: "rest", config: { instances: 6, cpu: 4, memoryMb: 2048, rateLimit: 20000 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "Cassandra", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n6", type: "cache", position: { x: 720, y: 220 }, data: { label: "Redis Geo", variant: "redis", config: { memoryGb: 8, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 2 } } },
      { id: "n7", type: "queue", position: { x: 960, y: 140 }, data: { label: "Kafka", variant: "kafka", config: { partitions: 24, retentionHours: 48, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 1200, y: 140 }, data: { label: "Pricing Worker", variant: "go", config: { instances: 4, cpu: 2, memoryMb: 512 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", data: { label: "trip data" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "driver positions" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "events" } },
      { id: "e7", source: "n7", target: "n8" },
    ],
  },
};

const netflixStreaming: Template = {
  id: "netflix-streaming",
  name: "Netflix Streaming",
  description: "Adaptive video streaming platform with ML recommendations and multi-region CDN.",
  category: "streaming",
  difficulty: "hard",
  tags: ["scale-200M", "global", "video", "ml", "real-time"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "User", variant: "web-browser", config: { concurrentUsers: 20000000, reqPerSec: 500000, region: "global" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 200 }, data: { label: "CDN (Edge)", variant: "cloudflare", config: { cacheTtlSec: 3600, originShield: true, wafEnabled: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 80 }, data: { label: "Catalog API", variant: "rest", config: { instances: 10, cpu: 4, memoryMb: 2048, rateLimit: 100000 } } },
      { id: "n4", type: "api", position: { x: 480, y: 320 }, data: { label: "Stream API", variant: "rest", config: { instances: 20, cpu: 8, memoryMb: 4096, rateLimit: 200000 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "PostgreSQL", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 200, region: "us-east-1" } } },
      { id: "n6", type: "database", position: { x: 720, y: 200 }, data: { label: "Cassandra", variant: "cassandra", config: { nodes: 9, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n7", type: "storage", position: { x: 720, y: 340 }, data: { label: "S3 (Video)", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n8", type: "cache", position: { x: 960, y: 140 }, data: { label: "Redis Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n9", type: "worker", position: { x: 960, y: 320 }, data: { label: "Recommendation Worker", variant: "python", config: { instances: 8, cpu: 8, memoryMb: 8192, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "catalog" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "stream" } },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n3", target: "n6" },
      { id: "e6", source: "n4", target: "n7" },
      { id: "e7", source: "n3", target: "n8" },
      { id: "e8", source: "n4", target: "n8" },
      { id: "e9", source: "n9", target: "n6", data: { label: "write recs" } },
    ],
  },
};

const whatsappChat: Template = {
  id: "whatsapp-chat",
  name: "WhatsApp Chat",
  description: "End-to-end encrypted real-time messaging with presence and push notifications.",
  category: "messaging",
  difficulty: "medium",
  tags: ["real-time", "scale-100M", "websocket", "push"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 140 }, data: { label: "Mobile User", variant: "mobile-app", config: { concurrentUsers: 5000000, reqPerSec: 50000, platforms: "both" } } },
      { id: "n2", type: "api", position: { x: 240, y: 140 }, data: { label: "WebSocket API", variant: "websocket", config: { instances: 10, maxConnections: 100000 } } },
      { id: "n3", type: "database", position: { x: 480, y: 60 }, data: { label: "Cassandra", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n4", type: "cache", position: { x: 480, y: 220 }, data: { label: "Redis Presence", variant: "redis", config: { memoryGb: 8, evictionPolicy: "volatile-lru", persistence: "none", replicas: 2 } } },
      { id: "n5", type: "queue", position: { x: 720, y: 140 }, data: { label: "Kafka", variant: "kafka", config: { partitions: 24, retentionHours: 72, replicationFactor: 3 } } },
      { id: "n6", type: "worker", position: { x: 960, y: 140 }, data: { label: "Push Worker", variant: "go", config: { instances: 4, cpu: 2, memoryMb: 512 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "WS" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "messages" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "presence" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "events" } },
      { id: "e5", source: "n5", target: "n6" },
    ],
  },
};

const distributedCache: Template = {
  id: "distributed-cache",
  name: "Distributed Cache",
  description: "Multi-region Redis cluster with origin fallback for low-latency data access.",
  category: "infra",
  difficulty: "medium",
  tags: ["caching", "multi-region", "low-latency", "scale-50M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 140 }, data: { label: "Client", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 10000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 140 }, data: { label: "API Service", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 20000 } } },
      { id: "n3", type: "cache", position: { x: 480, y: 60 }, data: { label: "Redis Cluster (US)", variant: "redis", config: { memoryGb: 16, evictionPolicy: "allkeys-lru", persistence: "rdb", replicas: 2 } } },
      { id: "n4", type: "cache", position: { x: 480, y: 220 }, data: { label: "Redis Cluster (EU)", variant: "redis", config: { memoryGb: 16, evictionPolicy: "allkeys-lru", persistence: "rdb", replicas: 2 } } },
      { id: "n5", type: "database", position: { x: 720, y: 140 }, data: { label: "PostgreSQL Origin", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 200, connectionPool: 100, region: "us-east-1" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "get/set" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "get/set" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "miss fallback" } },
      { id: "e5", source: "n4", target: "n5", data: { label: "miss fallback" } },
    ],
  },
};

const adServing: Template = {
  id: "ad-serving",
  name: "Ad Serving Platform",
  description: "Real-time bidding and ad serving with analytics pipeline at massive scale.",
  category: "marketplace",
  difficulty: "hard",
  tags: ["scale-100M", "real-time-bidding", "analytics", "low-latency"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 160 }, data: { label: "Publisher Site", variant: "web-browser", config: { concurrentUsers: 10000000, reqPerSec: 200000, region: "global" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 160 }, data: { label: "CDN", variant: "cloudflare", config: { cacheTtlSec: 0, originShield: false, wafEnabled: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 160 }, data: { label: "Ad Server", variant: "rest", config: { instances: 20, cpu: 8, memoryMb: 4096, rateLimit: 500000 } } },
      { id: "n4", type: "database", position: { x: 720, y: 60 }, data: { label: "DynamoDB", variant: "dynamodb", config: { region: "us-east-1", billingMode: "ondemand", rcu: 10000, wcu: 5000 } } },
      { id: "n5", type: "database", position: { x: 720, y: 220 }, data: { label: "Cassandra", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "ONE" } } },
      { id: "n6", type: "queue", position: { x: 960, y: 160 }, data: { label: "Kafka Analytics", variant: "kafka", config: { partitions: 48, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n7", type: "worker", position: { x: 1200, y: 160 }, data: { label: "Bid Worker", variant: "go", config: { instances: 8, cpu: 4, memoryMb: 1024 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "ad lookup" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "freq cap" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "impressions" } },
      { id: "e6", source: "n6", target: "n7" },
    ],
  },
};

const videoUpload: Template = {
  id: "video-upload",
  name: "Video Upload & Processing",
  description: "Async video ingestion with multi-format transcoding workers and CDN delivery.",
  category: "streaming",
  difficulty: "medium",
  tags: ["async", "media-processing", "object-storage", "scale-10M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 140 }, data: { label: "Creator", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 2000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 140 }, data: { label: "Upload API", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 2048, rateLimit: 5000 } } },
      { id: "n3", type: "storage", position: { x: 480, y: 60 }, data: { label: "S3 Raw Videos", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n4", type: "queue", position: { x: 480, y: 220 }, data: { label: "Kafka", variant: "kafka", config: { partitions: 12, retentionHours: 48, replicationFactor: 3 } } },
      { id: "n5", type: "worker", position: { x: 720, y: 140 }, data: { label: "Transcode Workers", variant: "python", config: { instances: 8, cpu: 8, memoryMb: 4096, runtime: "3.12" } } },
      { id: "n6", type: "cdn", position: { x: 960, y: 60 }, data: { label: "CloudFront", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n7", type: "database", position: { x: 960, y: 220 }, data: { label: "Postgres Metadata", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 100, connectionPool: 100, region: "us-east-1" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "upload" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "transcode job" } },
      { id: "e4", source: "n4", target: "n5" },
      { id: "e5", source: "n5", target: "n6", data: { label: "publish" } },
      { id: "e6", source: "n5", target: "n7", data: { label: "metadata" } },
    ],
  },
};

const paymentSystem: Template = {
  id: "payment-system",
  name: "Payment System",
  description: "PCI-compliant payment processing with idempotent APIs, audit log, and fraud detection.",
  category: "fintech",
  difficulty: "hard",
  tags: ["fintech", "compliance", "idempotent", "scale-10M", "audit-log"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 160 }, data: { label: "Customer", variant: "web-browser", config: { concurrentUsers: 500000, reqPerSec: 5000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 160 }, data: { label: "API Gateway (Rate-limited)", variant: "api-gateway", config: { provider: "aws", rateLimit: 2000, auth: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 160 }, data: { label: "Payment Service", variant: "rest", config: { instances: 6, cpu: 4, memoryMb: 2048, rateLimit: 5000 } } },
      { id: "n4", type: "database", position: { x: 720, y: 60 }, data: { label: "PostgreSQL (Ledger)", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 200, region: "us-east-1" } } },
      { id: "n5", type: "queue", position: { x: 720, y: 260 }, data: { label: "Audit Log Queue", variant: "sqs", config: { region: "us-east-1", fifo: true, visibilityTimeoutSec: 60 } } },
      { id: "n6", type: "external", position: { x: 960, y: 60 }, data: { label: "Stripe", variant: "payment-api", config: { provider: "stripe", slaMs: 500, rateLimit: 1000 } } },
      { id: "n7", type: "worker", position: { x: 960, y: 260 }, data: { label: "Notification Worker", variant: "nodejs", config: { instances: 3, cpu: 1, memoryMb: 512, runtime: "22" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "write txn" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "audit event" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "charge" } },
      { id: "e6", source: "n5", target: "n7" },
    ],
  },
};

// ---------------------------------------------------------------------------
// New Phase 2 templates (15 real-world apps)
// ---------------------------------------------------------------------------

const spotifyMusic: Template = {
  id: "spotify-music",
  name: "Spotify Music Streaming",
  description: "Music streaming với personalization, recommendation pipeline, and CDN delivery.",
  category: "streaming",
  difficulty: "medium",
  tags: ["streaming", "recommendation", "mobile", "scale-500M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Mobile App", variant: "mobile-app", config: { concurrentUsers: 100000000, reqPerSec: 10000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 150 }, data: { label: "Audio CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "load_balancer", position: { x: 480, y: 150 }, data: { label: "ALB", variant: "aws-alb", config: { region: "us-east-1", targetGroups: 5 } } },
      { id: "n4", type: "api", position: { x: 720, y: 150 }, data: { label: "Playback API", variant: "rest", config: { instances: 50, cpu: 4, memoryMb: 2048, rateLimit: 100000 } } },
      { id: "n5", type: "cache", position: { x: 960, y: 50 }, data: { label: "Playlist Cache", variant: "redis", config: { memoryGb: 64, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n6", type: "database", position: { x: 960, y: 150 }, data: { label: "User/Metadata DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 800, connectionPool: 300, region: "us-east-1" } } },
      { id: "n7", type: "storage", position: { x: 960, y: 250 }, data: { label: "Audio Files (S3)", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n8", type: "worker", position: { x: 720, y: 360 }, data: { label: "Recommendation Worker", variant: "python", config: { instances: 10, cpu: 8, memoryMb: 8192, runtime: "3.12" } } },
      { id: "n9", type: "queue", position: { x: 480, y: 360 }, data: { label: "Listen Events", variant: "kafka", config: { partitions: 100, retentionHours: 168, replicationFactor: 3 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "audio" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", data: { label: "playlist cache" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "metadata" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "stream chunk" } },
      { id: "e7", source: "n4", target: "n9", data: { label: "log play" } },
      { id: "e8", source: "n9", target: "n8" },
      { id: "e9", source: "n8", target: "n6", data: { label: "write recs" } },
    ],
  },
};

const discordChat: Template = {
  id: "discord-chat",
  name: "Discord Real-time Chat",
  description: "Real-time chat + voice channels with WebSocket + SFU for media.",
  category: "messaging",
  difficulty: "medium",
  tags: ["websocket", "voice", "gaming", "real-time"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Desktop/Mobile", variant: "desktop-app", config: { concurrentUsers: 15000000, reqPerSec: 200000, os: "cross" } } },
      { id: "n2", type: "load_balancer", position: { x: 240, y: 150 }, data: { label: "Gateway LB", variant: "haproxy", config: { algorithm: "leastconn", sticky: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "WS Gateway", variant: "websocket", config: { instances: 30, maxConnections: 100000 } } },
      { id: "n4", type: "worker", position: { x: 480, y: 240 }, data: { label: "Voice SFU", variant: "rust", config: { instances: 20, cpu: 4, memoryMb: 2048 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "Messages (Cassandra)", variant: "cassandra", config: { nodes: 12, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n6", type: "cache", position: { x: 720, y: 180 }, data: { label: "Presence Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "volatile-lru", persistence: "none", replicas: 3 } } },
      { id: "n7", type: "queue", position: { x: 720, y: 300 }, data: { label: "Push Queue", variant: "kafka", config: { partitions: 48, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 960, y: 300 }, data: { label: "Push Worker", variant: "go", config: { instances: 6, cpu: 2, memoryMb: 512 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "WS + WebRTC" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n2", target: "n4", data: { label: "voice" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "persist msg" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "presence" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "notify" } },
      { id: "e7", source: "n7", target: "n8" },
    ],
  },
};

const airbnbMarketplace: Template = {
  id: "airbnb-marketplace",
  name: "Airbnb Marketplace",
  description: "Two-sided marketplace: listing search, booking, payment, geo-aware ranking.",
  category: "marketplace",
  difficulty: "hard",
  tags: ["search", "booking", "payment", "geo", "scale-200M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Guest", variant: "web-browser", config: { concurrentUsers: 5000000, reqPerSec: 100000, region: "global" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Image CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "load_balancer", position: { x: 240, y: 240 }, data: { label: "ALB", variant: "aws-alb", config: { region: "us-east-1", targetGroups: 4 } } },
      { id: "n4", type: "api", position: { x: 480, y: 240 }, data: { label: "Booking API", variant: "rest", config: { instances: 30, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "Listing DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 2000, connectionPool: 400, region: "us-east-1" } } },
      { id: "n6", type: "database", position: { x: 720, y: 200 }, data: { label: "Search Index (ES)", variant: "cassandra", config: { nodes: 8, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n7", type: "cache", position: { x: 720, y: 340 }, data: { label: "Geo Cache", variant: "redis", config: { memoryGb: 16, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 2 } } },
      { id: "n8", type: "storage", position: { x: 480, y: 60 }, data: { label: "Listing Images", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n9", type: "external", position: { x: 960, y: 200 }, data: { label: "Stripe", variant: "payment-api", config: { provider: "stripe", slaMs: 500, rateLimit: 1000 } } },
      { id: "n10", type: "queue", position: { x: 960, y: 340 }, data: { label: "Booking Events", variant: "kafka", config: { partitions: 24, retentionHours: 168, replicationFactor: 3 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n1", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", data: { label: "listings" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "search" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "geo lookup" } },
      { id: "e7", source: "n2", target: "n8" },
      { id: "e8", source: "n4", target: "n9", data: { label: "charge" } },
      { id: "e9", source: "n4", target: "n10", data: { label: "booking" } },
    ],
  },
};

const tiktokFeed: Template = {
  id: "tiktok-feed",
  name: "TikTok For-You Feed",
  description: "ML-driven short video feed with massive CDN throughput and engagement pipeline.",
  category: "social",
  difficulty: "hard",
  tags: ["ml-rec", "video", "viral", "scale-1B"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Mobile User", variant: "mobile-app", config: { concurrentUsers: 200000000, reqPerSec: 500000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Video CDN", variant: "akamai", config: { cacheTtlSec: 86400 } } },
      { id: "n3", type: "load_balancer", position: { x: 240, y: 240 }, data: { label: "Edge LB", variant: "envoy", config: { clusters: 10 } } },
      { id: "n4", type: "api", position: { x: 480, y: 240 }, data: { label: "Feed API", variant: "rest", config: { instances: 100, cpu: 8, memoryMb: 4096, rateLimit: 500000 } } },
      { id: "n5", type: "cache", position: { x: 720, y: 100 }, data: { label: "Feed Cache", variant: "redis", config: { memoryGb: 128, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 5 } } },
      { id: "n6", type: "storage", position: { x: 720, y: 240 }, data: { label: "Video S3", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n7", type: "database", position: { x: 720, y: 380 }, data: { label: "User/Engagement DB", variant: "cassandra", config: { nodes: 30, replicationFactor: 3, consistencyLevel: "ONE" } } },
      { id: "n8", type: "queue", position: { x: 960, y: 240 }, data: { label: "Engagement Stream", variant: "kafka", config: { partitions: 500, retentionHours: 72, replicationFactor: 3 } } },
      { id: "n9", type: "worker", position: { x: 1200, y: 100 }, data: { label: "Ranking Model", variant: "python", config: { instances: 50, cpu: 16, memoryMb: 32768, runtime: "3.12" } } },
      { id: "n10", type: "worker", position: { x: 1200, y: 380 }, data: { label: "Trend Aggregator", variant: "go", config: { instances: 20, cpu: 4, memoryMb: 2048 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "watch" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "API" } },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", data: { label: "feed cache" } },
      { id: "e5", source: "n2", target: "n6" },
      { id: "e6", source: "n4", target: "n7" },
      { id: "e7", source: "n4", target: "n8", data: { label: "events" } },
      { id: "e8", source: "n8", target: "n9" },
      { id: "e9", source: "n8", target: "n10" },
      { id: "e10", source: "n9", target: "n5", data: { label: "warm cache" } },
    ],
  },
};

const redditAggregator: Template = {
  id: "reddit-aggregator",
  name: "Reddit Aggregator",
  description: "Discussion forum with voting, comment threads, and time-decay ranking.",
  category: "social",
  difficulty: "medium",
  tags: ["ranking", "comments", "voting", "scale-50M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "User", variant: "web-browser", config: { concurrentUsers: 2000000, reqPerSec: 40000, region: "global" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "CDN", variant: "cloudflare", config: { cacheTtlSec: 60 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "API", variant: "rest", config: { instances: 20, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n4", type: "cache", position: { x: 480, y: 100 }, data: { label: "Hot Posts Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n5", type: "database", position: { x: 480, y: 240 }, data: { label: "Posts/Comments DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 1500, connectionPool: 400, region: "us-east-1" } } },
      { id: "n6", type: "database", position: { x: 480, y: 380 }, data: { label: "Vote Counter", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "ONE" } } },
      { id: "n7", type: "queue", position: { x: 720, y: 240 }, data: { label: "Vote Events", variant: "kafka", config: { partitions: 24, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 960, y: 240 }, data: { label: "Ranking Worker", variant: "go", config: { instances: 8, cpu: 4, memoryMb: 1024 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n1", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "hot list" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "thread" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "vote +1" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "events" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n8", target: "n4", data: { label: "rerank" } },
    ],
  },
};

const slackMessaging: Template = {
  id: "slack-messaging",
  name: "Slack Team Messaging",
  description: "Channel-based team messaging with search, presence, threads, and file sharing.",
  category: "messaging",
  difficulty: "medium",
  tags: ["channels", "search", "presence", "files"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Web/Desktop", variant: "desktop-app", config: { concurrentUsers: 10000000, reqPerSec: 80000, os: "cross" } } },
      { id: "n2", type: "api", position: { x: 240, y: 60 }, data: { label: "WS Realtime", variant: "websocket", config: { instances: 30, maxConnections: 100000 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "REST API", variant: "rest", config: { instances: 20, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n4", type: "database", position: { x: 480, y: 60 }, data: { label: "Channel/Msg DB", variant: "mysql", config: { version: "8.0", replicas: 3, storageGb: 1000, connectionPool: 400 } } },
      { id: "n5", type: "database", position: { x: 480, y: 180 }, data: { label: "Search Index", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n6", type: "cache", position: { x: 480, y: 300 }, data: { label: "Presence", variant: "redis", config: { memoryGb: 16, evictionPolicy: "volatile-lru", persistence: "none", replicas: 2 } } },
      { id: "n7", type: "storage", position: { x: 480, y: 420 }, data: { label: "Files (S3)", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: true } } },
      { id: "n8", type: "queue", position: { x: 720, y: 240 }, data: { label: "Notification Queue", variant: "sqs", config: { region: "us-east-1", fifo: false, visibilityTimeoutSec: 30 } } },
      { id: "n9", type: "worker", position: { x: 960, y: 240 }, data: { label: "Notification Worker", variant: "nodejs", config: { instances: 6, cpu: 2, memoryMb: 1024, runtime: "22" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "WS" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "REST" } },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n4", data: { label: "history" } },
      { id: "e5", source: "n3", target: "n5", data: { label: "search" } },
      { id: "e6", source: "n2", target: "n6", data: { label: "presence" } },
      { id: "e7", source: "n3", target: "n7", data: { label: "upload" } },
      { id: "e8", source: "n4", target: "n8", data: { label: "events" } },
      { id: "e9", source: "n8", target: "n9" },
    ],
  },
};

const zoomVideo: Template = {
  id: "zoom-video",
  name: "Zoom Video Calls",
  description: "WebRTC video conferencing with signaling, SFU, recording, and meeting metadata.",
  category: "messaging",
  difficulty: "hard",
  tags: ["webrtc", "signaling", "recording", "scale-300M"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Participant", variant: "desktop-app", config: { concurrentUsers: 30000000, reqPerSec: 100000, os: "cross" } } },
      { id: "n2", type: "load_balancer", position: { x: 240, y: 150 }, data: { label: "Geo LB", variant: "cloudflare-lb", config: { sessionAffinity: false, healthCheck: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "Signaling Server", variant: "websocket", config: { instances: 50, maxConnections: 100000 } } },
      { id: "n4", type: "worker", position: { x: 480, y: 240 }, data: { label: "SFU Media Server", variant: "rust", config: { instances: 100, cpu: 16, memoryMb: 16384 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "Meeting DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 300, region: "us-east-1" } } },
      { id: "n6", type: "storage", position: { x: 720, y: 240 }, data: { label: "Recording S3", variant: "s3", config: { region: "us-east-1", storageClass: "ia", versioning: false } } },
      { id: "n7", type: "queue", position: { x: 960, y: 240 }, data: { label: "Transcode Queue", variant: "kafka", config: { partitions: 12, retentionHours: 48, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 1200, y: 240 }, data: { label: "Transcribe Worker", variant: "python", config: { instances: 20, cpu: 8, memoryMb: 8192, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "WebRTC" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "signaling" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "media" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "meeting state" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "recording" } },
      { id: "e6", source: "n6", target: "n7", data: { label: "process" } },
      { id: "e7", source: "n7", target: "n8" },
    ],
  },
};

const stripePayment: Template = {
  id: "stripe-payment",
  name: "Stripe Payment Processing",
  description: "Multi-tenant payment infrastructure: ledger, webhooks, fraud, card vault.",
  category: "fintech",
  difficulty: "hard",
  tags: ["payments", "webhooks", "ledger", "pci"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Merchant App", variant: "web-browser", config: { concurrentUsers: 1000000, reqPerSec: 50000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "API Gateway", variant: "api-gateway", config: { provider: "aws", rateLimit: 100000, auth: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 60 }, data: { label: "Charge Service", variant: "rest", config: { instances: 30, cpu: 4, memoryMb: 2048, rateLimit: 80000 } } },
      { id: "n4", type: "api", position: { x: 480, y: 240 }, data: { label: "Card Vault", variant: "rest", config: { instances: 10, cpu: 2, memoryMb: 1024, rateLimit: 20000 } } },
      { id: "n5", type: "database", position: { x: 720, y: 60 }, data: { label: "Ledger DB", variant: "postgres", config: { version: "16", replicas: 5, storageGb: 5000, connectionPool: 500, region: "us-east-1" } } },
      { id: "n6", type: "database", position: { x: 720, y: 240 }, data: { label: "Card Tokens", variant: "dynamodb", config: { region: "us-east-1", billingMode: "ondemand", rcu: 10000, wcu: 5000 } } },
      { id: "n7", type: "queue", position: { x: 960, y: 60 }, data: { label: "Webhook Queue", variant: "kafka", config: { partitions: 100, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 1200, y: 60 }, data: { label: "Webhook Dispatcher", variant: "go", config: { instances: 20, cpu: 4, memoryMb: 1024 } } },
      { id: "n9", type: "worker", position: { x: 960, y: 240 }, data: { label: "Fraud Detector (ML)", variant: "python", config: { instances: 15, cpu: 8, memoryMb: 16384, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "POST /charge" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "tokenize" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "write txn" } },
      { id: "e5", source: "n4", target: "n6" },
      { id: "e6", source: "n3", target: "n7", data: { label: "event" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n3", target: "n9", data: { label: "score" } },
    ],
  },
};

const shopifyEcommerce: Template = {
  id: "shopify-ecommerce",
  name: "Shopify E-commerce",
  description: "Multi-tenant storefronts: catalog, cart, checkout, fulfillment.",
  category: "marketplace",
  difficulty: "medium",
  tags: ["catalog", "cart", "checkout", "saas"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Storefront", variant: "web-browser", config: { concurrentUsers: 5000000, reqPerSec: 80000, region: "global" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "CDN", variant: "fastly", config: { popsCount: 60 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Storefront API", variant: "rest", config: { instances: 40, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n4", type: "database", position: { x: 480, y: 60 }, data: { label: "Catalog DB", variant: "mysql", config: { version: "8.0", replicas: 3, storageGb: 800, connectionPool: 300 } } },
      { id: "n5", type: "cache", position: { x: 480, y: 200 }, data: { label: "Cart Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "volatile-lru", persistence: "rdb", replicas: 2 } } },
      { id: "n6", type: "database", position: { x: 480, y: 340 }, data: { label: "Orders DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 1000, connectionPool: 300, region: "us-east-1" } } },
      { id: "n7", type: "external", position: { x: 720, y: 340 }, data: { label: "Stripe", variant: "payment-api", config: { provider: "stripe", slaMs: 500, rateLimit: 1000 } } },
      { id: "n8", type: "queue", position: { x: 960, y: 340 }, data: { label: "Order Events", variant: "kafka", config: { partitions: 48, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n9", type: "worker", position: { x: 1200, y: 340 }, data: { label: "Inventory Worker", variant: "nodejs", config: { instances: 6, cpu: 2, memoryMb: 1024, runtime: "22" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "assets" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "API" } },
      { id: "e3", source: "n3", target: "n4", data: { label: "products" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "cart" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "order" } },
      { id: "e6", source: "n6", target: "n7", data: { label: "charge" } },
      { id: "e7", source: "n6", target: "n8" },
      { id: "e8", source: "n8", target: "n9" },
    ],
  },
};

const coinbaseExchange: Template = {
  id: "coinbase-exchange",
  name: "Coinbase Crypto Exchange",
  description: "Crypto matching engine, custodial wallet, KYC, real-time market data.",
  category: "fintech",
  difficulty: "hard",
  tags: ["orderbook", "wallet", "kyc", "realtime"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Trader", variant: "web-browser", config: { concurrentUsers: 3000000, reqPerSec: 100000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 60 }, data: { label: "REST API", variant: "rest", config: { instances: 30, cpu: 4, memoryMb: 4096, rateLimit: 100000 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Market Data WS", variant: "websocket", config: { instances: 20, maxConnections: 200000 } } },
      { id: "n4", type: "worker", position: { x: 480, y: 60 }, data: { label: "Matching Engine", variant: "rust", config: { instances: 10, cpu: 16, memoryMb: 32768 } } },
      { id: "n5", type: "cache", position: { x: 480, y: 200 }, data: { label: "Order Book Cache", variant: "redis", config: { memoryGb: 64, evictionPolicy: "noeviction", persistence: "none", replicas: 3 } } },
      { id: "n6", type: "database", position: { x: 480, y: 340 }, data: { label: "Trade History", variant: "cassandra", config: { nodes: 12, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n7", type: "database", position: { x: 720, y: 60 }, data: { label: "Wallet DB (encrypted)", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 2000, connectionPool: 200, region: "us-east-1" } } },
      { id: "n8", type: "queue", position: { x: 720, y: 240 }, data: { label: "Trade Events", variant: "kafka", config: { partitions: 100, retentionHours: 720, replicationFactor: 3 } } },
      { id: "n9", type: "worker", position: { x: 960, y: 240 }, data: { label: "KYC/AML Worker", variant: "python", config: { instances: 8, cpu: 4, memoryMb: 4096, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "REST" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "market data" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "submit order" } },
      { id: "e4", source: "n4", target: "n5", data: { label: "update book" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "fill" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "settle" } },
      { id: "e7", source: "n4", target: "n8", data: { label: "broadcast" } },
      { id: "e8", source: "n3", target: "n5" },
      { id: "e9", source: "n8", target: "n9", data: { label: "screen" } },
    ],
  },
};

const pinterestBoards: Template = {
  id: "pinterest-boards",
  name: "Pinterest Image Boards",
  description: "Visual discovery with image search, recommendations, and curated boards.",
  category: "social",
  difficulty: "medium",
  tags: ["search", "recommendation", "cdn", "images"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "User", variant: "mobile-app", config: { concurrentUsers: 5000000, reqPerSec: 80000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Image CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Discovery API", variant: "rest", config: { instances: 30, cpu: 4, memoryMb: 2048, rateLimit: 60000 } } },
      { id: "n4", type: "storage", position: { x: 480, y: 60 }, data: { label: "Pins (S3)", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n5", type: "database", position: { x: 480, y: 200 }, data: { label: "Pin Metadata", variant: "mysql", config: { version: "8.0", replicas: 3, storageGb: 1000, connectionPool: 300 } } },
      { id: "n6", type: "cache", position: { x: 480, y: 340 }, data: { label: "Recommendations Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 2 } } },
      { id: "n7", type: "queue", position: { x: 720, y: 200 }, data: { label: "Engagement Events", variant: "kafka", config: { partitions: 48, retentionHours: 72, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 960, y: 200 }, data: { label: "Visual Search ML", variant: "python", config: { instances: 15, cpu: 8, memoryMb: 16384, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "images" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "feed" } },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n5", data: { label: "metadata" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "recs" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "events" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n8", target: "n6", data: { label: "write recs" } },
    ],
  },
};

const linkedinNetwork: Template = {
  id: "linkedin-network",
  name: "LinkedIn Professional Network",
  description: "Professional graph, feed, search, and messaging with skill endorsements.",
  category: "social",
  difficulty: "medium",
  tags: ["graph", "feed", "search", "messaging"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "User", variant: "web-browser", config: { concurrentUsers: 8000000, reqPerSec: 120000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 60 }, data: { label: "Feed API", variant: "rest", config: { instances: 40, cpu: 4, memoryMb: 2048, rateLimit: 80000 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "GraphQL API", variant: "graphql", config: { instances: 20, cpu: 4, memoryMb: 2048, maxDepth: 8 } } },
      { id: "n4", type: "database", position: { x: 480, y: 60 }, data: { label: "Profile DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 2000, connectionPool: 400, region: "us-east-1" } } },
      { id: "n5", type: "database", position: { x: 480, y: 200 }, data: { label: "Connection Graph", variant: "cassandra", config: { nodes: 12, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n6", type: "cache", position: { x: 480, y: 340 }, data: { label: "Feed Cache", variant: "redis", config: { memoryGb: 64, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n7", type: "queue", position: { x: 720, y: 240 }, data: { label: "Activity Events", variant: "kafka", config: { partitions: 100, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 960, y: 240 }, data: { label: "Feed Builder", variant: "go", config: { instances: 12, cpu: 4, memoryMb: 2048 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "feed" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "graphql" } },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n5", data: { label: "connections" } },
      { id: "e5", source: "n2", target: "n6", data: { label: "cache read" } },
      { id: "e6", source: "n2", target: "n7", data: { label: "post action" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n8", target: "n6", data: { label: "warm" } },
    ],
  },
};

const dropboxSync: Template = {
  id: "dropbox-sync",
  name: "Dropbox File Sync",
  description: "File sync with chunking, deduplication, and conflict resolution.",
  category: "infra",
  difficulty: "hard",
  tags: ["sync", "chunking", "dedup", "object-storage"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Desktop Client", variant: "desktop-app", config: { concurrentUsers: 5000000, reqPerSec: 40000, os: "cross" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "Sync API", variant: "rest", config: { instances: 30, cpu: 4, memoryMb: 4096, rateLimit: 60000 } } },
      { id: "n3", type: "cache", position: { x: 480, y: 60 }, data: { label: "Chunk Hash Dedup", variant: "redis", config: { memoryGb: 64, evictionPolicy: "noeviction", persistence: "rdb", replicas: 3 } } },
      { id: "n4", type: "database", position: { x: 480, y: 200 }, data: { label: "Metadata DB", variant: "mysql", config: { version: "8.0", replicas: 3, storageGb: 2000, connectionPool: 400 } } },
      { id: "n5", type: "storage", position: { x: 480, y: 340 }, data: { label: "Chunk Storage", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: true } } },
      { id: "n6", type: "queue", position: { x: 720, y: 200 }, data: { label: "Sync Events", variant: "kafka", config: { partitions: 48, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n7", type: "worker", position: { x: 960, y: 200 }, data: { label: "Notification Push", variant: "go", config: { instances: 8, cpu: 2, memoryMb: 512 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "upload chunks" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "dedup check" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "metadata" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "store chunk" } },
      { id: "e5", source: "n2", target: "n6", data: { label: "notify peers" } },
      { id: "e6", source: "n6", target: "n7" },
      { id: "e7", source: "n7", target: "n1", data: { label: "WS push" } },
    ],
  },
};

const yelpLocal: Template = {
  id: "yelp-local",
  name: "Yelp Local Search",
  description: "Local business directory with geo search, reviews, and photo galleries.",
  category: "marketplace",
  difficulty: "medium",
  tags: ["geo", "reviews", "ranking", "search"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Mobile User", variant: "mobile-app", config: { concurrentUsers: 2000000, reqPerSec: 30000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Image CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Search API", variant: "rest", config: { instances: 20, cpu: 4, memoryMb: 2048, rateLimit: 40000 } } },
      { id: "n4", type: "database", position: { x: 480, y: 60 }, data: { label: "Business DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 300, region: "us-east-1" } } },
      { id: "n5", type: "database", position: { x: 480, y: 200 }, data: { label: "Geo Index (ES)", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n6", type: "database", position: { x: 480, y: 340 }, data: { label: "Reviews DB", variant: "mysql", config: { version: "8.0", replicas: 3, storageGb: 800, connectionPool: 300 } } },
      { id: "n7", type: "storage", position: { x: 720, y: 60 }, data: { label: "Photos (S3)", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n8", type: "queue", position: { x: 720, y: 340 }, data: { label: "Review Moderation", variant: "sqs", config: { region: "us-east-1", fifo: false, visibilityTimeoutSec: 60 } } },
      { id: "n9", type: "worker", position: { x: 960, y: 340 }, data: { label: "Moderation ML", variant: "python", config: { instances: 4, cpu: 4, memoryMb: 4096, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n1", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "business" } },
      { id: "e4", source: "n3", target: "n5", data: { label: "geo query" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "reviews" } },
      { id: "e6", source: "n2", target: "n7" },
      { id: "e7", source: "n6", target: "n8", data: { label: "new review" } },
      { id: "e8", source: "n8", target: "n9" },
    ],
  },
};

const robinhoodTrading: Template = {
  id: "robinhood-trading",
  name: "Robinhood Trading",
  description: "Equity trading: order routing, market data, brokerage integration.",
  category: "fintech",
  difficulty: "hard",
  tags: ["orderbook", "market-data", "realtime", "brokerage"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Trader App", variant: "mobile-app", config: { concurrentUsers: 5000000, reqPerSec: 150000, platforms: "both" } } },
      { id: "n2", type: "api", position: { x: 240, y: 60 }, data: { label: "Quote WS", variant: "websocket", config: { instances: 30, maxConnections: 200000 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Order REST API", variant: "rest", config: { instances: 20, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n4", type: "cache", position: { x: 480, y: 60 }, data: { label: "Quote Cache", variant: "redis", config: { memoryGb: 32, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n5", type: "database", position: { x: 480, y: 200 }, data: { label: "Orders DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 1000, connectionPool: 300, region: "us-east-1" } } },
      { id: "n6", type: "queue", position: { x: 720, y: 60 }, data: { label: "Market Data Stream", variant: "kafka", config: { partitions: 200, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n7", type: "queue", position: { x: 720, y: 240 }, data: { label: "Order Events", variant: "kafka", config: { partitions: 48, retentionHours: 720, replicationFactor: 3 } } },
      { id: "n8", type: "external", position: { x: 960, y: 240 }, data: { label: "Brokerage / Clearing", variant: "custom-third-party", config: { baseUrl: "https://broker.example.com", slaMs: 100, rateLimit: 10000 } } },
      { id: "n9", type: "worker", position: { x: 1200, y: 60 }, data: { label: "Market Data Ingest", variant: "rust", config: { instances: 5, cpu: 8, memoryMb: 4096 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "quotes" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "buy/sell" } },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n5", data: { label: "persist" } },
      { id: "e5", source: "n3", target: "n7", data: { label: "submit" } },
      { id: "e6", source: "n9", target: "n6", data: { label: "ticks" } },
      { id: "e7", source: "n6", target: "n4", data: { label: "warm" } },
      { id: "e8", source: "n7", target: "n8", data: { label: "route" } },
    ],
  },
};

export const REAL_WORLD_APPS: Template[] = [
  // Original 10
  urlShortener,
  twitterTimeline,
  instagramFeed,
  uberDispatch,
  netflixStreaming,
  whatsappChat,
  distributedCache,
  adServing,
  videoUpload,
  paymentSystem,
  // Phase 2: 15 new
  spotifyMusic,
  discordChat,
  airbnbMarketplace,
  tiktokFeed,
  redditAggregator,
  slackMessaging,
  zoomVideo,
  stripePayment,
  shopifyEcommerce,
  coinbaseExchange,
  pinterestBoards,
  linkedinNetwork,
  dropboxSync,
  yelpLocal,
  robinhoodTrading,
];
