import posthog from "posthog-js";

let _initialized = false;

export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

  if (!key) return; // NO-OP if unset

  posthog.init(key, {
    api_host: host,
    autocapture: false,
    capture_pageview: true,
    loaded(ph) {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
  _initialized = true;
}

export function identifyUser(userId: string, traits?: { email?: string }): void {
  if (!_initialized) return;
  posthog.identify(userId, traits);
}

export function resetUser(): void {
  if (!_initialized) return;
  posthog.reset();
}

type AnalyticsEvent =
  | "diagram_created"
  | "ai_generate_started"
  | "ai_generate_completed"
  | "share_created"
  | "export_downloaded";

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>
): void {
  if (!_initialized) return;
  posthog.capture(event, properties);
}

export { posthog };
