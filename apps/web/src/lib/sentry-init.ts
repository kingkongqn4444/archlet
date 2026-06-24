import * as Sentry from "@sentry/react";

const API_KEY_PATTERN = /sk-[a-z0-9_-]{20,}/gi;

function stripApiKeys(value: string): string {
  return value.replace(API_KEY_PATTERN, "[REDACTED]");
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return; // NO-OP if unset

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Strip any BYOK API keys from breadcrumbs and extras
      try {
        const serialized = JSON.stringify(event);
        const cleaned = stripApiKeys(serialized);
        return JSON.parse(cleaned);
      } catch {
        return event;
      }
    },
  });
}
