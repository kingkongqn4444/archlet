# Phase 0 — Skeleton & Auth

## Context Links
- Brainstorm: `plans/reports/brainstorm-260624-1113-clapet-clone-architecture.md` § 4, 5
- Better Auth Workers adapter: https://better-auth.com/docs/integrations/cloudflare

## Overview
- Priority: P0 (blocks tất cả phase sau)
- Status: pending
- Set up monorepo skeleton, deploy "hello world" frontend + backend, cookie auth chạy được end-to-end.

## Key Insights
- Better Auth Workers adapter còn mới — prototype auth flow TRƯỚC khi build UI, fallback Lucia nếu vỡ.
- D1 binding qua wrangler.toml, Better Auth schema chạy qua D1 migrations.
- Cookie auth cross-subdomain (`app.archlet.app` ↔ `api.archlet.app`) cần CORS `credentials: true` + cookie `domain: .archlet.app` + `sameSite: lax`.

## Requirements
**Functional:**
- User signup với email + password
- Login với email + password, set session cookie
- Logout revoke session
- `/api/auth/get-session` trả về user nếu đăng nhập
- Frontend hiển thị "Hello, {name}" sau login

**Non-functional:**
- Workers cold start < 200ms
- Auth API p95 < 100ms
- Local dev: `wrangler dev` + `vite dev` chạy được offline

## Architecture
```
apps/web (Vite React SPA)
  └─ src/lib/auth-client.ts  (Better Auth client)

apps/api (Hono Workers)
  ├─ src/auth.ts             (Better Auth server + D1 adapter)
  ├─ src/index.ts            (Hono app, CORS, route auth.handler)
  └─ wrangler.toml           (D1 binding, vars)

packages/shared
  └─ schema/                  (Zod schemas dùng chung)
```

## Related Code Files
**Create:**
- `package.json` (workspaces), `pnpm-workspace.yaml`, `turbo.json`
- `apps/web/` (Vite scaffold, Tailwind, shadcn init)
- `apps/api/src/index.ts`, `apps/api/src/auth.ts`, `apps/api/wrangler.toml`
- `apps/api/migrations/0001_better_auth.sql`
- `packages/shared/src/index.ts`
- `.github/workflows/deploy.yml` (deploy Pages + Workers on push main)

## Implementation Steps
1. **Monorepo setup**: pnpm + turborepo, `apps/web` (Vite + React + TS + Tailwind + shadcn), `apps/api` (Hono + Workers + TS).
2. **Cloudflare**: tạo Pages project (link web build), tạo Worker (`api`), tạo D1 database `archlet-db`, bind vào wrangler.toml.
3. **Better Auth backend**: install `better-auth`, configure email+password provider, D1 adapter. Hono mount `app.on(["GET","POST"], "/api/auth/**", c => auth.handler(c.req.raw))`.
4. **Better Auth client**: `apps/web/src/lib/auth-client.ts` với `baseURL: import.meta.env.VITE_API_URL`.
5. **D1 migrations**: run `wrangler d1 migrations apply archlet-db` cho Better Auth schema.
6. **CORS**: Hono `cors({ origin: env.WEB_ORIGIN, credentials: true })`.
7. **Cookie domain**: prod set `cookieOptions.domain = ".archlet.app"`; local `localhost` raw.
8. **Frontend UI**: shadcn Card + Form cho login/signup, route `/login`, `/signup`, protected `/d` (redirect nếu chưa auth).
9. **Deploy**: GitHub Actions deploy web → Pages, api → Workers. Smoke test signup → login → get-session prod.
10. **Telemetry baseline**: Sentry init (DSN env), PostHog init với `autocapture: false` (privacy).

## Todo List
- [ ] Init pnpm monorepo + turborepo + Vite + Hono scaffolds
- [ ] Tailwind + shadcn/ui (button, card, form, input, label)
- [ ] Cloudflare Pages project + Worker + D1 database tạo
- [ ] Better Auth server config trên Workers + D1
- [ ] D1 migrations apply
- [ ] Better Auth client trên web
- [ ] Login/Signup/Logout flow UI
- [ ] CORS + cookie cross-subdomain hoạt động
- [ ] Sentry + PostHog init (web + worker)
- [ ] GitHub Actions deploy pipeline
- [ ] Smoke test prod end-to-end

## Success Criteria
- User signup → login → reload page → vẫn authenticated (cookie persist)
- `wrangler tail` thấy auth requests, không có 500
- Sentry nhận test error từ cả web + worker
- Cost preview: $0 (free tier)

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| Better Auth Workers adapter bug | Med | Test sớm, fallback Lucia nếu vỡ |
| Cookie cross-subdomain config sai | Med | Test prod-like với 2 domain trong staging |
| D1 migration drift giữa env | Low | `wrangler d1 migrations` chuẩn |

## Security Considerations
- Bcrypt cost factor mặc định của Better Auth (12) — OK
- Cookies: `httpOnly`, `secure`, `sameSite: lax`
- CSP minimal v0 (chặt hơn ở Phase 6)
- Rate limit /sign-in: Cloudflare Workers Rate Limiting binding (10 req/min/IP)

## Next Steps
→ Phase 1: Canvas Editor (cần auth + API skeleton từ phase này)
