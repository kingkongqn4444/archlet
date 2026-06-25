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

export const REAL_WORLD_APPS: Template[] = [
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
];
