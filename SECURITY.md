# Security

## Reporting a vulnerability

Email: nhthinh16.dev@gmail.com (replace if forking).
Please don't open a public issue for security bugs.

## What's in the repo

| File | Public-safe? | Note |
|---|---|---|
| `apps/api/wrangler.toml` | ✅ | Cloudflare D1 `database_id` is exposed but useless without account credentials |
| `apps/api/.dev.vars.example` | ✅ | Template only, no real secrets |
| `apps/web/.env.example` | ✅ | Template only |
| `.dev.vars`, `.env` | ⛔ | git-ignored, never committed |

## Pre-deploy checklist

Before deploying to production, you MUST:

- [ ] Generate a strong `BETTER_AUTH_SECRET` (≥32 chars, cryptographic random)
  ```bash
  openssl rand -hex 32
  pnpm -F @archlet/api wrangler secret put BETTER_AUTH_SECRET
  ```
- [ ] Update `BETTER_AUTH_URL` in `apps/api/wrangler.toml` `[vars]` to your worker URL
- [ ] Update `WEB_ORIGIN` to your web origin (Pages URL or custom domain)
- [ ] If forking, replace `database_id` in `wrangler.toml` with your own (`wrangler d1 create`)
- [ ] Enable email verification in Better Auth config (currently `emailVerified: false` default)
- [ ] Review CORS policy in `apps/api/src/index.ts` — dev allows any localhost; prod only `WEB_ORIGIN`
- [ ] If exposing AI Generate via your own key (not BYOK), add per-user rate limiting
- [ ] If multi-tenant: verify Drizzle queries always filter by `user_id` (IDOR prevention)

## BYOK security model

- AI provider keys (Anthropic / OpenAI / DeepSeek) are stored in **browser localStorage only**
- Calls made **directly from browser to provider** (no server proxy by default)
- Server-side proxy (`/api/mentor/chat`) is optional and explicitly opt-in; it accepts the BYOK key per-request and never persists it
- Risks the user accepts when using BYOK: XSS on the page could exfiltrate the key from localStorage — `rehype-sanitize` is applied to user-supplied markdown (chapter notes), but always audit if extending

## Auth session

- Better Auth issues session cookies (HttpOnly, SameSite=Lax)
- Sessions persisted in D1 `session` table
- Auto-expire per Better Auth defaults

## Dependencies

Run `pnpm audit` regularly. CI auto-audit not yet wired — TODO.

## What we don't promise

- This is a **side-project / interview-prep tool**, not enterprise SaaS
- No SOC2, no HIPAA, no PII handling guarantees
- Use at your own risk for sensitive design data
