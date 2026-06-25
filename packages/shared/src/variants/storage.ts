import { z } from "zod";
import type { Variant } from "./types";

const s3Config = z.object({
  region: z.string().default("us-east-1"),
  storageClass: z.enum(["standard", "ia", "onezone-ia", "intelligent-tiering", "glacier", "deep-archive"]).default("standard"),
  versioning: z.boolean().default(false),
  encryption: z.enum(["none", "sse-s3", "sse-kms", "sse-c"]).default("sse-s3"),
  blockPublicAccess: z.boolean().default(true),
  lifecycleTransitionDays: z.number().min(0).default(0),
  lifecycleExpirationDays: z.number().min(0).default(0),
  replicationEnabled: z.boolean().default(false),
  objectLock: z.boolean().default(false),
  transferAcceleration: z.boolean().default(false),
  accessLogging: z.boolean().default(false),
  corsEnabled: z.boolean().default(false),
  requesterPays: z.boolean().default(false),
  intelligentTiering: z.boolean().default(false),
});

const r2Config = z.object({
  bucketName: z.string().default("my-bucket"),
  publicAccess: z.boolean().default(false),
  jurisdiction: z.enum(["default", "eu", "fedramp"]).default("default"),
  customDomain: z.string().default(""),
  corsEnabled: z.boolean().default(false),
  lifecycleEnabled: z.boolean().default(false),
  abortMultipartDays: z.number().min(0).default(7),
  eventNotifications: z.boolean().default(false),
  workerBinding: z.boolean().default(false),
  signedUrlExpirySec: z.number().min(0).default(3600),
});

const gcsConfig = z.object({
  region: z.string().default("us-central1"),
  storageClass: z.enum(["standard", "nearline", "coldline", "archive"]).default("standard"),
  versioning: z.boolean().default(false),
  encryption: z.enum(["google-managed", "cmek", "csek"]).default("google-managed"),
  publicAccessPrevention: z.enum(["enforced", "inherited"]).default("enforced"),
  uniformBucketLevelAccess: z.boolean().default(true),
  retentionDays: z.number().min(0).default(0),
  lifecycleEnabled: z.boolean().default(false),
  logging: z.boolean().default(false),
  cdnEnabled: z.boolean().default(false),
});

const azureBlobConfig = z.object({
  region: z.string().default("eastus"),
  tier: z.enum(["hot", "cool", "cold", "archive"]).default("hot"),
  redundancy: z.enum(["lrs", "zrs", "grs", "ragrs", "gzrs", "ragzrs"]).default("zrs"),
  versioning: z.boolean().default(false),
  softDeleteDays: z.number().min(0).max(365).default(7),
  immutableStorage: z.boolean().default(false),
  hierarchicalNamespace: z.boolean().default(false),
  encryption: z.enum(["microsoft-managed", "customer-managed"]).default("microsoft-managed"),
  publicAccess: z.enum(["disabled", "blob", "container"]).default("disabled"),
  sftpEnabled: z.boolean().default(false),
});

const localDiskConfig = z.object({
  sizeGb: z.number().min(1).default(100),
  filesystem: z.enum(["ext4", "xfs", "btrfs", "zfs", "ntfs", "apfs"]).default("ext4"),
  mountPath: z.string().default("/data"),
  raidLevel: z.enum(["none", "0", "1", "5", "6", "10"]).default("none"),
  encryption: z.boolean().default(false),
  snapshotEnabled: z.boolean().default(false),
  snapshotIntervalHours: z.number().min(0).default(24),
  ioScheduler: z.enum(["none", "mq-deadline", "kyber", "bfq"]).default("mq-deadline"),
});

export const STORAGE_VARIANTS: Variant[] = [
  { id: "s3", label: "Amazon S3", iconSlug: "amazons3", description: "Object storage", configSchema: s3Config, availableClouds: ["aws"] },
  { id: "r2", label: "Cloudflare R2", iconSlug: "cloudflare", description: "S3-compatible storage", configSchema: r2Config, availableClouds: ["cloudflare"] },
  { id: "gcs", label: "Google Cloud Storage", iconSlug: "googlecloud", description: "GCP object storage", configSchema: gcsConfig, availableClouds: ["gcp"] },
  { id: "azure-blob", label: "Azure Blob", iconSlug: "microsoftazure", description: "Azure object storage", configSchema: azureBlobConfig, availableClouds: ["azure"] },
  { id: "local-disk", label: "Local Disk", description: "Filesystem storage", configSchema: localDiskConfig, availableClouds: ["self-hosted"] },
];
