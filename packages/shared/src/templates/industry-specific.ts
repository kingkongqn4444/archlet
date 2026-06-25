import type { Template } from "./types";

const healthcareEhrFhir: Template = {
  id: "healthcare-ehr-fhir",
  name: "Healthcare EHR (FHIR)",
  description: "HIPAA-compliant Electronic Health Records with FHIR API and immutable audit log.",
  category: "healthcare",
  difficulty: "hard",
  tags: ["hipaa", "fhir", "audit", "phi"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Clinician Portal", variant: "web-browser", config: { concurrentUsers: 50000, reqPerSec: 3000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "FHIR API Gateway", variant: "api-gateway", config: { provider: "aws", rateLimit: 10000, auth: true } } },
      { id: "n3", type: "api", position: { x: 480, y: 80 }, data: { label: "EHR Service", variant: "rest", config: { instances: 10, cpu: 4, memoryMb: 2048, rateLimit: 8000 } } },
      { id: "n4", type: "database", position: { x: 720, y: 80 }, data: { label: "PHI Store (Encrypted)", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 2000, connectionPool: 200, region: "us-east-1" } } },
      { id: "n5", type: "queue", position: { x: 480, y: 320 }, data: { label: "Audit Log Queue", variant: "kafka", config: { partitions: 12, retentionHours: 8760, replicationFactor: 3 } } },
      { id: "n6", type: "database", position: { x: 720, y: 320 }, data: { label: "Audit Log (immutable)", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n7", type: "storage", position: { x: 960, y: 80 }, data: { label: "Imaging DICOM (S3)", variant: "s3", config: { region: "us-east-1", storageClass: "ia", versioning: true } } },
      { id: "n8", type: "worker", position: { x: 960, y: 320 }, data: { label: "Audit Indexer", variant: "go", config: { instances: 3, cpu: 2, memoryMb: 1024 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "FHIR Bundle" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "PHI read/write" } },
      { id: "e4", source: "n3", target: "n7", data: { label: "imaging" } },
      { id: "e5", source: "n3", target: "n5", data: { label: "access event" } },
      { id: "e6", source: "n5", target: "n6" },
      { id: "e7", source: "n5", target: "n8" },
    ],
  },
};

const telemedicinePlatform: Template = {
  id: "telemedicine-platform",
  name: "Telemedicine Platform",
  description: "Video consultations + EHR integration + appointment scheduling.",
  category: "healthcare",
  difficulty: "hard",
  tags: ["video", "ehr", "scheduling", "hipaa"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 60 }, data: { label: "Patient App", variant: "mobile-app", config: { concurrentUsers: 200000, reqPerSec: 5000, platforms: "both" } } },
      { id: "n2", type: "user", position: { x: 0, y: 240 }, data: { label: "Doctor App", variant: "desktop-app", config: { concurrentUsers: 20000, reqPerSec: 500, os: "cross" } } },
      { id: "n3", type: "api", position: { x: 240, y: 150 }, data: { label: "Signaling API", variant: "websocket", config: { instances: 10, maxConnections: 50000 } } },
      { id: "n4", type: "worker", position: { x: 480, y: 60 }, data: { label: "Video SFU", variant: "rust", config: { instances: 20, cpu: 8, memoryMb: 4096 } } },
      { id: "n5", type: "api", position: { x: 480, y: 240 }, data: { label: "Booking Service", variant: "rest", config: { instances: 4, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n6", type: "database", position: { x: 720, y: 240 }, data: { label: "Appointments DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 200, connectionPool: 100, region: "us-east-1" } } },
      { id: "n7", type: "external", position: { x: 720, y: 360 }, data: { label: "EHR FHIR API", variant: "custom-third-party", config: { baseUrl: "https://ehr.example.com/fhir", slaMs: 1000, rateLimit: 1000 } } },
      { id: "n8", type: "storage", position: { x: 960, y: 60 }, data: { label: "Recording S3 (encrypted)", variant: "s3", config: { region: "us-east-1", storageClass: "ia", versioning: true } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3", data: { label: "WS" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", data: { label: "media" } },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n5", target: "n6" },
      { id: "e6", source: "n5", target: "n7", data: { label: "patient records" } },
      { id: "e7", source: "n4", target: "n8", data: { label: "record session" } },
    ],
  },
};

const fintechOpenBanking: Template = {
  id: "fintech-open-banking",
  name: "FinTech Open Banking",
  description: "PSD2-compliant aggregator: OAuth consent, account info, payment initiation.",
  category: "fintech",
  difficulty: "hard",
  tags: ["psd2", "oauth", "ledger", "open-banking"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "End User", variant: "web-browser", config: { concurrentUsers: 500000, reqPerSec: 10000, region: "eu-west-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "Aggregator API", variant: "rest", config: { instances: 10, cpu: 4, memoryMb: 2048, rateLimit: 20000 } } },
      { id: "n3", type: "external", position: { x: 480, y: 60 }, data: { label: "Bank OAuth (PSD2)", variant: "oauth-provider", config: { provider: "google" } } },
      { id: "n4", type: "external", position: { x: 480, y: 200 }, data: { label: "Bank AISP API", variant: "custom-third-party", config: { baseUrl: "https://bank.example.com/aisp", slaMs: 1000, rateLimit: 500 } } },
      { id: "n5", type: "external", position: { x: 480, y: 340 }, data: { label: "Bank PISP API", variant: "custom-third-party", config: { baseUrl: "https://bank.example.com/pisp", slaMs: 1500, rateLimit: 300 } } },
      { id: "n6", type: "database", position: { x: 720, y: 100 }, data: { label: "Consent Store", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 100, connectionPool: 200, region: "eu-west-1" } } },
      { id: "n7", type: "database", position: { x: 720, y: 240 }, data: { label: "Aggregated Ledger", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 200, region: "eu-west-1" } } },
      { id: "n8", type: "queue", position: { x: 960, y: 240 }, data: { label: "Webhook Notifications", variant: "kafka", config: { partitions: 24, retentionHours: 168, replicationFactor: 3 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "consent flow" } },
      { id: "e3", source: "n3", target: "n6", data: { label: "store consent" } },
      { id: "e4", source: "n2", target: "n4", data: { label: "fetch accounts" } },
      { id: "e5", source: "n2", target: "n5", data: { label: "initiate pay" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "aggregate" } },
      { id: "e7", source: "n5", target: "n8", data: { label: "status" } },
    ],
  },
};

const insuranceClaims: Template = {
  id: "insurance-claims",
  name: "Insurance Claims Processing",
  description: "Claims intake with OCR document parsing, fraud screening, and workflow approval.",
  category: "fintech",
  difficulty: "medium",
  tags: ["workflow", "ocr", "fraud", "insurance"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Claimant Portal", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 1000, region: "us-east-1" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "Claims API", variant: "rest", config: { instances: 6, cpu: 2, memoryMb: 1024, rateLimit: 3000 } } },
      { id: "n3", type: "storage", position: { x: 480, y: 60 }, data: { label: "Documents S3", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: true } } },
      { id: "n4", type: "database", position: { x: 480, y: 240 }, data: { label: "Claims DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 500, connectionPool: 200, region: "us-east-1" } } },
      { id: "n5", type: "queue", position: { x: 720, y: 100 }, data: { label: "Processing Queue", variant: "sqs", config: { region: "us-east-1", fifo: false, visibilityTimeoutSec: 300 } } },
      { id: "n6", type: "worker", position: { x: 960, y: 60 }, data: { label: "OCR Worker", variant: "python", config: { instances: 4, cpu: 4, memoryMb: 4096, runtime: "3.12" } } },
      { id: "n7", type: "worker", position: { x: 960, y: 180 }, data: { label: "Fraud Detector", variant: "python", config: { instances: 4, cpu: 8, memoryMb: 8192, runtime: "3.12" } } },
      { id: "n8", type: "worker", position: { x: 960, y: 300 }, data: { label: "Adjuster Workflow", variant: "nodejs", config: { instances: 3, cpu: 2, memoryMb: 1024, runtime: "22" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "file claim" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "upload docs" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "create claim" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "queue" } },
      { id: "e5", source: "n5", target: "n6" },
      { id: "e6", source: "n5", target: "n7" },
      { id: "e7", source: "n5", target: "n8" },
    ],
  },
};

const edtechLms: Template = {
  id: "edtech-lms",
  name: "EdTech LMS",
  description: "Learning Management System: courses, video lectures, quizzes, gradebook.",
  category: "edtech",
  difficulty: "medium",
  tags: ["course", "video", "assessment", "lms"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 60 }, data: { label: "Student", variant: "web-browser", config: { concurrentUsers: 1000000, reqPerSec: 20000, region: "global" } } },
      { id: "n2", type: "user", position: { x: 0, y: 240 }, data: { label: "Instructor", variant: "desktop-app", config: { concurrentUsers: 50000, reqPerSec: 2000, os: "cross" } } },
      { id: "n3", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Video CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n4", type: "api", position: { x: 240, y: 240 }, data: { label: "LMS API", variant: "rest", config: { instances: 15, cpu: 4, memoryMb: 2048, rateLimit: 30000 } } },
      { id: "n5", type: "storage", position: { x: 480, y: 60 }, data: { label: "Lecture Videos S3", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n6", type: "database", position: { x: 480, y: 200 }, data: { label: "Course/Grade DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 500, connectionPool: 200, region: "us-east-1" } } },
      { id: "n7", type: "cache", position: { x: 480, y: 340 }, data: { label: "Quiz Session Cache", variant: "redis", config: { memoryGb: 16, evictionPolicy: "volatile-lru", persistence: "rdb", replicas: 2 } } },
      { id: "n8", type: "queue", position: { x: 720, y: 240 }, data: { label: "Progress Events", variant: "kafka", config: { partitions: 24, retentionHours: 720, replicationFactor: 3 } } },
      { id: "n9", type: "worker", position: { x: 960, y: 240 }, data: { label: "Auto-grade Worker", variant: "python", config: { instances: 4, cpu: 2, memoryMb: 2048, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3", data: { label: "video" } },
      { id: "e2", source: "n1", target: "n4" },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n4", target: "n6", data: { label: "courses" } },
      { id: "e6", source: "n4", target: "n7", data: { label: "quiz" } },
      { id: "e7", source: "n4", target: "n8", data: { label: "progress" } },
      { id: "e8", source: "n8", target: "n9" },
    ],
  },
};

const multiplayerGameBackend: Template = {
  id: "multiplayer-game-backend",
  name: "Multiplayer Game Backend",
  description: "Matchmaking, real-time game state, leaderboards, anti-cheat.",
  category: "gaming",
  difficulty: "hard",
  tags: ["realtime", "matchmaking", "leaderboard", "udp"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Game Client", variant: "desktop-app", config: { concurrentUsers: 2000000, reqPerSec: 100000, os: "cross" } } },
      { id: "n2", type: "api", position: { x: 240, y: 60 }, data: { label: "Matchmaking API", variant: "rest", config: { instances: 10, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Game WS Server", variant: "websocket", config: { instances: 50, maxConnections: 50000 } } },
      { id: "n4", type: "worker", position: { x: 480, y: 60 }, data: { label: "Matchmaker Worker", variant: "go", config: { instances: 5, cpu: 4, memoryMb: 1024 } } },
      { id: "n5", type: "cache", position: { x: 480, y: 240 }, data: { label: "Match State (Redis)", variant: "redis", config: { memoryGb: 32, evictionPolicy: "volatile-ttl", persistence: "none", replicas: 3 } } },
      { id: "n6", type: "database", position: { x: 720, y: 60 }, data: { label: "Player Profile DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 800, connectionPool: 300, region: "us-east-1" } } },
      { id: "n7", type: "database", position: { x: 720, y: 240 }, data: { label: "Leaderboard (Sorted Set)", variant: "redis", config: { memoryGb: 16, evictionPolicy: "noeviction", persistence: "rdb", replicas: 2 } } },
      { id: "n8", type: "queue", position: { x: 960, y: 240 }, data: { label: "Telemetry Stream", variant: "kafka", config: { partitions: 200, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n9", type: "worker", position: { x: 1200, y: 240 }, data: { label: "Anti-cheat ML", variant: "python", config: { instances: 6, cpu: 8, memoryMb: 16384, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "find match" } },
      { id: "e2", source: "n2", target: "n4" },
      { id: "e3", source: "n4", target: "n5", data: { label: "create lobby" } },
      { id: "e4", source: "n1", target: "n3", data: { label: "game tick" } },
      { id: "e5", source: "n3", target: "n5", data: { label: "match state" } },
      { id: "e6", source: "n3", target: "n6", data: { label: "save stats" } },
      { id: "e7", source: "n3", target: "n7", data: { label: "score" } },
      { id: "e8", source: "n3", target: "n8", data: { label: "telemetry" } },
      { id: "e9", source: "n8", target: "n9" },
    ],
  },
};

const iotTelemetryPipeline: Template = {
  id: "iot-telemetry-pipeline",
  name: "IoT Telemetry Pipeline",
  description: "Edge devices → MQTT broker → timeseries DB → alerting + dashboard.",
  category: "iot",
  difficulty: "hard",
  tags: ["mqtt", "timeseries", "alerting", "edge"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "IoT Device Fleet", variant: "desktop-app", config: { concurrentUsers: 10000000, reqPerSec: 500000, os: "linux" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "MQTT Broker", variant: "websocket", config: { instances: 30, maxConnections: 500000 } } },
      { id: "n3", type: "queue", position: { x: 480, y: 150 }, data: { label: "Telemetry Stream", variant: "kafka", config: { partitions: 200, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n4", type: "worker", position: { x: 720, y: 60 }, data: { label: "Timeseries Writer", variant: "rust", config: { instances: 10, cpu: 4, memoryMb: 2048 } } },
      { id: "n5", type: "database", position: { x: 960, y: 60 }, data: { label: "Timeseries DB", variant: "cassandra", config: { nodes: 12, replicationFactor: 3, consistencyLevel: "ONE" } } },
      { id: "n6", type: "worker", position: { x: 720, y: 240 }, data: { label: "Alert Rules Engine", variant: "go", config: { instances: 6, cpu: 2, memoryMb: 1024 } } },
      { id: "n7", type: "external", position: { x: 960, y: 240 }, data: { label: "PagerDuty", variant: "custom-third-party", config: { baseUrl: "https://api.pagerduty.com", slaMs: 500, rateLimit: 100 } } },
      { id: "n8", type: "api", position: { x: 720, y: 360 }, data: { label: "Dashboard API", variant: "rest", config: { instances: 5, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "MQTT" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", data: { label: "write" } },
      { id: "e5", source: "n3", target: "n6", data: { label: "evaluate" } },
      { id: "e6", source: "n6", target: "n7", data: { label: "page" } },
      { id: "e7", source: "n8", target: "n5", data: { label: "query" } },
    ],
  },
};

const logisticsTracking: Template = {
  id: "logistics-tracking",
  name: "Logistics Tracking",
  description: "GPS tracking + route planning + ETA prediction for delivery fleet.",
  category: "logistics",
  difficulty: "medium",
  tags: ["gps", "route", "eta", "fleet"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 60 }, data: { label: "Driver App", variant: "mobile-app", config: { concurrentUsers: 100000, reqPerSec: 50000, platforms: "android" } } },
      { id: "n2", type: "user", position: { x: 0, y: 240 }, data: { label: "Customer App", variant: "mobile-app", config: { concurrentUsers: 5000000, reqPerSec: 30000, platforms: "both" } } },
      { id: "n3", type: "api", position: { x: 240, y: 60 }, data: { label: "Telemetry Ingest", variant: "rest", config: { instances: 10, cpu: 2, memoryMb: 1024, rateLimit: 100000 } } },
      { id: "n4", type: "api", position: { x: 240, y: 240 }, data: { label: "Tracking API", variant: "rest", config: { instances: 6, cpu: 2, memoryMb: 1024, rateLimit: 40000 } } },
      { id: "n5", type: "cache", position: { x: 480, y: 60 }, data: { label: "Current Location Geo Cache", variant: "redis", config: { memoryGb: 16, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 2 } } },
      { id: "n6", type: "database", position: { x: 480, y: 240 }, data: { label: "Shipment DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 500, connectionPool: 200, region: "us-east-1" } } },
      { id: "n7", type: "queue", position: { x: 720, y: 60 }, data: { label: "Location Events", variant: "kafka", config: { partitions: 48, retentionHours: 24, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 960, y: 60 }, data: { label: "ETA Predictor", variant: "python", config: { instances: 6, cpu: 4, memoryMb: 4096, runtime: "3.12" } } },
      { id: "n9", type: "worker", position: { x: 960, y: 240 }, data: { label: "Route Optimizer", variant: "rust", config: { instances: 4, cpu: 4, memoryMb: 2048 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3", data: { label: "ping" } },
      { id: "e2", source: "n3", target: "n5" },
      { id: "e3", source: "n3", target: "n7" },
      { id: "e4", source: "n2", target: "n4" },
      { id: "e5", source: "n4", target: "n5", data: { label: "where?" } },
      { id: "e6", source: "n4", target: "n6", data: { label: "shipment" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n7", target: "n9" },
    ],
  },
};

const travelBookingOta: Template = {
  id: "travel-booking-ota",
  name: "Travel Booking (OTA)",
  description: "Multi-supplier flight/hotel search, hold inventory, payment + booking confirmation.",
  category: "marketplace",
  difficulty: "hard",
  tags: ["search", "inventory", "payment", "supplier-api"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Traveler", variant: "web-browser", config: { concurrentUsers: 2000000, reqPerSec: 50000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "Search API", variant: "rest", config: { instances: 30, cpu: 4, memoryMb: 2048, rateLimit: 50000 } } },
      { id: "n3", type: "cache", position: { x: 480, y: 60 }, data: { label: "Search Result Cache", variant: "redis", config: { memoryGb: 64, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 3 } } },
      { id: "n4", type: "external", position: { x: 480, y: 200 }, data: { label: "GDS / Amadeus", variant: "custom-third-party", config: { baseUrl: "https://gds.example.com", slaMs: 2000, rateLimit: 500 } } },
      { id: "n5", type: "external", position: { x: 480, y: 340 }, data: { label: "Hotel Aggregator", variant: "custom-third-party", config: { baseUrl: "https://hotels.example.com", slaMs: 1500, rateLimit: 1000 } } },
      { id: "n6", type: "api", position: { x: 720, y: 200 }, data: { label: "Booking Service", variant: "rest", config: { instances: 10, cpu: 4, memoryMb: 2048, rateLimit: 10000 } } },
      { id: "n7", type: "database", position: { x: 960, y: 200 }, data: { label: "Booking DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 800, connectionPool: 300, region: "us-east-1" } } },
      { id: "n8", type: "external", position: { x: 720, y: 360 }, data: { label: "Payment Gateway", variant: "payment-api", config: { provider: "stripe", slaMs: 500, rateLimit: 2000 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "search" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "cache hit?" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "flights" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "hotels" } },
      { id: "e5", source: "n2", target: "n6", data: { label: "book" } },
      { id: "e6", source: "n6", target: "n7" },
      { id: "e7", source: "n6", target: "n8", data: { label: "charge" } },
    ],
  },
};

const realEstateListings: Template = {
  id: "real-estate-listings",
  name: "Real Estate Listings",
  description: "Property search with geo + filters, image galleries, agent contact.",
  category: "marketplace",
  difficulty: "medium",
  tags: ["search", "geo", "images", "real-estate"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Home Buyer", variant: "mobile-app", config: { concurrentUsers: 1500000, reqPerSec: 20000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 60 }, data: { label: "Image CDN", variant: "cloudfront", config: { priceClass: "all" } } },
      { id: "n3", type: "api", position: { x: 240, y: 240 }, data: { label: "Search API", variant: "rest", config: { instances: 15, cpu: 4, memoryMb: 2048, rateLimit: 30000 } } },
      { id: "n4", type: "database", position: { x: 480, y: 60 }, data: { label: "Listing DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 800, connectionPool: 300, region: "us-east-1" } } },
      { id: "n5", type: "database", position: { x: 480, y: 200 }, data: { label: "Geo / Filter Index", variant: "cassandra", config: { nodes: 6, replicationFactor: 3, consistencyLevel: "QUORUM" } } },
      { id: "n6", type: "storage", position: { x: 720, y: 60 }, data: { label: "Property Photos S3", variant: "s3", config: { region: "us-east-1", storageClass: "standard", versioning: false } } },
      { id: "n7", type: "queue", position: { x: 480, y: 340 }, data: { label: "Lead Events", variant: "sqs", config: { region: "us-east-1", fifo: false, visibilityTimeoutSec: 60 } } },
      { id: "n8", type: "external", position: { x: 720, y: 340 }, data: { label: "Email/SMS", variant: "email-service", config: { provider: "sendgrid", rateLimit: 500 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "photos" } },
      { id: "e2", source: "n1", target: "n3", data: { label: "search" } },
      { id: "e3", source: "n2", target: "n6" },
      { id: "e4", source: "n3", target: "n4" },
      { id: "e5", source: "n3", target: "n5", data: { label: "geo filter" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "agent lead" } },
      { id: "e7", source: "n7", target: "n8" },
    ],
  },
};

const musicRoyalty: Template = {
  id: "music-royalty",
  name: "Music Royalty Distribution",
  description: "Calculate per-play royalties + micropayments to artists across labels.",
  category: "fintech",
  difficulty: "hard",
  tags: ["ledger", "micropayments", "royalty"],
  diagram: {
    nodes: [
      { id: "n1", type: "queue", position: { x: 0, y: 150 }, data: { label: "Play Events", variant: "kafka", config: { partitions: 200, retentionHours: 720, replicationFactor: 3 } } },
      { id: "n2", type: "worker", position: { x: 240, y: 150 }, data: { label: "Royalty Calculator", variant: "rust", config: { instances: 10, cpu: 8, memoryMb: 8192 } } },
      { id: "n3", type: "database", position: { x: 480, y: 60 }, data: { label: "Rights Registry", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 200, connectionPool: 200, region: "us-east-1" } } },
      { id: "n4", type: "database", position: { x: 480, y: 240 }, data: { label: "Royalty Ledger", variant: "postgres", config: { version: "16", replicas: 5, storageGb: 2000, connectionPool: 300, region: "us-east-1" } } },
      { id: "n5", type: "queue", position: { x: 720, y: 240 }, data: { label: "Payout Queue", variant: "sqs", config: { region: "us-east-1", fifo: true, visibilityTimeoutSec: 60 } } },
      { id: "n6", type: "worker", position: { x: 960, y: 240 }, data: { label: "Payout Dispatcher", variant: "nodejs", config: { instances: 4, cpu: 2, memoryMb: 1024, runtime: "22" } } },
      { id: "n7", type: "external", position: { x: 1200, y: 240 }, data: { label: "Bank ACH / Wise", variant: "payment-api", config: { provider: "stripe", slaMs: 2000, rateLimit: 200 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "lookup rights" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "credit artist" } },
      { id: "e4", source: "n4", target: "n5", data: { label: "monthly payout" } },
      { id: "e5", source: "n5", target: "n6" },
      { id: "e6", source: "n6", target: "n7", data: { label: "transfer" } },
    ],
  },
};

const liveAuction: Template = {
  id: "live-auction",
  name: "Live Auction Platform",
  description: "Real-time bidding with WebSocket, bid validation, payment on close.",
  category: "marketplace",
  difficulty: "hard",
  tags: ["realtime", "bidding", "payment", "auction"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Bidder", variant: "web-browser", config: { concurrentUsers: 500000, reqPerSec: 30000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "Bid WS", variant: "websocket", config: { instances: 20, maxConnections: 50000 } } },
      { id: "n3", type: "worker", position: { x: 480, y: 60 }, data: { label: "Bid Validator", variant: "go", config: { instances: 8, cpu: 4, memoryMb: 1024 } } },
      { id: "n4", type: "cache", position: { x: 480, y: 240 }, data: { label: "Auction State", variant: "redis", config: { memoryGb: 16, evictionPolicy: "noeviction", persistence: "aof", replicas: 3 } } },
      { id: "n5", type: "database", position: { x: 720, y: 240 }, data: { label: "Auction DB", variant: "postgres", config: { version: "16", replicas: 3, storageGb: 200, connectionPool: 200, region: "us-east-1" } } },
      { id: "n6", type: "queue", position: { x: 960, y: 240 }, data: { label: "Close Events", variant: "kafka", config: { partitions: 12, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n7", type: "external", position: { x: 1200, y: 240 }, data: { label: "Payment Gateway", variant: "payment-api", config: { provider: "stripe", slaMs: 500, rateLimit: 1000 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "bid" } },
      { id: "e2", source: "n2", target: "n3", data: { label: "validate" } },
      { id: "e3", source: "n3", target: "n4", data: { label: "CAS highest" } },
      { id: "e4", source: "n4", target: "n5", data: { label: "persist" } },
      { id: "e5", source: "n5", target: "n6", data: { label: "auction close" } },
      { id: "e6", source: "n6", target: "n7", data: { label: "charge winner" } },
    ],
  },
};

const loyaltyRewards: Template = {
  id: "loyalty-rewards",
  name: "Loyalty / Rewards Program",
  description: "Earn / redeem points, tier promotions, partner integrations.",
  category: "fintech",
  difficulty: "easy",
  tags: ["points", "redemption", "loyalty"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Customer App", variant: "mobile-app", config: { concurrentUsers: 1000000, reqPerSec: 5000, platforms: "both" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "Loyalty API", variant: "rest", config: { instances: 5, cpu: 2, memoryMb: 1024, rateLimit: 5000 } } },
      { id: "n3", type: "database", position: { x: 480, y: 60 }, data: { label: "Points Ledger", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 300, connectionPool: 150, region: "us-east-1" } } },
      { id: "n4", type: "cache", position: { x: 480, y: 240 }, data: { label: "Balance Cache", variant: "redis", config: { memoryGb: 8, evictionPolicy: "allkeys-lru", persistence: "rdb", replicas: 1 } } },
      { id: "n5", type: "queue", position: { x: 720, y: 240 }, data: { label: "Earn Events", variant: "kafka", config: { partitions: 12, retentionHours: 168, replicationFactor: 3 } } },
      { id: "n6", type: "worker", position: { x: 960, y: 240 }, data: { label: "Tier Promotion Worker", variant: "nodejs", config: { instances: 2, cpu: 1, memoryMb: 512, runtime: "22" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", data: { label: "earn/redeem" } },
      { id: "e3", source: "n2", target: "n4", data: { label: "balance" } },
      { id: "e4", source: "n2", target: "n5", data: { label: "events" } },
      { id: "e5", source: "n5", target: "n6" },
      { id: "e6", source: "n6", target: "n3", data: { label: "tier update" } },
    ],
  },
};

const smartHomeHub: Template = {
  id: "smart-home-hub",
  name: "Smart Home Hub",
  description: "Device control via mobile, automation rules, voice assistant integration.",
  category: "iot",
  difficulty: "medium",
  tags: ["iot", "automation", "mobile", "smart-home"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 60 }, data: { label: "Home Hub Device", variant: "desktop-app", config: { concurrentUsers: 500000, reqPerSec: 100000, os: "linux" } } },
      { id: "n2", type: "user", position: { x: 0, y: 240 }, data: { label: "Mobile App", variant: "mobile-app", config: { concurrentUsers: 1000000, reqPerSec: 20000, platforms: "both" } } },
      { id: "n3", type: "api", position: { x: 240, y: 60 }, data: { label: "MQTT Broker", variant: "websocket", config: { instances: 15, maxConnections: 200000 } } },
      { id: "n4", type: "api", position: { x: 240, y: 240 }, data: { label: "Control API", variant: "rest", config: { instances: 8, cpu: 2, memoryMb: 1024, rateLimit: 20000 } } },
      { id: "n5", type: "database", position: { x: 480, y: 60 }, data: { label: "Device State", variant: "redis", config: { memoryGb: 16, evictionPolicy: "noeviction", persistence: "rdb", replicas: 2 } } },
      { id: "n6", type: "database", position: { x: 480, y: 240 }, data: { label: "Automation Rules", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 100, connectionPool: 100, region: "us-east-1" } } },
      { id: "n7", type: "queue", position: { x: 720, y: 150 }, data: { label: "Event Bus", variant: "kafka", config: { partitions: 24, retentionHours: 48, replicationFactor: 3 } } },
      { id: "n8", type: "worker", position: { x: 960, y: 150 }, data: { label: "Rule Engine", variant: "go", config: { instances: 4, cpu: 2, memoryMb: 1024 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3", data: { label: "MQTT" } },
      { id: "e2", source: "n2", target: "n4" },
      { id: "e3", source: "n3", target: "n5" },
      { id: "e4", source: "n4", target: "n5", data: { label: "set state" } },
      { id: "e5", source: "n4", target: "n6", data: { label: "rules CRUD" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "events" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n8", target: "n4", data: { label: "trigger action" } },
    ],
  },
};

const llmSaasBackend: Template = {
  id: "llm-saas-backend",
  name: "AI/LLM SaaS Backend",
  description: "LLM API service: rate limit, embedding cache, vector retrieval, async embedding.",
  category: "ai",
  difficulty: "medium",
  tags: ["embeddings", "vector", "rate-limit", "llm"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Developer App", variant: "web-browser", config: { concurrentUsers: 100000, reqPerSec: 5000, region: "global" } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "API Gateway", variant: "api-gateway", config: { provider: "cloudflare", rateLimit: 20000, auth: true } } },
      { id: "n3", type: "worker", position: { x: 480, y: 150 }, data: { label: "Inference Service", variant: "python", config: { instances: 20, cpu: 8, memoryMb: 8192, runtime: "3.12" } } },
      { id: "n4", type: "external", position: { x: 720, y: 60 }, data: { label: "LLM Provider", variant: "ai-provider", config: { provider: "anthropic", modelName: "claude-sonnet-4-6" } } },
      { id: "n5", type: "cache", position: { x: 720, y: 240 }, data: { label: "Embedding Cache", variant: "redis", config: { memoryGb: 64, evictionPolicy: "allkeys-lru", persistence: "none", replicas: 2 } } },
      { id: "n6", type: "database", position: { x: 480, y: 360 }, data: { label: "Vector DB", variant: "postgres", config: { version: "16", replicas: 2, storageGb: 500, connectionPool: 100, region: "us-east-1" } } },
      { id: "n7", type: "queue", position: { x: 240, y: 360 }, data: { label: "Async Embedding Jobs", variant: "sqs", config: { region: "us-east-1", fifo: false, visibilityTimeoutSec: 300 } } },
      { id: "n8", type: "worker", position: { x: 0, y: 360 }, data: { label: "Embedding Worker", variant: "python", config: { instances: 5, cpu: 8, memoryMb: 4096, runtime: "3.12" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", data: { label: "POST /v1/chat" } },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n5", data: { label: "cache lookup" } },
      { id: "e4", source: "n3", target: "n6", data: { label: "vector query" } },
      { id: "e5", source: "n3", target: "n4", data: { label: "completion" } },
      { id: "e6", source: "n3", target: "n7", data: { label: "log usage" } },
      { id: "e7", source: "n7", target: "n8" },
      { id: "e8", source: "n8", target: "n6", data: { label: "embed + insert" } },
    ],
  },
};

export const INDUSTRY_SPECIFIC: Template[] = [
  healthcareEhrFhir,
  telemedicinePlatform,
  fintechOpenBanking,
  insuranceClaims,
  edtechLms,
  multiplayerGameBackend,
  iotTelemetryPipeline,
  logisticsTracking,
  travelBookingOta,
  realEstateListings,
  musicRoyalty,
  liveAuction,
  loyaltyRewards,
  smartHomeHub,
  llmSaasBackend,
];
