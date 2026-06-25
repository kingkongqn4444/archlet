import { z } from "zod";
import type { Variant } from "./types";

const nodejsConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  runtime: z.enum(["18", "20", "22"]).default("22"),
  packageManager: z.enum(["npm", "pnpm", "yarn", "bun"]).default("pnpm"),
  clusterMode: z.boolean().default(false),
  maxOldSpaceMb: z.number().min(64).default(384),
  gracefulShutdownSec: z.number().min(0).default(30),
  healthCheckPath: z.string().default("/health"),
  autoScalingTargetCpuPct: z.number().min(10).max(95).default(70),
  minInstances: z.number().min(1).default(1),
  maxInstances: z.number().min(1).default(10),
  pm2Enabled: z.boolean().default(false),
});

const pythonConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(512),
  runtime: z.enum(["3.11", "3.12", "3.13"]).default("3.12"),
  framework: z.enum(["fastapi", "django", "flask", "starlette", "celery", "none"]).default("fastapi"),
  wsgiServer: z.enum(["gunicorn", "uvicorn", "uwsgi", "daphne"]).default("uvicorn"),
  workers: z.number().min(1).default(4),
  threadsPerWorker: z.number().min(1).default(2),
  gilDisabled: z.boolean().default(false),
  asyncMode: z.boolean().default(true),
  autoScalingTargetCpuPct: z.number().min(10).max(95).default(70),
  minInstances: z.number().min(1).default(1),
  maxInstances: z.number().min(1).default(10),
});

const goConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(128).default(256),
  goVersion: z.enum(["1.21", "1.22", "1.23", "1.24"]).default("1.23"),
  gomaxprocs: z.number().min(1).default(2),
  gogc: z.number().min(10).default(100),
  gomemlimitMb: z.number().min(64).default(200),
  pprofEnabled: z.boolean().default(false),
  raceDetectionEnabled: z.boolean().default(false),
  buildMode: z.enum(["default", "static", "pie", "plugin"]).default("default"),
  cgoEnabled: z.boolean().default(false),
  autoScalingTargetCpuPct: z.number().min(10).max(95).default(70),
});

const rustConfig = z.object({
  instances: z.number().min(1).default(2),
  cpu: z.number().min(0.1).default(1),
  memoryMb: z.number().min(64).default(128),
  edition: z.enum(["2018", "2021", "2024"]).default("2021"),
  runtime: z.enum(["tokio", "async-std", "smol", "none"]).default("tokio"),
  workerThreads: z.number().min(1).default(2),
  buildProfile: z.enum(["debug", "release", "release-lto"]).default("release"),
  panicStrategy: z.enum(["unwind", "abort"]).default("unwind"),
  jemallocEnabled: z.boolean().default(true),
  autoScalingTargetCpuPct: z.number().min(10).max(95).default(70),
});

const awsLambdaConfig = z.object({
  memoryMb: z.number().min(128).default(512),
  timeoutSec: z.number().min(1).max(900).default(30),
  concurrency: z.number().min(1).default(100),
  reservedConcurrency: z.number().min(0).default(0),
  provisionedConcurrency: z.number().min(0).default(0),
  architecture: z.enum(["x86_64", "arm64"]).default("arm64"),
  runtime: z.enum(["nodejs20.x", "nodejs22.x", "python3.12", "go1.x", "java21", "dotnet8", "ruby3.3"]).default("nodejs22.x"),
  ephemeralStorageMb: z.number().min(512).max(10240).default(512),
  snapStartEnabled: z.boolean().default(false),
  tracingMode: z.enum(["passthrough", "active"]).default("passthrough"),
  vpcEnabled: z.boolean().default(false),
  deadLetterEnabled: z.boolean().default(false),
});

const cfWorkersConfig = z.object({
  cpuLimit: z.number().min(1).default(50),
  memoryLimit: z.number().min(1).default(128),
  smartPlacement: z.boolean().default(false),
  bundleType: z.enum(["esm", "commonjs", "service-worker"]).default("esm"),
  compatibilityDate: z.string().default("2025-01-01"),
  nodeJsCompat: z.boolean().default(true),
  loggingEnabled: z.boolean().default(true),
  tailWorkers: z.boolean().default(false),
  cronTriggers: z.boolean().default(false),
  durableObjects: z.boolean().default(false),
  kvBindings: z.number().min(0).default(0),
  r2Bindings: z.number().min(0).default(0),
});

export const WORKER_VARIANTS: Variant[] = [
  { id: "nodejs", label: "Node.js", iconSlug: "nodedotjs", description: "JS runtime worker", configSchema: nodejsConfig },
  { id: "python", label: "Python", iconSlug: "python", description: "Python worker service", configSchema: pythonConfig },
  { id: "go", label: "Go", iconSlug: "go", description: "Go worker service", configSchema: goConfig },
  { id: "rust", label: "Rust", iconSlug: "rust", description: "Rust worker service", configSchema: rustConfig },
  { id: "aws-lambda", label: "AWS Lambda", iconSlug: "awslambda", description: "FaaS / serverless", configSchema: awsLambdaConfig, availableClouds: ["aws"] },
  { id: "cloudflare-workers", label: "CF Workers", iconSlug: "cloudflareworkers", description: "Edge serverless", configSchema: cfWorkersConfig, availableClouds: ["cloudflare"] },
];
