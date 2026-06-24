# Phase 0 Implementation Report — Skeleton & Auth

- Phase: phase-00-skeleton-and-auth
- Plan: /Volumes/ssd/MyApp/System_design/plans/260624-1113-clapet-clone/
- Status: completed
- Date: 2026-06-24

---

## 1. What Was Built

### File Tree (source files only, excl. node_modules / build / cache)

```
/
├── .editorconfig
├── .gitignore
├── README.md
├── package.json                      — monorepo root, pnpm workspaces
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json
│
├── packages/
│   └── shared/
│       ├── package.json              — @archlet/shared
│       └── src/index.ts              — User type export
│
└── apps/
    ├── api/
    │   ├── package.json              — @archlet/api
    │   ├── wrangler.toml             — D1 binding (archlet-db UUID)
    │   ├── tsconfig.json
    │   ├── .dev.vars                 — BETTER_AUTH_SECRET (not committed)
    │   ├── .dev.vars.example
    │   ├── migrations/
    │   │   └── 0001_better_auth.sql  — user/session/account/verification tables
    │   └── src/
    │       ├── index.ts              — Hono app, CORS, /api/health, auth handler
    │       ├── auth.ts               — Better Auth server + Drizzle/D1 adapter
    │       └── db/
    │           └── schema.ts         — Drizzle SQLite schema (mirrors migration SQL)
    │
    └── web/
        ├── package.json              — @archlet/web
        ├── index.html
        ├── vite.config.ts
        ├── tsconfig.json
        ├── tailwind.config.js
        ├── postcss.config.js
        ├── .env                      — VITE_API_URL=http://localhost:8787 (not committed)
        ├── .env.example
        └── src/
            ├── main.tsx
            ├── app.tsx               — BrowserRouter, routes /, /login, /signup, /d
            ├── globals.css           — Tailwind base/components/utilities
            ├── lib/
            │   ├── auth-client.ts    — Better Auth createAuthClient
            │   └── utils.ts          — cn() helper (clsx + tailwind-merge)
            ├── components/
            │   ├── auth-guard.tsx    — Protected route component
            │   └── ui/
            │       ├── button.tsx
            │       ├── card.tsx
            │       ├── dialog.tsx
            │       ├── form.tsx
            │       ├── input.tsx
            │       ├── label.tsx
            │       └── sonner.tsx
            └── pages/
                ├── landing-page.tsx  — / route
                ├── login-page.tsx    — /login route
                ├── signup-page.tsx   — /signup route
                └── dashboard-page.tsx — /d route (protected, shows Hello {name} + logout)
```

---

## 2. Deferred Items

| Item | Reason |
|---|---|
| Sentry / PostHog | Explicitly deferred to Phase 6 per mission spec |
| GitHub Actions deploy | Explicitly deferred per mission spec |
| Cross-subdomain cookie config | Localhost-only for v0; `sameSite: lax`, `secure: false` |
| Rate limiting | Deferred per mission spec |
| Email verification | Deferred per project decision |
| Remote D1 migration push | Local-only smoke test sufficient for Phase 0 |

---

## 3. Smoke Test Results

### Migration verification
```
$ wrangler d1 execute archlet-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"

Results:
  d1_migrations, sqlite_sequence, _cf_METADATA,
  user, session, account, verification  ✅
```

### Health endpoint
```
$ curl http://localhost:8787/api/health
{"ok":true}  ✅
```

### Signup
```
$ curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@archlet.dev","password":"password123"}'

{"token":"bTTMEDp...","user":{"name":"Test User","email":"test@archlet.dev",...}}  ✅
```

### Login + session cookie
```
$ curl -c /tmp/cookies.txt -X POST http://localhost:8787/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@archlet.dev","password":"password123"}'

{"redirect":false,"token":"HUqw2VE...","user":{...}}  ✅

$ curl -b /tmp/cookies.txt http://localhost:8787/api/auth/get-session

{"session":{"expiresAt":"2026-07-01T04:49:34.000Z",...},"user":{"name":"Test User",...}}  ✅
```

### Typecheck
```
$ pnpm typecheck
Tasks: 2 successful, 2 total  ✅  (no errors)
```

### Build
```
$ pnpm build
@archlet/api:build: Total Upload: 2003.13 KiB / gzip: 342.94 KiB — dry-run OK  ✅
@archlet/web:build: dist/assets/index-*.js 254.83 kB — ✓ built in 1.00s  ✅
Tasks: 2 successful, 2 total  ✅
```

---

## 4. Known Issues / Rough Edges

1. **Drizzle adapter requires explicit schema** — Better Auth's `drizzleAdapter` does NOT auto-discover tables from D1; you must pass `schema` object explicitly. Undocumented in Better Auth Cloudflare integration guide. Fixed by creating `src/db/schema.ts` mirroring the migration SQL.

2. **Better Auth `baseURL` is hardcoded to localhost:8787** in `auth.ts`. Phase 1+: inject via env var (`BETTER_AUTH_URL` binding in wrangler.toml).

3. **API Worker bundle is large: 2003 KiB** — Better Auth pulls in a lot. Consider `better-auth/minimal` entry point in Phase 6 to reduce cold start risk. Currently well within Workers free tier limits.

4. **Zod v4 required** — `better-call` (Better Auth's internal RPC) requires Zod ^4.0.0. Zod v3 (which many guides still show) causes peer-dep warnings. All packages upgraded to Zod v4.

5. **drizzle-orm peer version** — Better Auth ships `@better-auth/drizzle-adapter@1.6.20` which requires `drizzle-orm@^0.45.2`; default install of `^0.44.x` caused peer warnings. Fixed by pinning to `^0.45.2`.

6. **No `pnpm dev` turbo wiring tested end-to-end in browser** — API auth flow verified with curl. Full browser flow (signup → /d → refresh → still authenticated) requires manually running `pnpm dev` and opening http://localhost:5173. Turbo wires both dev servers via `turbo run dev --parallel`; each app has its own `dev` script.

7. **D1 local state location** — Migration and local D1 data live in `apps/api/.wrangler/state/v3/d1/`. This dir is gitignored. Re-running `wrangler d1 migrations apply --local` after a fresh clone is required.

---

## 5. Phase 1 Recommendations

- Add `BETTER_AUTH_URL` as a wrangler binding/env var instead of hardcoding; read it in `auth.ts` from `env`.
- Phase 1 (Canvas Editor) can immediately import `useSession` from `@/lib/auth-client` to get current user context.
- Add `@archlet/api` health check to web's `vite.config.ts` proxy to avoid CORS issues in dev: `server.proxy['/api'] = 'http://localhost:8787'`. This removes need for CORS middleware in dev entirely.
- Consider moving `createAuth(env)` result to a module-level singleton using Hono's `app.use` middleware to avoid re-instantiating Better Auth on every request (performance).
- React Query (`@tanstack/react-query`) should be added in Phase 1 for server state — wrap App in QueryClientProvider.

---

## 6. Unresolved Questions

- Should `BETTER_AUTH_URL` in prod be `https://api.archlet.app` or the Pages URL? Needs decision before deploy.
- Worker bundle 2MB gzipped to 343 KiB — within free tier but worth profiling if cold starts become an issue. Better Auth docs mention `better-auth/minimal` but it's not documented for Drizzle adapter path.
- Is the local `.wrangler/state` D1 data acceptable to keep in each dev's machine, or should there be a seed script? No seed yet — manual signup each fresh clone.
