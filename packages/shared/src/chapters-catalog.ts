// 28 chapters from liquidslr/system-design-notes (Alex Xu's "System Design
// Interview" book). Mirrors GitHub folder structure. Markdown content fetched
// lazily at runtime; no rehosting (license-safe).

export type Chapter = {
  id: string;           // kebab-case slug for routing / storage
  number: number;       // 1-28
  title: string;        // human-readable
  folder: string;       // exact GitHub folder name (with leading number + dot)
  summary: string;      // 1-line teaser, hand-written
  keyConcepts: string[]; // for AI context (Mentor phase 2)
  relatedVariants: string[]; // suggest these node variants when reading
};

const GH_OWNER = "liquidslr";
const GH_REPO = "system-design-notes";
const GH_BRANCH = "master";

export function chapterReadmeUrl(chapter: Chapter): string {
  return `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${encodeURI(chapter.folder)}/Readme.md`;
}

export function chapterHtmlUrl(chapter: Chapter): string {
  return `https://github.com/${GH_OWNER}/${GH_REPO}/tree/${GH_BRANCH}/${encodeURI(chapter.folder)}`;
}

export const CHAPTERS_CATALOG: Chapter[] = [
  { id: "scaling", number: 1, title: "Scaling", folder: "01. Scaling", summary: "Vertical vs horizontal scaling, load balancers, replication, sharding fundamentals.", keyConcepts: ["vertical-scaling", "horizontal-scaling", "load-balancer", "replication", "sharding"], relatedVariants: ["aws-alb", "nginx", "postgres", "redis"] },
  { id: "estimation", number: 2, title: "Back of the Envelope Estimation", folder: "02. Back Of the Envelope Estimation", summary: "Latency numbers, QPS estimation, storage math every engineer should memorize.", keyConcepts: ["latency-numbers", "qps", "storage-estimation", "power-of-two"], relatedVariants: [] },
  { id: "design-framework", number: 3, title: "System Design Framework", folder: "03. System Design Framework", summary: "4-step framework for design interviews: scope, design, deep-dive, wrap-up.", keyConcepts: ["requirements-gathering", "high-level-design", "deep-dive", "trade-offs"], relatedVariants: [] },
  { id: "rate-limiter", number: 4, title: "Rate Limiter", folder: "04. Rate Limiter", summary: "Token bucket, leaky bucket, sliding window algorithms; Redis-backed distributed rate limiting.", keyConcepts: ["token-bucket", "leaky-bucket", "sliding-window", "redis-rate-limit"], relatedVariants: ["redis", "api-gateway", "nginx"] },
  { id: "consistent-hashing", number: 5, title: "Consistent Hashing", folder: "05. Consistent Hashing", summary: "Hash ring with virtual nodes; minimize remapping when nodes join/leave.", keyConcepts: ["hash-ring", "virtual-nodes", "rehashing"], relatedVariants: ["cassandra", "memcached", "dynamodb"] },
  { id: "kv-store", number: 6, title: "Key-Value Store", folder: "06. Key-Value Store", summary: "DynamoDB-style design: partitioning, replication, quorum, vector clocks, gossip.", keyConcepts: ["partitioning", "quorum", "vector-clock", "gossip-protocol", "merkle-tree"], relatedVariants: ["dynamodb", "cassandra", "redis"] },
  { id: "unique-id", number: 7, title: "Unique ID Generator", folder: "07. Unique-Id Generator", summary: "UUID, Twitter Snowflake, timestamp + machine-id + sequence — pros/cons.", keyConcepts: ["snowflake", "uuid", "monotonic-id", "clock-skew"], relatedVariants: [] },
  { id: "url-shortener", number: 8, title: "URL Shortener", folder: "08. URL Shortener", summary: "TinyURL design: base62 hash, KV store, cache, 301 vs 302 redirects.", keyConcepts: ["base62", "hash-collision", "cache-aside", "redirect"], relatedVariants: ["redis", "postgres", "api-gateway"] },
  { id: "web-crawler", number: 9, title: "Web Crawler", folder: "09. Web Crawler", summary: "Distributed crawler: URL frontier, politeness, dedup, robots.txt, content extraction.", keyConcepts: ["url-frontier", "bloom-filter", "robots-txt", "politeness"], relatedVariants: ["kafka", "redis", "s3"] },
  { id: "notification-system", number: 10, title: "Notification System", folder: "10. Notification System", summary: "Multi-channel push/email/SMS with fan-out workers, retry, dedup.", keyConcepts: ["fan-out", "apns", "fcm", "retry-policy", "dedup"], relatedVariants: ["kafka", "email-service", "nodejs"] },
  { id: "news-feed", number: 11, title: "News Feed System", folder: "11. News Feed System", summary: "Facebook-style feed: fan-out on write vs on read, ranking, hybrid for celebrities.", keyConcepts: ["fan-out-write", "fan-out-read", "feed-ranking", "hybrid"], relatedVariants: ["redis", "postgres", "kafka", "go"] },
  { id: "chat-system", number: 12, title: "Chat System", folder: "12. Chat System", summary: "WhatsApp/Messenger: presence, 1-1 + group chat, push, message store partitioning.", keyConcepts: ["websocket", "presence", "message-store", "channel-partition"], relatedVariants: ["websocket", "cassandra", "redis", "go"] },
  { id: "autocomplete", number: 13, title: "Search Autocomplete", folder: "13. Search Autocomplete", summary: "Trie data structure, weighted suggestions, async logging, AWS-style serving.", keyConcepts: ["trie", "n-gram", "weighted-prefix"], relatedVariants: ["redis", "cassandra", "kafka"] },
  { id: "youtube", number: 14, title: "YouTube", folder: "14. Youtube", summary: "Video upload, transcoding pipeline, HLS/DASH delivery, multi-region CDN.", keyConcepts: ["transcoding", "hls", "dash", "cdn"], relatedVariants: ["s3", "cloudfront", "python", "kafka"] },
  { id: "google-drive", number: 15, title: "Google Drive", folder: "15. Google Drive", summary: "File sync, chunking, dedup, conflict resolution, delta sync.", keyConcepts: ["chunking", "dedup", "delta-sync", "conflict-resolution"], relatedVariants: ["s3", "mysql", "redis", "kafka"] },
  { id: "proximity-service", number: 16, title: "Proximity Service", folder: "16. Proximity Service", summary: "Geohash, quadtree, R-tree for nearby search (Yelp/Google Places).", keyConcepts: ["geohash", "quadtree", "r-tree", "spatial-index"], relatedVariants: ["redis", "postgres", "cassandra"] },
  { id: "nearby-friends", number: 17, title: "Nearby Friends", folder: "17. Nearby Friends", summary: "Real-time location pub-sub: WebSocket + Redis geo, privacy considerations.", keyConcepts: ["redis-geo", "websocket", "pub-sub", "privacy"], relatedVariants: ["redis", "websocket", "kafka"] },
  { id: "google-maps", number: 18, title: "Google Maps", folder: "18. Google Maps", summary: "Tile servers, geocoding, routing graph (Dijkstra/A*), ETA prediction.", keyConcepts: ["tile-server", "routing-graph", "dijkstra", "geocoding"], relatedVariants: ["postgres", "redis", "rust", "cloudfront"] },
  { id: "distributed-queue", number: 19, title: "Distributed Message Queue", folder: "19. Distributed Message Queue", summary: "Kafka-style: partitions, replication, consumer groups, exactly-once.", keyConcepts: ["partition", "consumer-group", "exactly-once", "log-compaction"], relatedVariants: ["kafka", "rabbitmq", "nats"] },
  { id: "metrics-monitoring", number: 20, title: "Metrics Monitoring & Alerting", folder: "20. Metrics Monitoring and Alerting System", summary: "Prometheus-style: time-series DB, scrape vs push, alert rules, dashboards.", keyConcepts: ["time-series", "scrape", "alert-rules", "downsampling"], relatedVariants: ["cassandra", "kafka", "go"] },
  { id: "ad-click", number: 21, title: "Ad Click Event Aggregation", folder: "21. Ad Click Event Aggregation", summary: "Real-time ad attribution: stream processing, exactly-once, fraud detection.", keyConcepts: ["stream-processing", "windowing", "exactly-once", "fraud-detection"], relatedVariants: ["kafka", "cassandra", "go", "python"] },
  { id: "hotel-reservation", number: 22, title: "Hotel Reservation System", folder: "22. Hotel Reservation System", summary: "Inventory hold + booking workflow + double-booking prevention with idempotency.", keyConcepts: ["inventory-hold", "double-booking", "idempotency", "saga"], relatedVariants: ["postgres", "redis", "kafka"] },
  { id: "distributed-email", number: 23, title: "Distributed Email Service", folder: "23. Distributed Email Service", summary: "SMTP outbound, mailbox storage, anti-spam, full-text search of mailbox.", keyConcepts: ["smtp", "spam-filter", "mailbox-storage", "search-index"], relatedVariants: ["s3", "postgres", "kafka", "email-service"] },
  { id: "s3-storage", number: 24, title: "S3-like Object Storage", folder: "24. S3-like Object Storage", summary: "Bucket/object metadata, erasure coding, consistency model, multipart upload.", keyConcepts: ["erasure-coding", "metadata-store", "multipart-upload", "eventual-consistency"], relatedVariants: ["postgres", "cassandra", "rust"] },
  { id: "gaming-leaderboard", number: 25, title: "Real-time Gaming Leaderboard", folder: "25. Real-time Gaming Leaderboard", summary: "Sorted sets in Redis, top-K, percentile rank, sharding for >100M players.", keyConcepts: ["sorted-set", "top-k", "percentile", "shard-leaderboard"], relatedVariants: ["redis", "postgres", "go"] },
  { id: "payment-system", number: 26, title: "Payment System", folder: "26. Payment System", summary: "Idempotent payments, double-entry ledger, reconciliation, retry safety.", keyConcepts: ["idempotency", "double-entry-ledger", "reconciliation", "saga"], relatedVariants: ["postgres", "kafka", "payment-api", "sqs"] },
  { id: "digital-wallet", number: 27, title: "Digital Wallet", folder: "27.  Digital Wallet", summary: "Account balance + transfer with strong consistency; distributed transactions.", keyConcepts: ["strong-consistency", "two-phase-commit", "saga", "balance-ledger"], relatedVariants: ["postgres", "kafka"] },
  { id: "stock-exchange", number: 28, title: "Stock Exchange", folder: "28. Stock Exchange", summary: "Order matching engine, market data feed, low-latency design (single-threaded matching).", keyConcepts: ["order-book", "matching-engine", "market-data", "low-latency"], relatedVariants: ["redis", "rust", "kafka", "cassandra"] },
];

export function getChapterById(id: string): Chapter | undefined {
  return CHAPTERS_CATALOG.find((c) => c.id === id);
}
