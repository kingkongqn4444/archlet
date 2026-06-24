import { z } from "zod";
import type { NodeType } from "./diagram";

// ---------------------------------------------------------------------------
// Config schemas per variant
// ---------------------------------------------------------------------------

// user
const webBrowserConfig = z.object({
  concurrentUsers: z.number().min(1).default(1000),
  reqPerSec: z.number().min(1).default(100),
  region: z.string().default("us-east-1"),
});
const mobileAppConfig = z.object({
  concurrentUsers: z.number().min(1).default(5000),
  reqPerSec: z.number().min(1).default(200),
  platforms: z.enum(["ios", "android", "both"]).default("both"),
});
const desktopAppConfig = z.object({
  concurrentUsers: z.number().min(1).default(500),
  reqPerSec: z.number().min(1).default(50),
  os: z.enum(["windows", "macos", "linux", "cross"]).default("cross"),
});

// api
const restConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  rateLimit: z.number().min(1).default(1000),
});
const graphqlConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  maxDepth: z.number().min(1).default(10),
});
const grpcConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  streaming: z.boolean().default(false),
});
const websocketConfig = z.object({
  instances: z.number().min(1).default(2),
  maxConnections: z.number().min(1).default(10000),
});
const apiGatewayConfig = z.object({
  provider: z.enum(["aws", "gcp", "azure", "cloudflare"]).default("aws"),
  rateLimit: z.number().min(1).default(5000),
  auth: z.boolean().default(true),
});

// database
const postgresConfig = z.object({
  version: z.enum(["14", "15", "16", "17"]).default("16"),
  replicas: z.number().min(0).default(1),
  storageGb: z.number().min(1).default(50),
  connectionPool: z.number().min(1).default(100),
  region: z.string().default("us-east-1"),
});
const mysqlConfig = z.object({
  version: z.enum(["5.7", "8.0", "8.4"]).default("8.0"),
  replicas: z.number().min(0).default(1),
  storageGb: z.number().min(1).default(50),
  connectionPool: z.number().min(1).default(100),
});
const mongodbConfig = z.object({
  version: z.enum(["6.0", "7.0", "8.0"]).default("7.0"),
  shards: z.number().min(1).default(1),
  replicaSet: z.number().min(1).default(3),
  storageGb: z.number().min(1).default(50),
});
const dynamodbConfig = z.object({
  region: z.string().default("us-east-1"),
  billingMode: z.enum(["provisioned", "ondemand"]).default("ondemand"),
  rcu: z.number().min(1).default(5),
  wcu: z.number().min(1).default(5),
});
const cassandraConfig = z.object({
  nodes: z.number().min(1).default(3),
  replicationFactor: z.number().min(1).default(3),
  consistencyLevel: z.enum(["ONE", "QUORUM", "ALL"]).default("QUORUM"),
});
const sqliteConfig = z.object({
  path: z.string().default("/data/app.db"),
  mode: z.enum(["wal", "delete", "truncate"]).default("wal"),
});

// cache
const redisConfig = z.object({
  memoryGb: z.number().min(0.1).default(1),
  evictionPolicy: z.enum(["allkeys-lru", "volatile-lru", "noeviction"]).default("allkeys-lru"),
  persistence: z.enum(["none", "rdb", "aof"]).default("rdb"),
  replicas: z.number().min(0).default(1),
});
const memcachedConfig = z.object({
  memoryMb: z.number().min(64).default(512),
  replicas: z.number().min(0).default(1),
});
const keydbConfig = z.object({
  memoryGb: z.number().min(0.1).default(1),
  multithreaded: z.boolean().default(true),
});
const valkeyConfig = z.object({
  memoryGb: z.number().min(0.1).default(1),
});

// queue
const rabbitmqConfig = z.object({
  queues: z.number().min(1).default(5),
  durable: z.boolean().default(true),
  prefetch: z.number().min(1).default(10),
});
const kafkaConfig = z.object({
  partitions: z.number().min(1).default(12),
  retentionHours: z.number().min(1).default(168),
  replicationFactor: z.number().min(1).default(3),
});
const sqsConfig = z.object({
  region: z.string().default("us-east-1"),
  fifo: z.boolean().default(false),
  visibilityTimeoutSec: z.number().min(1).default(30),
});
const redisStreamsConfig = z.object({
  maxLen: z.number().min(1).default(10000),
  consumerGroups: z.number().min(1).default(2),
});
const natsConfig = z.object({
  jetstream: z.boolean().default(true),
  replicas: z.number().min(1).default(3),
});

// storage
const s3Config = z.object({
  region: z.string().default("us-east-1"),
  storageClass: z.enum(["standard", "ia", "glacier"]).default("standard"),
  versioning: z.boolean().default(false),
});
const r2Config = z.object({
  bucketName: z.string().default("my-bucket"),
  publicAccess: z.boolean().default(false),
});
const gcsConfig = z.object({
  region: z.string().default("us-central1"),
  storageClass: z.enum(["standard", "nearline", "coldline"]).default("standard"),
});
const azureBlobConfig = z.object({
  region: z.string().default("eastus"),
  tier: z.enum(["hot", "cool", "archive"]).default("hot"),
});
const localDiskConfig = z.object({
  sizeGb: z.number().min(1).default(100),
});

// cdn
const cloudflareConfig = z.object({
  cacheTtlSec: z.number().min(0).default(86400),
  originShield: z.boolean().default(false),
  wafEnabled: z.boolean().default(false),
});
const cloudfrontConfig = z.object({
  priceClass: z.enum(["100", "200", "all"]).default("100"),
});
const fastlyConfig = z.object({
  popsCount: z.number().min(1).default(20),
});
const akamaiConfig = z.object({
  cacheTtlSec: z.number().min(0).default(86400),
});

// load_balancer
const nginxConfig = z.object({
  algorithm: z.enum(["round-robin", "least-conn", "ip-hash"]).default("round-robin"),
  sslTermination: z.boolean().default(true),
  healthCheckPath: z.string().default("/health"),
});
const haproxyConfig = z.object({
  algorithm: z.enum(["roundrobin", "leastconn", "source"]).default("roundrobin"),
  sticky: z.boolean().default(false),
});
const awsAlbConfig = z.object({
  region: z.string().default("us-east-1"),
  targetGroups: z.number().min(1).default(2),
});
const envoyConfig = z.object({
  clusters: z.number().min(1).default(2),
});
const cloudflareLbConfig = z.object({
  sessionAffinity: z.boolean().default(false),
  healthCheck: z.boolean().default(true),
});

// worker
const nodejsConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  runtime: z.enum(["18", "20", "22"]).default("22"),
});
const pythonConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  runtime: z.enum(["3.11", "3.12"]).default("3.12"),
});
const goConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(256),
});
const rustConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(64).default(128),
});
const awsLambdaConfig = z.object({
  memoryMb: z.number().min(128).default(512),
  timeoutSec: z.number().min(1).default(30),
  concurrency: z.number().min(1).default(100),
});
const cfWorkersConfig = z.object({
  cpuLimit: z.number().min(1).default(50),
  memoryLimit: z.number().min(1).default(128),
});

// external
const paymentApiConfig = z.object({
  provider: z.enum(["stripe", "paypal", "sepay"]).default("stripe"),
  slaMs: z.number().min(1).default(500),
  rateLimit: z.number().min(1).default(1000),
});
const emailServiceConfig = z.object({
  provider: z.enum(["resend", "sendgrid", "ses"]).default("resend"),
  rateLimit: z.number().min(1).default(100),
});
const analyticsConfig = z.object({
  provider: z.enum(["posthog", "mixpanel", "amplitude"]).default("posthog"),
});
const aiProviderConfig = z.object({
  provider: z.enum(["openai", "anthropic", "deepseek"]).default("openai"),
  modelName: z.string().default("gpt-4o"),
});
const oauthProviderConfig = z.object({
  provider: z.enum(["google", "github", "microsoft"]).default("google"),
});
const customThirdPartyConfig = z.object({
  baseUrl: z.string().default("https://api.example.com"),
  slaMs: z.number().min(1).default(1000),
  rateLimit: z.number().min(1).default(100),
});

// ---------------------------------------------------------------------------
// Variant type
// ---------------------------------------------------------------------------

export type VariantConfigSchema = z.ZodObject<z.ZodRawShape>;

export type Variant = {
  id: string;
  label: string;
  iconSlug?: string;
  description?: string;
  configSchema: VariantConfigSchema;
};

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const VARIANTS_CATALOG = {
  user: [
    { id: "web-browser", label: "Web Browser", iconSlug: "googlechrome", description: "Web client traffic", configSchema: webBrowserConfig },
    { id: "mobile-app", label: "Mobile App", iconSlug: "android", description: "iOS / Android clients", configSchema: mobileAppConfig },
    { id: "desktop-app", label: "Desktop App", iconSlug: "electron", description: "Desktop application", configSchema: desktopAppConfig },
  ],
  api: [
    { id: "rest", label: "REST API", description: "RESTful HTTP service", configSchema: restConfig },
    { id: "graphql", label: "GraphQL", iconSlug: "graphql", description: "GraphQL API server", configSchema: graphqlConfig },
    { id: "grpc", label: "gRPC", iconSlug: "grpc", description: "gRPC microservice", configSchema: grpcConfig },
    { id: "websocket", label: "WebSocket", description: "Real-time WS server", configSchema: websocketConfig },
    { id: "api-gateway", label: "API Gateway", description: "Managed API gateway", configSchema: apiGatewayConfig },
  ],
  database: [
    { id: "postgres", label: "PostgreSQL", iconSlug: "postgresql", description: "Relational database", configSchema: postgresConfig },
    { id: "mysql", label: "MySQL", iconSlug: "mysql", description: "Relational database", configSchema: mysqlConfig },
    { id: "mongodb", label: "MongoDB", iconSlug: "mongodb", description: "Document database", configSchema: mongodbConfig },
    { id: "dynamodb", label: "DynamoDB", iconSlug: "amazondynamodb", description: "AWS NoSQL key-value", configSchema: dynamodbConfig },
    { id: "cassandra", label: "Cassandra", iconSlug: "apachecassandra", description: "Wide-column store", configSchema: cassandraConfig },
    { id: "sqlite", label: "SQLite", iconSlug: "sqlite", description: "Embedded SQL database", configSchema: sqliteConfig },
  ],
  cache: [
    { id: "redis", label: "Redis", iconSlug: "redis", description: "In-memory data store", configSchema: redisConfig },
    { id: "memcached", label: "Memcached", description: "Distributed memory cache", configSchema: memcachedConfig },
    { id: "keydb", label: "KeyDB", description: "Multi-threaded Redis fork", configSchema: keydbConfig },
    { id: "valkey", label: "Valkey", description: "Open-source Redis fork", configSchema: valkeyConfig },
  ],
  queue: [
    { id: "rabbitmq", label: "RabbitMQ", iconSlug: "rabbitmq", description: "AMQP message broker", configSchema: rabbitmqConfig },
    { id: "kafka", label: "Kafka", iconSlug: "apachekafka", description: "Distributed event stream", configSchema: kafkaConfig },
    { id: "sqs", label: "Amazon SQS", iconSlug: "amazonsqs", description: "Managed message queue", configSchema: sqsConfig },
    { id: "redis-streams", label: "Redis Streams", iconSlug: "redis", description: "Redis log-based queues", configSchema: redisStreamsConfig },
    { id: "nats", label: "NATS", iconSlug: "natsdotio", description: "Cloud-native messaging", configSchema: natsConfig },
  ],
  storage: [
    { id: "s3", label: "Amazon S3", iconSlug: "amazons3", description: "Object storage", configSchema: s3Config },
    { id: "r2", label: "Cloudflare R2", iconSlug: "cloudflare", description: "S3-compatible storage", configSchema: r2Config },
    { id: "gcs", label: "Google Cloud Storage", iconSlug: "googlecloud", description: "GCP object storage", configSchema: gcsConfig },
    { id: "azure-blob", label: "Azure Blob", iconSlug: "microsoftazure", description: "Azure object storage", configSchema: azureBlobConfig },
    { id: "local-disk", label: "Local Disk", description: "Filesystem storage", configSchema: localDiskConfig },
  ],
  cdn: [
    { id: "cloudflare", label: "Cloudflare CDN", iconSlug: "cloudflare", description: "Global CDN + DDoS", configSchema: cloudflareConfig },
    { id: "cloudfront", label: "CloudFront", iconSlug: "amazonwebservices", description: "AWS CDN", configSchema: cloudfrontConfig },
    { id: "fastly", label: "Fastly", iconSlug: "fastly", description: "Edge cloud platform", configSchema: fastlyConfig },
    { id: "akamai", label: "Akamai", iconSlug: "akamai", description: "Enterprise CDN", configSchema: akamaiConfig },
  ],
  load_balancer: [
    { id: "nginx", label: "Nginx", iconSlug: "nginx", description: "HTTP proxy + LB", configSchema: nginxConfig },
    { id: "haproxy", label: "HAProxy", iconSlug: "haproxy", description: "TCP/HTTP load balancer", configSchema: haproxyConfig },
    { id: "aws-alb", label: "AWS ALB", iconSlug: "amazonwebservices", description: "Application load balancer", configSchema: awsAlbConfig },
    { id: "envoy", label: "Envoy", iconSlug: "envoyproxy", description: "Cloud-native proxy", configSchema: envoyConfig },
    { id: "cloudflare-lb", label: "Cloudflare LB", iconSlug: "cloudflare", description: "Anycast load balancing", configSchema: cloudflareLbConfig },
  ],
  worker: [
    { id: "nodejs", label: "Node.js", iconSlug: "nodedotjs", description: "JS runtime worker", configSchema: nodejsConfig },
    { id: "python", label: "Python", iconSlug: "python", description: "Python worker service", configSchema: pythonConfig },
    { id: "go", label: "Go", iconSlug: "go", description: "Go worker service", configSchema: goConfig },
    { id: "rust", label: "Rust", iconSlug: "rust", description: "Rust worker service", configSchema: rustConfig },
    { id: "aws-lambda", label: "AWS Lambda", iconSlug: "awslambda", description: "FaaS / serverless", configSchema: awsLambdaConfig },
    { id: "cloudflare-workers", label: "CF Workers", iconSlug: "cloudflareworkers", description: "Edge serverless", configSchema: cfWorkersConfig },
  ],
  external: [
    { id: "payment-api", label: "Payment API", iconSlug: "stripe", description: "Payment processor", configSchema: paymentApiConfig },
    { id: "email-service", label: "Email Service", iconSlug: "resend", description: "Transactional email", configSchema: emailServiceConfig },
    { id: "analytics", label: "Analytics", iconSlug: "posthog", description: "Product analytics", configSchema: analyticsConfig },
    { id: "ai-provider", label: "AI Provider", iconSlug: "openai", description: "LLM / AI API", configSchema: aiProviderConfig },
    { id: "oauth-provider", label: "OAuth Provider", iconSlug: "openid", description: "Identity provider", configSchema: oauthProviderConfig },
    { id: "custom-third-party", label: "Custom API", description: "Generic third-party API", configSchema: customThirdPartyConfig },
  ],
} satisfies Record<NodeType, Variant[]>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getVariant(type: NodeType, variantId: string): Variant | undefined {
  return (VARIANTS_CATALOG[type] as Variant[]).find((v) => v.id === variantId);
}

export function getDefaultVariant(type: NodeType): Variant {
  // Catalog is statically non-empty for every NodeType; assertion is safe.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (VARIANTS_CATALOG[type] as Variant[])[0]!;
}

export function getVariantConfigSchema(type: NodeType, variantId: string): VariantConfigSchema | undefined {
  return getVariant(type, variantId)?.configSchema;
}

/** Parse config with defaults; returns defaults if input is empty/invalid. */
export function parseVariantConfig(type: NodeType, variantId: string, raw: unknown): Record<string, unknown> {
  const schema = getVariantConfigSchema(type, variantId);
  if (!schema) return {};
  const result = schema.safeParse(raw ?? {});
  if (result.success) return result.data as Record<string, unknown>;
  // Fallback to schema defaults
  const defaults = schema.safeParse({});
  return defaults.success ? (defaults.data as Record<string, unknown>) : {};
}
