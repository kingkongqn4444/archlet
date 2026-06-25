---
status: pending
created: 2026-06-24
owner: kingkongqn4444
brainstorm: ../reports/brainstormer-260624-2337-system-design-mentor-feature.md
---

# System Design Mentor Feature

Feature trong app `System_design`: học toàn bộ 28 chapter của repo `liquidslr/system-design-notes` (notes sách Alex Xu) thông qua canonical templates + AI mentor + persistent memory.

## Goal

Personal learning tool: drag-drop 28 canonical system-design diagrams, chat với AI mentor về từng chapter, memory xuyên session, BYOK LLM key.

## Stack

Cloudflare Workers + D1 + Better-Auth (apps/api), Vite/React + xyflow (apps/web), shared package (Zod schemas + catalogs), pnpm + turbo monorepo.

## Phases

| # | Phase | Status | Effort | File |
|---|---|---|---|---|
| 1 | Content ingestion + 28 templates | pending | 10–12d | [phase-01-content-ingestion-and-templates.md](./phase-01-content-ingestion-and-templates.md) |
| 2 | AI Mentor core (chat + BYOK + D1 + history) | pending | 3–4d | [phase-02-ai-mentor-core.md](./phase-02-ai-mentor-core.md) |
| 3 | Polish: inline Explain + progress + notes | pending | 2–3d | [phase-03-polish-and-inline-explain.md](./phase-03-polish-and-inline-explain.md) |
| 4 | RAG with Cloudflare Vectorize | pending | 3–4d | [phase-04-rag-with-vectorize.md](./phase-04-rag-with-vectorize.md) |

**Total:** ~18–23 ngày solo.

## Key Decisions (from brainstorm)

- 28 templates phase 1 (no cut)
- KEEP RAG (phase 4, học Vectorize)
- Fetch chapter markdown raw từ GitHub (no mirror — IP safe)
- BYOK Anthropic/OpenAI lưu localStorage encrypted
- LLM proxy qua `apps/api/src/routes/mentor.ts`
- D1: 3 new tables (`mentor_chats`, `chapter_progress`, `chapter_summary_cache`)

## Dependencies between phases

- Phase 2 cần D1 schema từ phase 1? **No** — phase 1 không touch D1. Phase 2 self-contained D1 migration.
- Phase 3 cần phase 2 (mentor.ts route + chat sidebar exist)
- Phase 4 cần phase 2 (mentor.ts để inject retrieval)

## Out of Scope (defer)

- Multi-user / public deployment
- Apple/Google SSO cho mentor (BYOK đủ)
- Mobile responsive cho chat panel
- Voice input cho chat
- Auto-suggest variant khi drag (cross-feature; phase 5+)

## Risks

- 28 templates handcraft = grind. Có thể abandoned giữa chừng → ship templates **rolling**, không block phase 2 nếu chỉ <14 templates xong.
- BYOK key leak → strict localStorage + never log + Workers không persist.
- Markdown licensing (Alex Xu book notes) → fetch GitHub raw runtime, never mirror to git.
- Cloudflare 30s timeout → SSE streaming bắt buộc.
- RAG over-engineering → phase 4 isolated, có thể defer/skip nếu chán.
