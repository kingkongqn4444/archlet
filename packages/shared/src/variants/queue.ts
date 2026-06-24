import { z } from "zod";
import type { Variant } from "./types";

const rabbitmqConfig = z.object({
  queues: z.number().min(1).default(5),
  durable: z.boolean().default(true),
  prefetch: z.number().min(1).default(10),
  exchangeType: z.enum(["direct", "topic", "fanout", "headers"]).default("direct"),
  ackMode: z.enum(["auto", "manual"]).default("manual"),
  deadLetterEnabled: z.boolean().default(true),
  messageTtlMs: z.number().min(0).default(0),
  maxLength: z.number().min(0).default(0),
  lazyQueues: z.boolean().default(false),
  clusterNodes: z.number().min(1).default(3),
  tlsEnabled: z.boolean().default(true),
  managementUiEnabled: z.boolean().default(true),
});

const kafkaConfig = z.object({
  partitions: z.number().min(1).default(12),
  retentionHours: z.number().min(1).default(168),
  replicationFactor: z.number().min(1).default(3),
  brokers: z.number().min(1).default(3),
  acks: z.enum(["0", "1", "all"]).default("all"),
  compression: z.enum(["none", "gzip", "snappy", "lz4", "zstd"]).default("snappy"),
  minInsyncReplicas: z.number().min(1).default(2),
  segmentBytesMb: z.number().min(1).default(1024),
  maxMessageMb: z.number().min(1).default(1),
  enableAutoCommit: z.boolean().default(true),
  saslMechanism: z.enum(["none", "plain", "scram-sha-256", "scram-sha-512", "gssapi"]).default("scram-sha-512"),
  tlsEnabled: z.boolean().default(true),
});

const sqsConfig = z.object({
  region: z.string().default("us-east-1"),
  fifo: z.boolean().default(false),
  visibilityTimeoutSec: z.number().min(1).default(30),
  messageRetentionDays: z.number().min(1).max(14).default(4),
  maxMessageKb: z.number().min(1).max(256).default(256),
  deadLetterEnabled: z.boolean().default(true),
  maxReceiveCount: z.number().min(1).default(5),
  delaySeconds: z.number().min(0).max(900).default(0),
  longPollingSec: z.number().min(0).max(20).default(20),
  contentBasedDeduplication: z.boolean().default(false),
  kmsEncryption: z.boolean().default(true),
});

const redisStreamsConfig = z.object({
  maxLen: z.number().min(1).default(10000),
  consumerGroups: z.number().min(1).default(2),
  approximateTrimming: z.boolean().default(true),
  blockTimeoutMs: z.number().min(0).default(5000),
  idleTimeMaxMs: z.number().min(0).default(60000),
  ackMode: z.enum(["auto", "manual"]).default("manual"),
  retentionPolicy: z.enum(["maxlen", "minid", "none"]).default("maxlen"),
  persistence: z.enum(["none", "rdb", "aof"]).default("aof"),
});

const natsConfig = z.object({
  jetstream: z.boolean().default(true),
  replicas: z.number().min(1).default(3),
  streamRetention: z.enum(["limits", "interest", "workqueue"]).default("limits"),
  storage: z.enum(["memory", "file"]).default("file"),
  maxBytesGb: z.number().min(1).default(10),
  maxMessages: z.number().min(0).default(0),
  maxAgeHours: z.number().min(0).default(168),
  discardPolicy: z.enum(["old", "new"]).default("old"),
  tlsEnabled: z.boolean().default(true),
  authEnabled: z.boolean().default(true),
  leafNodesEnabled: z.boolean().default(false),
});

export const QUEUE_VARIANTS: Variant[] = [
  { id: "rabbitmq", label: "RabbitMQ", iconSlug: "rabbitmq", description: "AMQP message broker", configSchema: rabbitmqConfig },
  { id: "kafka", label: "Kafka", iconSlug: "apachekafka", description: "Distributed event stream", configSchema: kafkaConfig },
  { id: "sqs", label: "Amazon SQS", iconSlug: "amazonsqs", description: "Managed message queue", configSchema: sqsConfig },
  { id: "redis-streams", label: "Redis Streams", iconSlug: "redis", description: "Redis log-based queues", configSchema: redisStreamsConfig },
  { id: "nats", label: "NATS", iconSlug: "natsdotio", description: "Cloud-native messaging", configSchema: natsConfig },
];
