import { z } from "zod";
import type { Variant } from "./types";

const nginxConfig = z.object({
  algorithm: z.enum(["round-robin", "least-conn", "ip-hash", "least-time", "random"]).default("round-robin"),
  sslTermination: z.boolean().default(true),
  healthCheckPath: z.string().default("/health"),
  workerProcesses: z.enum(["auto", "1", "2", "4", "8", "16"]).default("auto"),
  workerConnections: z.number().min(64).default(1024),
  keepAliveTimeoutSec: z.number().min(0).default(75),
  gzipEnabled: z.boolean().default(true),
  http2Enabled: z.boolean().default(true),
  rateLimitRps: z.number().min(0).default(0),
  clientMaxBodyMb: z.number().min(1).default(10),
  proxyReadTimeoutSec: z.number().min(1).default(60),
  bufferSizeKb: z.number().min(1).default(16),
});

const haproxyConfig = z.object({
  algorithm: z.enum(["roundrobin", "leastconn", "source", "uri", "url_param", "hdr", "random"]).default("roundrobin"),
  sticky: z.boolean().default(false),
  stickyMethod: z.enum(["cookie", "source", "header"]).default("cookie"),
  healthCheck: z.boolean().default(true),
  healthCheckIntervalSec: z.number().min(1).default(2),
  maxConnections: z.number().min(1).default(50000),
  connectTimeoutMs: z.number().min(1).default(5000),
  serverTimeoutMs: z.number().min(1).default(30000),
  clientTimeoutMs: z.number().min(1).default(30000),
  retries: z.number().min(0).default(3),
  sslTermination: z.boolean().default(true),
  http2Enabled: z.boolean().default(true),
});

const awsAlbConfig = z.object({
  region: z.string().default("us-east-1"),
  targetGroups: z.number().min(1).default(2),
  scheme: z.enum(["internet-facing", "internal"]).default("internet-facing"),
  ipAddressType: z.enum(["ipv4", "dualstack"]).default("ipv4"),
  deletionProtection: z.boolean().default(false),
  http2Enabled: z.boolean().default(true),
  accessLogsEnabled: z.boolean().default(false),
  idleTimeoutSec: z.number().min(1).max(4000).default(60),
  desyncMitigationMode: z.enum(["defensive", "strictest", "monitor"]).default("defensive"),
  wafEnabled: z.boolean().default(false),
  stickinessEnabled: z.boolean().default(false),
  crossZoneLoadBalancing: z.boolean().default(true),
});

const envoyConfig = z.object({
  clusters: z.number().min(1).default(2),
  serviceDiscovery: z.enum(["static", "strict-dns", "logical-dns", "eds"]).default("strict-dns"),
  http2Enabled: z.boolean().default(true),
  http3Enabled: z.boolean().default(false),
  tlsEnabled: z.boolean().default(true),
  circuitBreakerEnabled: z.boolean().default(true),
  maxConnections: z.number().min(1).default(1024),
  maxPendingRequests: z.number().min(1).default(1024),
  outlierDetection: z.boolean().default(true),
  retryPolicy: z.enum(["none", "5xx", "gateway-error", "connect-failure", "retriable-4xx"]).default("5xx"),
  rateLimitEnabled: z.boolean().default(false),
  accessLogEnabled: z.boolean().default(true),
});

const cloudflareLbConfig = z.object({
  sessionAffinity: z.boolean().default(false),
  affinityTtlSec: z.number().min(0).default(82800),
  healthCheck: z.boolean().default(true),
  steeringPolicy: z.enum(["off", "random", "geo", "dynamic_latency", "proximity"]).default("dynamic_latency"),
  failoverMethod: z.enum(["passthrough", "redirect"]).default("passthrough"),
  pools: z.number().min(1).default(2),
  proxyProtocol: z.enum(["off", "v1", "v2", "simple"]).default("off"),
  notificationEnabled: z.boolean().default(true),
  monitorTimeoutSec: z.number().min(1).default(5),
  monitorIntervalSec: z.number().min(1).default(60),
});

export const LOAD_BALANCER_VARIANTS: Variant[] = [
  { id: "nginx", label: "Nginx", iconSlug: "nginx", description: "HTTP proxy + LB", configSchema: nginxConfig },
  { id: "haproxy", label: "HAProxy", iconSlug: "haproxy", description: "TCP/HTTP load balancer", configSchema: haproxyConfig },
  { id: "aws-alb", label: "AWS ALB", iconSlug: "amazonwebservices", description: "Application load balancer", configSchema: awsAlbConfig },
  { id: "envoy", label: "Envoy", iconSlug: "envoyproxy", description: "Cloud-native proxy", configSchema: envoyConfig },
  { id: "cloudflare-lb", label: "Cloudflare LB", iconSlug: "cloudflare", description: "Anycast load balancing", configSchema: cloudflareLbConfig },
];
