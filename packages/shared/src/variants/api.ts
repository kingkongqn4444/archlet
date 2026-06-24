import { z } from "zod";
import type { Variant } from "./types";

const restConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  rateLimit: z.number().min(1).default(1000),
  requestTimeoutMs: z.number().min(100).default(30000),
  keepAliveSec: z.number().min(0).default(60),
  maxBodyMb: z.number().min(1).default(10),
  corsEnabled: z.boolean().default(true),
  compressionEnabled: z.boolean().default(true),
  tracingEnabled: z.boolean().default(true),
  autoScalingTargetCpuPct: z.number().min(10).max(95).default(70),
  minInstances: z.number().min(1).default(1),
  maxInstances: z.number().min(1).default(10),
});

const graphqlConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  maxDepth: z.number().min(1).default(10),
  maxComplexity: z.number().min(1).default(1000),
  introspectionEnabled: z.boolean().default(false),
  persistedQueries: z.boolean().default(true),
  subscriptionsEnabled: z.boolean().default(false),
  apolloFederation: z.boolean().default(false),
  queryTimeoutMs: z.number().min(100).default(15000),
  dataLoaderBatching: z.boolean().default(true),
});

const grpcConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  streaming: z.boolean().default(false),
  tlsEnabled: z.boolean().default(true),
  maxMessageMb: z.number().min(1).default(4),
  keepAliveTimeSec: z.number().min(1).default(30),
  reflectionEnabled: z.boolean().default(false),
  compression: z.enum(["none", "gzip", "deflate"]).default("gzip"),
  loadBalancingPolicy: z.enum(["round_robin", "pick_first", "grpclb"]).default("round_robin"),
});

const websocketConfig = z.object({
  instances: z.number().min(1).default(2),
  maxConnections: z.number().min(1).default(10000),
  pingIntervalSec: z.number().min(1).default(30),
  pingTimeoutSec: z.number().min(1).default(10),
  messageRateLimit: z.number().min(1).default(100),
  maxMessageKb: z.number().min(1).default(256),
  compressionEnabled: z.boolean().default(true),
  stickySessionEnabled: z.boolean().default(true),
  subProtocol: z.enum(["none", "wamp", "socket.io", "stomp"]).default("none"),
});

const apiGatewayConfig = z.object({
  provider: z.enum(["aws", "gcp", "azure", "cloudflare"]).default("aws"),
  rateLimit: z.number().min(1).default(5000),
  auth: z.boolean().default(true),
  authType: z.enum(["api-key", "jwt", "oauth2", "mtls"]).default("jwt"),
  cachingEnabled: z.boolean().default(true),
  cacheTtlSec: z.number().min(0).default(300),
  throttlingBurst: z.number().min(1).default(10000),
  wafEnabled: z.boolean().default(true),
  loggingLevel: z.enum(["off", "error", "info", "debug"]).default("info"),
  customDomain: z.string().default(""),
});

export const API_VARIANTS: Variant[] = [
  { id: "rest", label: "REST API", description: "RESTful HTTP service", configSchema: restConfig },
  { id: "graphql", label: "GraphQL", iconSlug: "graphql", description: "GraphQL API server", configSchema: graphqlConfig },
  { id: "grpc", label: "gRPC", iconSlug: "grpc", description: "gRPC microservice", configSchema: grpcConfig },
  { id: "websocket", label: "WebSocket", description: "Real-time WS server", configSchema: websocketConfig },
  { id: "api-gateway", label: "API Gateway", description: "Managed API gateway", configSchema: apiGatewayConfig },
];
