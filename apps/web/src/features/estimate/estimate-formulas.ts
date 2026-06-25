// Pure back-of-envelope estimation formulas for interview prep.
// All inputs explicit; no canvas state required (canvas can auto-populate later).

// ─── Formatting helpers ────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
  const exp = Math.min(Math.floor(Math.log10(bytes) / 3), units.length - 1);
  const value = bytes / Math.pow(1000, exp);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[exp]}`;
}

export function formatQps(qps: number): string {
  if (qps < 1) return qps.toFixed(2);
  if (qps < 1_000) return Math.round(qps).toString();
  if (qps < 1_000_000) return `${(qps / 1_000).toFixed(1)}K`;
  if (qps < 1_000_000_000) return `${(qps / 1_000_000).toFixed(2)}M`;
  return `${(qps / 1_000_000_000).toFixed(2)}B`;
}

export function formatUsd(usd: number): string {
  if (usd < 0.01) return "<$0.01";
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1_000) return `$${usd.toFixed(0)}`;
  if (usd < 1_000_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${(usd / 1_000_000).toFixed(2)}M`;
}

// ─── 1. QPS Calculator ─────────────────────────────────────────────────────

export type QpsInput = {
  dau: number;                  // daily active users
  actionsPerUserPerDay: number; // avg actions per user per day
  peakMultiplier: number;       // peak vs avg (e.g. 3 = 3x of avg)
  readWriteRatio: number;       // 0.0–1.0; 0.9 = 90% reads
};

export type QpsResult = {
  avgQps: number;
  peakQps: number;
  peakReadQps: number;
  peakWriteQps: number;
};

export function calcQps(input: QpsInput): QpsResult {
  const totalActionsDay = input.dau * input.actionsPerUserPerDay;
  const avgQps = totalActionsDay / 86400;
  const peakQps = avgQps * input.peakMultiplier;
  return {
    avgQps,
    peakQps,
    peakReadQps: peakQps * input.readWriteRatio,
    peakWriteQps: peakQps * (1 - input.readWriteRatio),
  };
}

// ─── 2. Storage Calculator ─────────────────────────────────────────────────

export type StorageInput = {
  dau: number;
  writesPerUserPerDay: number;
  bytesPerWrite: number;        // avg payload bytes
  retentionYears: number;
  replicationFactor: number;    // e.g. 3 for typical Cassandra
  compressionRatio: number;     // e.g. 2 for snappy on text
  indexOverheadPct: number;     // e.g. 30 = 30% extra for indexes
};

export type StorageResult = {
  dailyBytes: number;
  annualBytes: number;
  totalRawBytes: number;
  totalReplicatedBytes: number;
  totalWithIndexBytes: number;
};

export function calcStorage(input: StorageInput): StorageResult {
  const dailyBytes = input.dau * input.writesPerUserPerDay * input.bytesPerWrite;
  const annualBytes = dailyBytes * 365;
  const totalRawBytes = (annualBytes * input.retentionYears) / Math.max(1, input.compressionRatio);
  const totalReplicatedBytes = totalRawBytes * input.replicationFactor;
  const totalWithIndexBytes = totalReplicatedBytes * (1 + input.indexOverheadPct / 100);
  return { dailyBytes, annualBytes, totalRawBytes, totalReplicatedBytes, totalWithIndexBytes };
}

// ─── 3. Bandwidth Calculator ───────────────────────────────────────────────

export type BandwidthInput = {
  peakQps: number;
  avgRequestBytes: number;      // incoming payload
  avgResponseBytes: number;     // outgoing payload
};

export type BandwidthResult = {
  inboundMbps: number;          // bits per second / 1M
  outboundMbps: number;
  totalMbps: number;
  monthlyEgressGb: number;      // outbound × seconds_in_month
};

export function calcBandwidth(input: BandwidthInput): BandwidthResult {
  const inboundBps = input.peakQps * input.avgRequestBytes * 8;
  const outboundBps = input.peakQps * input.avgResponseBytes * 8;
  const SECONDS_IN_MONTH = 86400 * 30;
  const monthlyEgressBytes = input.peakQps * input.avgResponseBytes * SECONDS_IN_MONTH;
  return {
    inboundMbps: inboundBps / 1_000_000,
    outboundMbps: outboundBps / 1_000_000,
    totalMbps: (inboundBps + outboundBps) / 1_000_000,
    monthlyEgressGb: monthlyEgressBytes / 1_000_000_000,
  };
}

// ─── 4. Memory Calculator (cache sizing) ───────────────────────────────────

export type MemoryInput = {
  hotKeys: number;              // count of hot keys to keep in cache
  avgValueBytes: number;        // serialized size per value
  overheadPerKeyBytes: number;  // Redis overhead (~50-100 bytes)
  replicas: number;             // cluster replicas
  headroomPct: number;          // e.g. 30 = 30% headroom for fragmentation
};

export type MemoryResult = {
  rawBytes: number;
  withOverheadBytes: number;
  withReplicasBytes: number;
  recommendedBytes: number;     // with headroom
};

export function calcMemory(input: MemoryInput): MemoryResult {
  const rawBytes = input.hotKeys * input.avgValueBytes;
  const withOverheadBytes = input.hotKeys * (input.avgValueBytes + input.overheadPerKeyBytes);
  const withReplicasBytes = withOverheadBytes * input.replicas;
  const recommendedBytes = withReplicasBytes * (1 + input.headroomPct / 100);
  return { rawBytes, withOverheadBytes, withReplicasBytes, recommendedBytes };
}

// ─── 5. Cost Calculator (rough AWS baseline) ───────────────────────────────

// Public list-price approximations (US East). Real cost varies — caveat.
const AWS_S3_STANDARD_PER_GB_MO = 0.023;
const AWS_EGRESS_PER_GB = 0.09;             // first TB; tiered after
const AWS_LAMBDA_PER_REQ = 0.0000002;       // $0.20 per million
const AWS_LAMBDA_GB_SEC = 0.0000166667;     // $0.00001667/GB-sec
const AWS_RDS_T3_MEDIUM_PER_MO = 60;        // on-demand
const AWS_ELASTICACHE_R6G_LARGE_PER_MO = 130;

export type CostInput = {
  storageGb: number;            // from Storage tab
  monthlyEgressGb: number;      // from Bandwidth tab
  peakQps: number;              // from QPS tab
  computeInstances: number;     // # of RDS-like instances
  cacheClusters: number;        // # of ElastiCache clusters
  avgLambdaDurationMs?: number; // optional if using Lambda
  lambdaMemoryGb?: number;
};

export type CostResult = {
  storageMonthly: number;
  egressMonthly: number;
  computeMonthly: number;
  cacheMonthly: number;
  lambdaMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
};

export function calcCost(input: CostInput): CostResult {
  const storageMonthly = input.storageGb * AWS_S3_STANDARD_PER_GB_MO;
  const egressMonthly = input.monthlyEgressGb * AWS_EGRESS_PER_GB;
  const computeMonthly = input.computeInstances * AWS_RDS_T3_MEDIUM_PER_MO;
  const cacheMonthly = input.cacheClusters * AWS_ELASTICACHE_R6G_LARGE_PER_MO;
  let lambdaMonthly = 0;
  if (input.avgLambdaDurationMs && input.lambdaMemoryGb) {
    const monthlyRequests = input.peakQps * 86400 * 30;
    const reqCost = monthlyRequests * AWS_LAMBDA_PER_REQ;
    const gbSec = monthlyRequests * (input.avgLambdaDurationMs / 1000) * input.lambdaMemoryGb;
    lambdaMonthly = reqCost + gbSec * AWS_LAMBDA_GB_SEC;
  }
  const totalMonthly = storageMonthly + egressMonthly + computeMonthly + cacheMonthly + lambdaMonthly;
  return {
    storageMonthly,
    egressMonthly,
    computeMonthly,
    cacheMonthly,
    lambdaMonthly,
    totalMonthly,
    totalAnnual: totalMonthly * 12,
  };
}
