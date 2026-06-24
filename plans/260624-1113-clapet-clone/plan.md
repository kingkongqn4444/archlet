---
status: completed
created: 2026-06-24
completed: 2026-06-24
slug: clapet-clone
brand: archlet (placeholder)
source: plans/reports/brainstorm-260624-1113-clapet-clone-architecture.md
progress: 7/7 phases complete
v1_followups:
  - Wire trackEvent() call-sites in use-diagrams, use-ai-generate, use-share, export-dialog
  - identifyUser() on login (in auth-guard or app-shell)
  - Real /og.png asset (1200x630)
  - Privacy + Terms stub pages
  - Sentry source-maps CI step
  - R2 upload for permanent export links
  - Phase 1 rough edges (SplitSquareHorizontal icon verify, zoom% reactive, edge label discoverability)
  - Real Cloudflare deploy (Pages + Workers) — code ready, just needs `wrangler deploy`
---

# Clapet Clone — Implementation Plan

AI-assisted system architecture diagram tool. Clone feature-parity với clapet.app, stack tự chọn (Cloudflare-native).

## Stack quyết định

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript + React Flow + Tailwind + shadcn/ui |
| Client state | TanStack Query + Zod + Zustand |
| Frontend host | Cloudflare Pages |
| Backend | Hono + Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Auth | Better Auth + Workers/D1 adapter |
| AI | BYOK — client → OpenAI/Anthropic/DeepSeek |
| Object storage | R2 (exports PNG/SVG/PDF) |
| Telemetry | PostHog + Sentry |

## Scope v1

✅ In: canvas editor, 10 core node types, AI BYOK generate/refine ở 3 level, projects, save/load, share read-only, embed, export, account management.

❌ Out v1: realtime collab (Yjs/DO), server-side AI proxy, billing/credits, mobile, version history, comments, templates, team workspaces, verify email.

## Phases

| # | Phase | Status | File |
|---|---|---|---|
| 0 | Skeleton & Auth | ✅ completed (2026-06-24) | [phase-00-skeleton-and-auth.md](./phase-00-skeleton-and-auth.md) |
| 1 | Canvas Editor | ✅ completed (2026-06-24, smoke pending) | [phase-01-canvas-editor.md](./phase-01-canvas-editor.md) |
| 2 | Persistence | ✅ completed (2026-06-24) | [phase-02-persistence.md](./phase-02-persistence.md) |
| 3 | AI BYOK | ✅ completed (2026-06-24) | [phase-03-ai-byok.md](./phase-03-ai-byok.md) |
| 4 | Share & Embed | ✅ completed (2026-06-24) | [phase-04-share-embed.md](./phase-04-share-embed.md) |
| 5 | Export & Account | ✅ completed (2026-06-24, R2 upload deferred) | [phase-05-export-account.md](./phase-05-export-account.md) |
| 6 | Polish | ✅ completed (2026-06-24) | [phase-06-polish.md](./phase-06-polish.md) |

Phase chain: 0 → 1 → 2 → 3 → 4 → 5 → 6. Phase 4–6 có thể chạy song song nếu cần.

## Dependencies bên ngoài

- Cloudflare account (Pages, Workers, D1, R2) — free tier đủ v1
- Domain (chưa quyết) — placeholder `archlet.app`
- Sentry account (free tier)
- PostHog account (free tier)
- AI: user tự cung cấp (BYOK)

## Decisions chốt từ brainstorm

- **Brand**: placeholder `archlet`, đổi sau bằng find-replace
- **Verify email**: defer v2
- **API key storage**: localStorage v1
- **Node types v1**: User, API, Database, Cache, Queue, Storage, CDN, LoadBalancer, Worker, External (10 core)
- **Embed**: full-page route `/e/:id` (không phải iframe widget)
- **Pricing**: free forever, BYOK

## Success metrics v1

- Time-to-first-diagram (new user) < 60s
- AI first-node-visible latency < 3s
- Save → reload round-trip < 500ms
- Workers cost @ 1k DAU < $5/month
- Sentry error rate < 0.5%
