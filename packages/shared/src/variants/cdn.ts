import { z } from "zod";
import type { Variant } from "./types";

const cloudflareConfig = z.object({
  cacheTtlSec: z.number().min(0).default(86400),
  originShield: z.boolean().default(false),
  wafEnabled: z.boolean().default(false),
  cacheLevel: z.enum(["bypass", "no-query-string", "standard", "aggressive"]).default("standard"),
  brotliEnabled: z.boolean().default(true),
  http3Enabled: z.boolean().default(true),
  zeroRttEnabled: z.boolean().default(true),
  alwaysOnline: z.boolean().default(true),
  rocketLoader: z.boolean().default(false),
  imageOptimization: z.boolean().default(false),
  argoSmartRouting: z.boolean().default(false),
  botManagement: z.boolean().default(false),
  rateLimiting: z.boolean().default(false),
  tlsMinVersion: z.enum(["1.0", "1.1", "1.2", "1.3"]).default("1.2"),
});

const cloudfrontConfig = z.object({
  priceClass: z.enum(["100", "200", "all"]).default("100"),
  defaultTtlSec: z.number().min(0).default(86400),
  minTtlSec: z.number().min(0).default(0),
  maxTtlSec: z.number().min(0).default(31536000),
  compressionEnabled: z.boolean().default(true),
  http3Enabled: z.boolean().default(true),
  wafEnabled: z.boolean().default(false),
  shieldRegion: z.string().default(""),
  fieldLevelEncryption: z.boolean().default(false),
  realtimeLogs: z.boolean().default(false),
  lambdaEdgeEnabled: z.boolean().default(false),
  signedUrlsEnabled: z.boolean().default(false),
});

const fastlyConfig = z.object({
  popsCount: z.number().min(1).default(20),
  cacheTtlSec: z.number().min(0).default(3600),
  shieldEnabled: z.boolean().default(true),
  shieldRegion: z.string().default("nearest"),
  brotliEnabled: z.boolean().default(true),
  http3Enabled: z.boolean().default(true),
  imageOptimizer: z.boolean().default(false),
  wafEnabled: z.boolean().default(false),
  vclCustomEnabled: z.boolean().default(false),
  computeEdgeEnabled: z.boolean().default(false),
  realtimeAnalytics: z.boolean().default(true),
});

const akamaiConfig = z.object({
  cacheTtlSec: z.number().min(0).default(86400),
  tier: z.enum(["standard", "advanced", "premium"]).default("standard"),
  imageManager: z.boolean().default(false),
  adaptiveAcceleration: z.boolean().default(true),
  prefetching: z.boolean().default(false),
  brotliEnabled: z.boolean().default(true),
  http3Enabled: z.boolean().default(true),
  wafEnabled: z.boolean().default(false),
  botManager: z.boolean().default(false),
  edgeWorkersEnabled: z.boolean().default(false),
  geoRestrictions: z.enum(["none", "allowlist", "blocklist"]).default("none"),
});

export const CDN_VARIANTS: Variant[] = [
  { id: "cloudflare", label: "Cloudflare CDN", iconSlug: "cloudflare", description: "Global CDN + DDoS", configSchema: cloudflareConfig },
  { id: "cloudfront", label: "CloudFront", iconSlug: "amazonwebservices", description: "AWS CDN", configSchema: cloudfrontConfig },
  { id: "fastly", label: "Fastly", iconSlug: "fastly", description: "Edge cloud platform", configSchema: fastlyConfig },
  { id: "akamai", label: "Akamai", iconSlug: "akamai", description: "Enterprise CDN", configSchema: akamaiConfig },
];
