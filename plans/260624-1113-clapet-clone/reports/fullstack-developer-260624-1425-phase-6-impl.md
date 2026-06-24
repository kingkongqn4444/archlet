# Phase 6 Implementation Report

## Phase
- Phase: phase-06-polish
- Plan: /Volumes/ssd/MyApp/System_design/plans/260624-1113-clapet-clone
- Status: completed

---

## 1. File Tree

```
apps/web/
├── index.html                                  ← SEO meta, OG tags, Twitter card
├── vite.config.ts                              ← manualChunks added
├── public/
│   ├── _headers                               ← CSP hardened (all routes + /e/* override)
│   ├── robots.txt                             ← NEW
│   └── sitemap.xml                            ← NEW (/ + /signup)
└── src/
    ├── main.tsx                               ← initSentry() before render; analytics via consent
    ├── app.tsx                                ← lazy routes, ErrorBoundary, CookieConsent, NotFoundPage
    ├── globals.css                            ← dark mode xyflow chrome CSS added
    ├── lib/
    │   ├── sentry-init.ts                     ← NEW
    │   └── analytics.ts                       ← NEW (PostHog)
    ├── components/
    │   ├── cookie-consent.tsx                 ← NEW
    │   └── error-boundary.tsx                 ← NEW
    └── pages/
        ├── landing-page.tsx                   ← REWRITTEN (hero, features, pricing, FAQ, footer)
        └── not-found-page.tsx                 ← NEW
```

---

## 2. Bundle Size — Vite Build Output

```
dist/assets/embed-page-*.js           1.14 kB │ gzip:   0.61 kB
dist/assets/shared-page-*.js          1.33 kB │ gzip:   0.70 kB
dist/assets/canvas-page-*.js          2.76 kB │ gzip:   1.33 kB
dist/assets/workspace-page-*.js       6.52 kB │ gzip:   2.34 kB
dist/assets/account-page-*.js        14.04 kB │ gzip:   4.38 kB
dist/assets/vendor-tanstack-*.js     49.87 kB │ gzip:  15.35 kB
dist/assets/canvas-editor-*.js       51.61 kB │ gzip:  15.44 kB
dist/assets/vendor-react-*.js       156.58 kB │ gzip:  51.41 kB
dist/assets/vendor-xyflow-*.js      185.10 kB │ gzip:  60.28 kB
dist/assets/index-*.js              330.03 kB │ gzip: 107.33 kB   ← app shell + routing
dist/assets/vendor-export-*.js      404.60 kB │ gzip: 134.23 kB   ← html-to-image + jsPDF (lazy)
```

**Landing route load (before any lazy chunk):** `vendor-react` (51KB) + `index.js` (107KB) + CSS (6KB) ≈ **~165KB gzip**. This exceeds the 250KB target by margin. `vendor-export` (134KB) is correctly split — only loads when user opens ExportDialog.

**Note:** `index.js` at 107KB gzip is larger than ideal because it includes posthog-js, @sentry/react, zustand, and other app-wide deps. Further splitting posthog/sentry into a lazy analytics chunk would reduce this to ~80KB, which is a v2 follow-up.

---

## 3. CSP `_headers` Explanation

**Before:** Only `/e/*` override existed (frame-ancestors *). No global CSP.

**After:**
- `/*` — strict default: `frame-ancestors 'none'`, blocks cross-origin framing of app pages. `script-src` includes `'unsafe-inline'` (required for Vite-injected inline module preload scripts in v1; can be removed with a CSP nonce plugin in v2). `connect-src` allows localhost:8787 (dev worker), api.archlet.app (prod), AI provider APIs, Sentry ingest, PostHog.
- `/e/*` — embed route override: `frame-ancestors *` (allows embedding anywhere), no `X-Frame-Options` (clears inherited value). Only connect-src allows archlet API (no AI providers needed for read-only embed).

---

## 4. Sentry / PostHog Wiring (env-aware NO-OP)

**Sentry (`lib/sentry-init.ts`):**
- Called in `main.tsx` before `createRoot()`.
- If `VITE_SENTRY_DSN` is unset → returns immediately, zero overhead.
- `beforeSend` hook: serializes event → strips `/sk-[a-z0-9_-]{20,}/gi` matches (BYOK keys) → re-parses. Prevents API key leakage via breadcrumbs/extras.
- Uses `browserTracingIntegration`, `tracesSampleRate: 0.1`.

**PostHog (`lib/analytics.ts`):**
- NOT initialized at startup. `initAnalytics()` is called by `CookieConsent` only after user clicks "Accept".
- If `VITE_POSTHOG_KEY` is unset → `initAnalytics()` is a NO-OP.
- In DEV mode, calls `opt_out_capturing()` to avoid polluting production analytics.
- Exports: `identifyUser(userId, traits)`, `resetUser()`, `trackEvent(event, properties)`.
- Typed event union: `diagram_created | ai_generate_started | ai_generate_completed | share_created | export_downloaded`.

**Cookie Consent (`components/cookie-consent.tsx`):**
- Reads `localStorage.archlet_consent` on mount.
- If already `"accepted"` → calls `initAnalytics()` immediately.
- Shows banner only when consent is `null`.
- "Accept" → stores, sets state, inits analytics. "Reject" → stores, hides banner, no analytics.

---

## 5. Known Issues

- `index.js` chunk (107KB gzip) includes posthog-js + @sentry/react even though they're conditionally no-ops. These could be moved into a lazy `analytics` chunk to shave ~25KB from initial load.
- `vendor-export` (134KB gzip) is correctly deferred but `html2canvas.esm` (48KB gzip) lands in `index.js` — it's a transitive dep of `html-to-image` that Rollup pulls in eagerly. Needs dynamic import wrapping in export utilities to fully defer.
- No OG image (`/og.png`) asset — placeholder URL in meta tags, will 404 until a real image is designed.
- No `/privacy` or `/terms` pages — links in footer route to `NotFoundPage` (404). Acceptable for v1 launch.
- `dark:bg-slate-800` on Button `ghost` variant in landing nav not applied (Button component uses hardcoded `hover:bg-slate-100` with no dark variant). Minor visual polish needed.

---

## 6. v2 Follow-ups

1. **Lazy analytics chunk** — dynamic import posthog-js + @sentry/react to cut initial JS by ~25KB gzip.
2. **Dynamic import html-to-image** inside export utilities to remove `html2canvas` from initial bundle.
3. **OG image** — design 1200×630 PNG with canvas screenshot; upload to `public/og.png`.
4. **Privacy / Terms pages** — stub pages with basic legal copy.
5. **CSP nonce** — replace `'unsafe-inline'` in script-src with Vite CSP nonce plugin for stricter policy.
6. **PostHog identify on login** — wire `identifyUser()` into auth flow (useSession change in auth-client.ts).
7. **Track events at call-sites** — wire `trackEvent('diagram_created')` in use-diagrams, `ai_generate_started/completed` in use-ai-generate, `share_created` in use-share, `export_downloaded` in export-dialog.
8. **Dark mode Button variants** — add `dark:` classes to ghost/outline variants in button.tsx.
9. **Lighthouse audit** — run after real deployment to verify LCP < 1.8s target.
10. **Sentry source maps CI step** — `sentry-cli sourcemaps upload` in GitHub Actions after build.
