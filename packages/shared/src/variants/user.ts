import { z } from "zod";
import type { Variant } from "./types";

const webBrowserConfig = z.object({
  concurrentUsers: z.number().min(1).default(1000),
  reqPerSec: z.number().min(1).default(100),
  region: z.string().default("us-east-1"),
  thinkTimeSec: z.number().min(0).default(5),
  sessionLengthMin: z.number().min(1).default(15),
  bounceRatePct: z.number().min(0).max(100).default(40),
  deviceMix: z.enum(["desktop", "mobile", "mixed"]).default("mixed"),
  http2Enabled: z.boolean().default(true),
  cookiesEnabled: z.boolean().default(true),
});

const mobileAppConfig = z.object({
  concurrentUsers: z.number().min(1).default(5000),
  reqPerSec: z.number().min(1).default(200),
  platforms: z.enum(["ios", "android", "both"]).default("both"),
  minOsVersion: z.string().default("iOS 15 / Android 9"),
  offlineModeEnabled: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  backgroundSyncIntervalMin: z.number().min(1).default(15),
  apiTimeoutMs: z.number().min(100).default(10000),
  retryPolicy: z.enum(["none", "exponential", "linear"]).default("exponential"),
  analyticsSdk: z.enum(["none", "firebase", "amplitude", "mixpanel"]).default("firebase"),
});

const desktopAppConfig = z.object({
  concurrentUsers: z.number().min(1).default(500),
  reqPerSec: z.number().min(1).default(50),
  os: z.enum(["windows", "macos", "linux", "cross"]).default("cross"),
  autoUpdate: z.boolean().default(true),
  updateChannel: z.enum(["stable", "beta", "nightly"]).default("stable"),
  telemetryEnabled: z.boolean().default(true),
  crashReporter: z.enum(["none", "sentry", "bugsnag", "rollbar"]).default("sentry"),
  installerType: z.enum(["msi", "dmg", "deb", "rpm", "appimage", "snap"]).default("msi"),
  startWithOs: z.boolean().default(false),
});

export const USER_VARIANTS: Variant[] = [
  { id: "web-browser", label: "Web Browser", iconSlug: "googlechrome", description: "Web client traffic", configSchema: webBrowserConfig },
  { id: "mobile-app", label: "Mobile App", iconSlug: "android", description: "iOS / Android clients", configSchema: mobileAppConfig },
  { id: "desktop-app", label: "Desktop App", iconSlug: "electron", description: "Desktop application", configSchema: desktopAppConfig },
];
