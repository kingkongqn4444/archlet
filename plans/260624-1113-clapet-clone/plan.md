---
status: in_progress
created: 2026-06-24
slug: clapet-clone
brand: archlet (placeholder)
source: plans/reports/brainstorm-260624-1113-clapet-clone-architecture.md
progress: 3/7 phases complete
last_session: 2026-06-24 14:25 phase-2 persistence done; reviewer 8.5/10 → 9.5+ after fixing C1 (name overwrite), H1/H2 (rename via PATCH + updatedAt required on PUT), H3 (global 401 handler), H4 (sidebar sync)
next_session_start: phase-3 AI BYOK (OpenAI/Anthropic/DeepSeek streaming tool-call adapters); phase-1 rough edges still deferred (do in phase-6 polish)
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
| 3 | AI BYOK | pending | [phase-03-ai-byok.md](./phase-03-ai-byok.md) |
| 4 | Share & Embed | pending | [phase-04-share-embed.md](./phase-04-share-embed.md) |
| 5 | Export & Account | pending | [phase-05-export-account.md](./phase-05-export-account.md) |
| 6 | Polish | pending | [phase-06-polish.md](./phase-06-polish.md) |

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
