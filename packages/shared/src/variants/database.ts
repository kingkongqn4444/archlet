import { z } from "zod";
import type { Variant } from "./types";
import { awsRegion, gcpRegion, azureRegion, AWS_DB_CLASSES, GCP_SQL_CLASSES, AZURE_DB_TIERS, AZURE_DB_SKUS } from "./_shared";

// Postgres: per-cloud SKU + region via discriminatedUnion on cloudProvider.
// Common fields: version, replicas, storageGb, connectionPool, ssl, extensions.
const postgresCommon = {
  version: z.enum(["14", "15", "16", "17"]).default("16"),
  replicas: z.number().min(0).default(1),
  storageGb: z.number().min(1).default(50),
  connectionPool: z.number().min(1).default(100),
  sslEnabled: z.boolean().default(true),
  slowQueryLogMs: z.number().min(0).default(1000),
  extensions: z.enum(["none", "pgvector", "postgis", "pg_partman", "timescaledb"]).default("none"),
};
const postgresConfig = z.discriminatedUnion("cloudProvider", [
  z.object({
    cloudProvider: z.literal("self-hosted"),
    ...postgresCommon,
    region: z.string().default("on-prem"),
  }),
  z.object({
    cloudProvider: z.literal("aws"),
    ...postgresCommon,
    region: awsRegion,
    instanceClass: z.enum(AWS_DB_CLASSES).default("db.m5.large"),
    storageType: z.enum(["gp3", "gp2", "io1", "io2"]).default("gp3"),
    iops: z.number().min(100).default(3000),
    multiAz: z.boolean().default(true),
    backupRetentionDays: z.number().min(0).max(35).default(7),
    pitrEnabled: z.boolean().default(true),
    encryptionAtRest: z.boolean().default(true),
  }),
  z.object({
    cloudProvider: z.literal("gcp"),
    ...postgresCommon,
    region: gcpRegion,
    instanceClass: z.enum(GCP_SQL_CLASSES).default("db-n1-standard-2"),
    tier: z.enum(["enterprise", "enterprise-plus"]).default("enterprise"),
    backupEnabled: z.boolean().default(true),
    pointInTimeRecovery: z.boolean().default(true),
  }),
  z.object({
    cloudProvider: z.literal("azure"),
    ...postgresCommon,
    region: azureRegion,
    tier: z.enum(AZURE_DB_TIERS).default("GeneralPurpose"),
    skuName: z.enum(AZURE_DB_SKUS).default("GP_Gen5_2"),
    haEnabled: z.boolean().default(false),
    geoRedundantBackup: z.boolean().default(false),
  }),
]);

const mysqlConfig = z.object({
  version: z.enum(["5.7", "8.0", "8.4"]).default("8.0"),
  replicas: z.number().min(0).default(1),
  storageGb: z.number().min(1).default(50),
  connectionPool: z.number().min(1).default(100),
  region: z.string().default("us-east-1"),
  engine: z.enum(["innodb", "myisam", "rocksdb"]).default("innodb"),
  characterSet: z.enum(["utf8mb4", "utf8", "latin1"]).default("utf8mb4"),
  bufferPoolGb: z.number().min(0.1).default(4),
  multiAz: z.boolean().default(true),
  backupRetentionDays: z.number().min(0).max(35).default(7),
  binlogFormat: z.enum(["row", "statement", "mixed"]).default("row"),
  encryptionAtRest: z.boolean().default(true),
  sslRequired: z.boolean().default(true),
  slowQueryLogMs: z.number().min(0).default(1000),
});

const mongodbConfig = z.object({
  version: z.enum(["6.0", "7.0", "8.0"]).default("7.0"),
  shards: z.number().min(1).default(1),
  replicaSet: z.number().min(1).default(3),
  storageGb: z.number().min(1).default(50),
  storageEngine: z.enum(["wiredTiger", "inMemory"]).default("wiredTiger"),
  writeConcern: z.enum(["majority", "1", "2", "3"]).default("majority"),
  readPreference: z.enum(["primary", "primaryPreferred", "secondary", "secondaryPreferred", "nearest"]).default("primary"),
  authEnabled: z.boolean().default(true),
  tlsEnabled: z.boolean().default(true),
  changeStreamsEnabled: z.boolean().default(false),
  oplogSizeGb: z.number().min(1).default(10),
  compression: z.enum(["snappy", "zstd", "zlib", "none"]).default("snappy"),
});

const dynamodbConfig = z.object({
  region: z.string().default("us-east-1"),
  billingMode: z.enum(["provisioned", "ondemand"]).default("ondemand"),
  rcu: z.number().min(1).default(5),
  wcu: z.number().min(1).default(5),
  globalTablesEnabled: z.boolean().default(false),
  streamsEnabled: z.boolean().default(false),
  ttlAttribute: z.string().default("ttl"),
  pitrEnabled: z.boolean().default(true),
  daxEnabled: z.boolean().default(false),
  encryption: z.enum(["aws-owned", "aws-managed", "customer-managed"]).default("aws-owned"),
  autoScaling: z.boolean().default(true),
  targetUtilizationPct: z.number().min(20).max(90).default(70),
});

const cassandraConfig = z.object({
  nodes: z.number().min(1).default(3),
  replicationFactor: z.number().min(1).default(3),
  consistencyLevel: z.enum(["ONE", "QUORUM", "ALL", "LOCAL_QUORUM", "EACH_QUORUM"]).default("QUORUM"),
  snitch: z.enum(["SimpleSnitch", "GossipingPropertyFileSnitch", "Ec2Snitch", "Ec2MultiRegionSnitch"]).default("GossipingPropertyFileSnitch"),
  compactionStrategy: z.enum(["STCS", "LCS", "TWCS", "DTCS"]).default("STCS"),
  jvmHeapGb: z.number().min(1).default(8),
  authEnabled: z.boolean().default(true),
  tlsEnabled: z.boolean().default(true),
  hintedHandoffMin: z.number().min(0).default(180),
  repairScheduleHours: z.number().min(0).default(168),
});

const sqliteConfig = z.object({
  path: z.string().default("/data/app.db"),
  mode: z.enum(["wal", "delete", "truncate"]).default("wal"),
  pageSize: z.enum(["1024", "2048", "4096", "8192", "16384", "32768", "65536"]).default("4096"),
  cacheSizeMb: z.number().min(1).default(16),
  busyTimeoutMs: z.number().min(0).default(5000),
  foreignKeysEnabled: z.boolean().default(true),
  synchronous: z.enum(["off", "normal", "full", "extra"]).default("normal"),
  tempStore: z.enum(["default", "memory", "file"]).default("memory"),
  vacuumMode: z.enum(["none", "auto", "incremental"]).default("auto"),
});

export const DATABASE_VARIANTS: Variant[] = [
  { id: "postgres", label: "PostgreSQL", iconSlug: "postgresql", description: "Relational database", configSchema: postgresConfig, availableClouds: ["self-hosted", "aws", "gcp", "azure"] },
  { id: "mysql", label: "MySQL", iconSlug: "mysql", description: "Relational database", configSchema: mysqlConfig },
  { id: "mongodb", label: "MongoDB", iconSlug: "mongodb", description: "Document database", configSchema: mongodbConfig },
  { id: "dynamodb", label: "DynamoDB", iconSlug: "amazondynamodb", description: "AWS NoSQL key-value", configSchema: dynamodbConfig, availableClouds: ["aws"] },
  { id: "cassandra", label: "Cassandra", iconSlug: "apachecassandra", description: "Wide-column store", configSchema: cassandraConfig },
  { id: "sqlite", label: "SQLite", iconSlug: "sqlite", description: "Embedded SQL database", configSchema: sqliteConfig, availableClouds: ["self-hosted"] },
];
