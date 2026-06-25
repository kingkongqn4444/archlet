import { z } from "zod";
import type { Variant } from "./types";

const paymentApiConfig = z.object({
  provider: z.enum(["stripe", "paypal", "sepay", "adyen", "square"]).default("stripe"),
  slaMs: z.number().min(1).default(500),
  rateLimit: z.number().min(1).default(1000),
  mode: z.enum(["test", "live"]).default("test"),
  webhookEnabled: z.boolean().default(true),
  webhookSecret: z.string().default(""),
  retryPolicy: z.enum(["none", "exponential", "linear"]).default("exponential"),
  maxRetries: z.number().min(0).default(3),
  idempotencyEnabled: z.boolean().default(true),
  pciCompliance: z.boolean().default(true),
  threeDSecureEnabled: z.boolean().default(true),
  currencies: z.string().default("USD,EUR,VND"),
});

const emailServiceConfig = z.object({
  provider: z.enum(["resend", "sendgrid", "ses", "postmark", "mailgun"]).default("resend"),
  rateLimit: z.number().min(1).default(100),
  fromAddress: z.string().default("noreply@example.com"),
  dkimEnabled: z.boolean().default(true),
  spfEnabled: z.boolean().default(true),
  dmarcPolicy: z.enum(["none", "quarantine", "reject"]).default("quarantine"),
  bounceWebhookEnabled: z.boolean().default(true),
  openTrackingEnabled: z.boolean().default(true),
  clickTrackingEnabled: z.boolean().default(true),
  unsubscribeHeaderEnabled: z.boolean().default(true),
  retentionDays: z.number().min(0).default(30),
});

const analyticsConfig = z.object({
  provider: z.enum(["posthog", "mixpanel", "amplitude", "segment", "ga4"]).default("posthog"),
  region: z.enum(["us", "eu", "self-hosted"]).default("us"),
  sessionRecordingEnabled: z.boolean().default(false),
  heatmapsEnabled: z.boolean().default(false),
  autocaptureEnabled: z.boolean().default(true),
  samplingRatePct: z.number().min(0).max(100).default(100),
  piiRedaction: z.boolean().default(true),
  featureFlagsEnabled: z.boolean().default(false),
  experimentsEnabled: z.boolean().default(false),
  retentionDays: z.number().min(0).default(365),
});

const aiProviderConfig = z.object({
  provider: z.enum(["openai", "anthropic", "deepseek", "google", "groq", "mistral"]).default("openai"),
  modelName: z.string().default("gpt-4o"),
  maxTokens: z.number().min(1).default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(1),
  streaming: z.boolean().default(true),
  cachingEnabled: z.boolean().default(true),
  timeoutSec: z.number().min(1).default(60),
  rateLimitRpm: z.number().min(1).default(500),
  rateLimitTpm: z.number().min(1).default(30000),
  fallbackProvider: z.enum(["none", "openai", "anthropic", "deepseek", "google"]).default("none"),
  promptLoggingEnabled: z.boolean().default(false),
});

const oauthProviderConfig = z.object({
  provider: z.enum(["google", "github", "microsoft", "apple", "facebook", "twitter", "discord"]).default("google"),
  scopes: z.string().default("openid email profile"),
  pkceEnabled: z.boolean().default(true),
  refreshTokenEnabled: z.boolean().default(true),
  refreshTokenTtlDays: z.number().min(1).default(30),
  accessTokenTtlMin: z.number().min(1).default(60),
  rotateRefreshTokens: z.boolean().default(true),
  redirectUri: z.string().default("https://app.example.com/auth/callback"),
  audience: z.string().default(""),
  signingAlgorithm: z.enum(["RS256", "ES256", "HS256", "EdDSA"]).default("RS256"),
});

const customThirdPartyConfig = z.object({
  baseUrl: z.string().default("https://api.example.com"),
  slaMs: z.number().min(1).default(1000),
  rateLimit: z.number().min(1).default(100),
  authType: z.enum(["none", "api-key", "bearer", "basic", "oauth2", "mtls"]).default("api-key"),
  apiVersion: z.string().default("v1"),
  retryPolicy: z.enum(["none", "exponential", "linear"]).default("exponential"),
  maxRetries: z.number().min(0).default(3),
  circuitBreakerEnabled: z.boolean().default(true),
  circuitBreakerThresholdPct: z.number().min(1).max(100).default(50),
  timeoutMs: z.number().min(1).default(10000),
  cachingEnabled: z.boolean().default(false),
  cacheTtlSec: z.number().min(0).default(300),
});

export const EXTERNAL_VARIANTS: Variant[] = [
  // custom-third-party first → becomes default for drag-dropped External tiles
  // so subtitle doesn't misleadingly say "Payment API" for renamed nodes.
  { id: "custom-third-party", label: "External Service", description: "Generic third-party API or cloud service", configSchema: customThirdPartyConfig },
  { id: "payment-api", label: "Payment API", iconSlug: "stripe", description: "Payment processor", configSchema: paymentApiConfig },
  { id: "email-service", label: "Email Service", iconSlug: "resend", description: "Transactional email", configSchema: emailServiceConfig },
  { id: "analytics", label: "Analytics", iconSlug: "posthog", description: "Product analytics", configSchema: analyticsConfig },
  { id: "ai-provider", label: "AI Provider", iconSlug: "openai", description: "LLM / AI API", configSchema: aiProviderConfig },
  { id: "oauth-provider", label: "OAuth Provider", iconSlug: "openid", description: "Identity provider", configSchema: oauthProviderConfig },
];
