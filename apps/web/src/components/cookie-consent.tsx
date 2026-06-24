import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  // If already accepted on mount, init analytics
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

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4"
    >
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
        We use analytics (PostHog) to improve Archlet. No data is sold or shared
        with advertisers.
      </p>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={reject}>
          Reject
        </Button>
        <Button size="sm" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  );
}
