import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { initAnalytics } from "@/lib/analytics";

const STORAGE_KEY = "archlet_consent";

type Consent = "accepted" | "rejected" | null;

function getStoredConsent(): Consent {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Consent) ?? null;
  } catch {
    return null;
  }
}

function storeConsent(value: "accepted" | "rejected"): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(getStoredConsent);

  useEffect(() => {
    if (consent === "accepted") initAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (consent !== null) return null;

  function accept() {
    storeConsent("accepted");
    setConsent("accepted");
    initAnalytics();
  }

  function reject() {
    storeConsent("rejected");
    setConsent("rejected");
  }

  // Slim pill anchored bottom-left. The sidebar takes 240px; we sit on top
  // of its bottom edge (small, dismissible). This avoids the busy spots:
  //   - Level switcher toolbar (bottom-center)
  //   - React Flow controls (bottom-right)
  //   - Top header + top toolbar pill
  // Content-sized so the rest of the screen is fully interactive.
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-3 left-3 z-30
                 inline-flex items-center gap-3 pl-3.5 pr-2 py-1
                 rounded-full text-[11.5px]
                 bg-white/95 dark:bg-plum-900/85 backdrop-blur
                 border border-cream-200 dark:border-plum-700/40
                 shadow-soft max-w-[calc(100vw-2rem)]"
    >
      <span className="text-ink-700 dark:text-cream-100/90 leading-tight truncate">
        Analytics (PostHog) helps us improve Archlet.
      </span>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={reject}
          className="px-2 py-0.5 rounded-full text-[11px] font-medium text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          Reject
        </button>
        <button
          onClick={accept}
          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-cream-50 bg-plum-700 hover:bg-plum-600 transition"
        >
          Accept
        </button>
        <button
          onClick={reject}
          aria-label="Dismiss"
          className="ml-0.5 p-1 rounded-full text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}
