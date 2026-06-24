import { z } from "zod";
import type { Variant } from "./types";

const redisConfig = z.object({
  memoryGb: z.number().min(0.1).default(1),
  evictionPolicy: z.enum(["allkeys-lru", "allkeys-lfu", "volatile-lru", "volatile-lfu", "volatile-ttl", "noeviction"]).default("allkeys-lru"),
  persistence: z.enum(["none", "rdb", "aof", "rdb+aof"]).default("rdb"),
  replicas: z.number().min(0).default(1),
  clusterMode: z.enum(["standalone", "sentinel", "cluster"]).default("standalone"),
  shards: z.number().min(1).default(1),
  tlsEnabled: z.boolean().default(true),
  authEnabled: z.boolean().default(true),
  maxClients: z.number().min(1).default(10000),
  aofFsync: z.enum(["always", "everysec", "no"]).default("everysec"),
  snapshotIntervalSec: z.number().min(0).default(900),
  ioThreads: z.number().min(1).max(128).default(4),
  notifyKeyspaceEvents: z.boolean().default(false),
  lazyfreeEnabled: z.boolean().default(true),
  slowlogThresholdMs: z.number().min(0).default(10),
});

const memcachedConfig = z.object({
  memoryMb: z.number().min(64).default(512),
  replicas: z.number().min(0).default(1),
  maxConnections: z.number().min(1).default(1024),
  threads: z.number().min(1).max(64).default(4),
  chunkSizeBytes: z.number().min(48).default(96),
  evictionsEnabled: z.boolean().default(true),
  saslEnabled: z.boolean().default(false),
  tlsEnabled: z.boolean().default(false),
  growthFactor: z.number().min(1.0).default(1.25),
  itemSizeMaxMb: z.number().min(1).default(1),
});

const keydbConfig = z.object({
  memoryGb: z.number().min(0.1).default(1),
  multithreaded: z.boolean().default(true),
  serverThreads: z.number().min(1).max(64).default(4),
  activeReplica: z.boolean().default(true),
  flashEnabled: z.boolean().default(false),
  tlsEnabled: z.boolean().default(true),
  authEnabled: z.boolean().default(true),
  evictionPolicy: z.enum(["allkeys-lru", "allkeys-lfu", "volatile-lru", "noeviction"]).default("allkeys-lru"),
  persistence: z.enum(["none", "rdb", "aof"]).default("rdb"),
});

const valkeyConfig = z.object({
  memoryGb: z.number().min(0.1).default(1),
  clusterMode: z.enum(["standalone", "cluster"]).default("standalone"),
  shards: z.number().min(1).default(1),
  replicas: z.number().min(0).default(1),
  tlsEnabled: z.boolean().default(true),
  authEnabled: z.boolean().default(true),
  evictionPolicy: z.enum(["allkeys-lru", "allkeys-lfu", "volatile-lru", "noeviction"]).default("allkeys-lru"),
  persistence: z.enum(["none", "rdb", "aof"]).default("rdb"),
  ioThreads: z.number().min(1).max(64).default(2),
});

export const CACHE_VARIANTS: Variant[] = [
  { id: "redis", label: "Redis", iconSlug: "redis", description: "In-memory data store", configSchema: redisConfig },
  { id: "memcached", label: "Memcached", description: "Distributed memory cache", configSchema: memcachedConfig },
  { id: "keydb", label: "KeyDB", description: "Multi-threaded Redis fork", configSchema: keydbConfig },
  { id: "valkey", label: "Valkey", description: "Open-source Redis fork", configSchema: valkeyConfig },
];
