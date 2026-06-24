# Phase 0 Code Review — Skeleton & Auth

- Date: 2026-06-24
- Reviewer: code-reviewer
- Scope: 37 files, ~651 LOC source (excl. config/SQL)
- Plan: `phase-00-skeleton-and-auth.md`
- Impl report: `fullstack-developer-260624-1135-phase-0-impl.md`

---

## TL;DR

**Score: 8.7 / 10** — solid, idiomatic, well-scoped Phase 0. Below 9.5 auto-approve threshold due to 3 real correctness/security issues (P-1 cookie config, hardcoded baseURL, baked dev secret in `.dev.vars.example`). All are fixable in <30 minutes. Approve with required fixes before Phase 1 starts.

**Critical issues: 3**
**Non-critical: 8**

---

## Score breakdown

| Dimension | Score | Note |
|---|---|---|
| Security | 7.5 | Cookie `secure: false` hardcoded; example file contains live dev secret; no `BETTER_AUTH_URL` env binding |
| Correctness | 9.0 | Auth flow verified working; types clean; one functional smell (no `trustedOrigins` in Better Auth config) |
| YAGNI/KISS/DRY | 9.5 | Tight scope; only `dialog.tsx` is unused for Phase 0 |
| Conventions | 9.5 | kebab-case respected, all files <100 lines, zero `any` |
| Phase discipline | 10 | No canvas/AI/share/export leakage |

---

## Critical issues (must-fix before Phase 1)

### C1 — Cookie `secure: false` hardcoded; not env-gated
**File:** `apps/api/src/auth.ts:31`
```ts
secure: false,
```
Phase 1 will likely deploy to staging or `wrangler dev --remote`. Shipping `secure: false` to any HTTPS context = session cookie sent over HTTP → MITM-able. Risk grows the moment someone runs `wrangler deploy`.

**Fix:** gate via env (`process.env.NODE_ENV === "production"` won't work in Workers — use a binding like `env.ENVIRONMENT === "production"` from `wrangler.toml`):
```ts
secure: env.ENVIRONMENT === "production",
```
And add `[vars] ENVIRONMENT = "development"` to wrangler.toml plus a prod override.

### C2 — `BETTER_AUTH_URL` / `baseURL` hardcoded to localhost
**File:** `apps/api/src/auth.ts:16`
```ts
baseURL: "http://localhost:8787",
```
Hardcoded literal means Better Auth will emit absolute URLs (e.g., in email-verification flows later, in CSRF token issuance) pointing at localhost. This bites in Phase 1 the moment the API runs anywhere else. Plan doc explicitly calls this out as needed for cross-subdomain. Impl report § 5 acknowledges this.

**Fix:** add `BETTER_AUTH_URL` to `Env` type, read from `env.BETTER_AUTH_URL`, and add to wrangler.toml `[vars]` (dev) + secret/var (prod).

### C3 — `.dev.vars.example` contains a real-looking secret value, identical to `.dev.vars`
**Files:** `apps/api/.dev.vars`, `apps/api/.dev.vars.example`
```
BETTER_AUTH_SECRET=dev-secret-change-in-prod-32chars!!
```
Both files have the same value. The "example" file is committed (it's whitelisted via `!.env.example` pattern in `.gitignore` — though `.dev.vars.example` isn't actually whitelisted; check below). Two problems:
1. New devs will copy `.example` → `.dev.vars` and ship the same secret. Anyone reading the repo knows the dev secret.
2. `.gitignore` whitelists `!.env.example`, NOT `!.dev.vars.example` — so `.dev.vars.example` is **gitignored too** (matched by `.dev.vars` pattern + `.env*` pattern). The file likely isn't tracked. Verify with `git ls-files`.

**Fix:**
- Make example value clearly a placeholder: `BETTER_AUTH_SECRET=__replace_me_with_openssl_rand_base64_32__`.
- Add `!.dev.vars.example` to `.gitignore` to ensure the example IS tracked.
- Document `openssl rand -base64 32` in README.

---

## Non-critical suggestions

### N1 — Better Auth missing `trustedOrigins`
**File:** `apps/api/src/auth.ts`
Without explicit `trustedOrigins: ["http://localhost:5173"]`, Better Auth's CSRF/origin checks may rely on `baseURL` only and fall over once `baseURL` is unhardcoded (C2). Tie this fix to C2.

### N2 — `createAuth(c.env)` called every request
**File:** `apps/api/src/index.ts:20-22`
Re-instantiates Better Auth (Drizzle adapter, schema, config) on every request. Free-tier OK, but unnecessary work. Impl report § 5 already flags this.

**Fix:** memoize via `WeakMap<Env, ReturnType<typeof createAuth>>` or Hono middleware that caches per-request and reuses the instance across the request lifetime.

### N3 — `Env` type lives in `auth.ts`
Mixing the global Bindings type with the auth module creates a circular conceptual dep. Move `Env` to `apps/api/src/env.ts` or `apps/api/src/types.ts`. Trivial.

### N4 — `dialog.tsx` is unused in Phase 0 (YAGNI)
**File:** `apps/web/src/components/ui/dialog.tsx`
61 LOC of code that's not imported anywhere in Phase 0. Plan only mandates `button, card, form, input, label`. Delete it; re-add in the phase that needs it (likely Phase 2 share/export).

Also note: this hand-rolled Dialog has no focus trap, no Esc-to-close, no `aria-modal` — would be a real a11y issue if used as-is. Better to delete now and replace with `@radix-ui/react-dialog` when needed.

### N5 — `secret` defaults silently if env var missing
**File:** `apps/api/src/auth.ts:15`
```ts
secret: env.BETTER_AUTH_SECRET,
```
If `BETTER_AUTH_SECRET` is undefined, Better Auth either throws cryptic errors or generates an ephemeral secret per cold-start (invalidating all sessions). Add a guard:
```ts
if (!env.BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET required");
```

### N6 — Form lacks client-side password length check
**File:** `apps/web/src/pages/signup-page.tsx:75`
`minLength={8}` is a browser HTML hint, easily bypassed by users disabling JS or via API direct. The real check happens on Better Auth server (default min: 8). That's fine for now, but the inconsistent UX (server rejects with generic error) is a Phase 1 polish item. KISS-acceptable for v0.

### N7 — `auth-client.ts` env var access via bracket notation
**File:** `apps/web/src/lib/auth-client.ts:4`
```ts
baseURL: import.meta.env["VITE_API_URL"] ?? "http://localhost:8787",
```
Works due to `noUncheckedIndexedAccess: true` in `tsconfig.base.json`. Cleaner: use `import.meta.env.VITE_API_URL` with a `vite-env.d.ts` declaration. Pure style — leave.

### N8 — `globals.css` has only `box-sizing` reset
Tailwind already includes `* { box-sizing: border-box }` via preflight. The 3-line rule in `globals.css` is redundant. Delete for DRY.

---

## Positive observations

| What | Why it's good |
|---|---|
| `tsconfig.base.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | Far stricter than typical scaffolds — catches real bugs early |
| Zero `any` usages across 651 LOC | High type discipline |
| All files <100 lines (largest: signup-page.tsx at 95) | Easy AI/human context windows |
| kebab-case file naming consistent throughout | Matches rules |
| `try/catch` in form handlers + finally for loading state | Defensive UX |
| `Navigate replace` on protected route | Correct (no back-button trap to /d) |
| `autoComplete` attrs on email/password inputs | A11y + password manager friendly |
| `StrictMode` enabled in `main.tsx` | Surfaces effect bugs |
| Drizzle schema mirrors SQL migration exactly | Single source of truth for table shape |
| `migrations/0001_better_auth.sql` uses `CREATE TABLE IF NOT EXISTS` + `ON DELETE CASCADE` | Idempotent + referentially clean |
| `compatibility_flags = ["nodejs_compat"]` | Needed for Better Auth — correctly set |
| Phase scope discipline: no canvas, no AI, no share, no export, no Sentry/PostHog | Plan-aligned |
| Hono CORS with `credentials: true` | Correct for cookie auth |
| `Toaster` wrapped, sonner used for both success + error UX | DRY user feedback layer |
| Workspace `@archlet/shared` already wired even though it only exports one type | Skeleton ready for Phase 1+ |

---

## Edge cases scouted (not in diff)

| Scenario | Status |
|---|---|
| User opens `/d` then logs out in another tab | `useSession` will re-fetch on focus? Better Auth React hook needs verification — likely OK, but untested. |
| Browser blocks third-party cookies (cross-subdomain) | Deferred — localhost only for now; will bite at deploy. C1+C2 fixes set up the right shape. |
| `signOut()` failure → toast still shows "Logged out" | `dashboard-page.tsx:11-14` doesn't `await` failure-handle. Minor UX bug. |
| Race: user clicks "Sign in" twice fast | `loading` state disables button after first click. OK. |
| Session expired but cookie present | Better Auth returns `null` session → AuthGuard redirects. OK. |
| Empty/whitespace name on signup | Browser `required` only checks empty string — `"   "` would slip through. Phase 1 polish. |
| CORS preflight with non-standard header (e.g., `X-Request-ID` later) | `allowHeaders` is locked to `["Content-Type", "Authorization"]` — will reject when Phase 1 adds custom headers. |
| D1 migration replay (`IF NOT EXISTS`) | Safe — idempotent. |
| Worker bundle 2MB → cold start | Impl report flags; within free-tier; not a Phase 0 blocker. |

---

## Convention / style nits (low priority, batch-fix anytime)

- `apps/web/src/components/auth-guard.tsx:4` — `React.ReactNode` used without `import * as React` (works because TSX-jsx-runtime injects React namespace, but explicit import would silence some linters). Skip.
- `dashboard-page.tsx:27` — `session?.user.name` mixes optional+non-optional chaining. Safe given the AuthGuard above ensures session is non-null. Pedantic.
- `turbo.json` — `"outputs": ["dist/**", ".next/**"]` includes `.next/**` but there's no Next.js app. Cruft from template, remove.
- `tailwind.config.js` — `theme.extend: {}` empty object — harmless template default.
- `apps/web/package.json` — `@tailwindcss/forms` installed but not referenced in `tailwind.config.js plugins`. Either wire it or remove.
- `tsconfig.json` (web) — `"types": ["vite/client", "node"]` includes `node` types in a browser project; harmless but unnecessary.

---

## Phase 0 plan TODO checklist verification

| Plan TODO | Status |
|---|---|
| Init pnpm monorepo + turborepo + Vite + Hono scaffolds | done |
| Tailwind + shadcn/ui (button, card, form, input, label) | done (+ extra: dialog, sonner) |
| Cloudflare Pages + Worker + D1 created | D1 ID in wrangler.toml (`f9221fe1-…`); Pages/Worker setup not verified in repo (deferred) |
| Better Auth server config Workers + D1 | done |
| D1 migrations apply | done (local, per smoke test) |
| Better Auth client on web | done |
| Login/Signup/Logout flow UI | done |
| CORS + cookie cross-subdomain | partial — CORS done, cross-subdomain cookie NOT done (deferred per impl report; OK for now, but C1+C2 needed before deploy) |
| Sentry + PostHog init | deferred (per spec) |
| GitHub Actions deploy pipeline | deferred (per spec) |
| Smoke test prod end-to-end | partial — local smoke only |

Deferrals are explicitly authorized in the mission spec — not counted against the score.

---

## Required actions before Phase 1 starts

1. Fix C1 (cookie `secure` env-gated)
2. Fix C2 (`BETTER_AUTH_URL` from env binding) + add `trustedOrigins` (N1)
3. Fix C3 (`.dev.vars.example` placeholder value + verify gitignore tracking)
4. Add `if (!env.BETTER_AUTH_SECRET) throw` guard (N5)

Estimated effort: 20–30 min. All other items can be done in Phase 1 alongside their motivating features.

---

## Unresolved questions

- Is `wrangler.toml` D1 `database_id` a real provisioned resource or a placeholder UUID? If real, this is OK to commit (D1 IDs aren't sensitive). If placeholder, document so.
- Should `apps/api/.dev.vars.example` be added to `.gitignore` allowlist (`!.dev.vars.example`) to ensure it's tracked? Verify with `git ls-files apps/api/.dev.vars.example`.
- Confirm: is the dialog component slated for use in any Phase 0 path I missed, or genuinely dead code?

---

## Final

**Score: 8.7 / 10** — below the 9.5 auto-approve threshold; 3 critical issues need fixing.
**Recommendation: APPROVE WITH REQUIRED FIXES** — Phase 1 can start as soon as C1, C2, C3 (+N1, N5) are addressed.
